"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var HaConnectorService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaConnectorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const ws_1 = __importDefault(require("ws"));
const types_1 = require("../../common/types");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let HaConnectorService = HaConnectorService_1 = class HaConnectorService {
    constructor(config, eventEmitter, prisma) {
        this.config = config;
        this.eventEmitter = eventEmitter;
        this.prisma = prisma;
        this.logger = new common_1.Logger(HaConnectorService_1.name);
        this.ws = null;
        this.messageId = 1;
        this.connected = false;
        this.reconnectCount = 0;
        this.reconnectTimer = null;
        this.reconnectDelay = 1000;
        this.maxReconnectDelay = 30000;
        this.destroyed = false;
        this.authenticated = false;
        this.pendingResults = new Map();
        this.eventEmitter.on('SYSTEM_CONFIG_UPDATED', () => {
            this.logger.log('检测到配置更新，强制重连...');
            this.destroyed = false;
            this.cleanup();
            this.connect();
        });
    }
    async onModuleInit() {
        this.connect();
    }
    onModuleDestroy() {
        this.destroyed = true;
        this.cleanup();
    }
    async getStatus() {
        const { haUrl } = await this.getDynamicConfig();
        return {
            connected: this.connected,
            ha_url: haUrl,
            ha_version: this.haVersion,
            last_connected_at: this.lastConnectedAt,
            reconnect_count: this.reconnectCount,
        };
    }
    callService(domain, service, entityId, serviceData, returnResponse) {
        if (!this.connected || !this.ws) {
            return Promise.reject(new Error('HA 未连接'));
        }
        const id = this.messageId++;
        const payload = {
            id,
            type: 'call_service',
            domain,
            service,
            target: {
                entity_id: entityId,
            },
            service_data: {
                entity_id: entityId,
                ...(serviceData || {}),
            },
        };
        if (returnResponse) {
            payload.return_response = true;
        }
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (this.pendingResults.has(id)) {
                    this.pendingResults.delete(id);
                    reject(new Error(`服务调用超时: ${domain}.${service}`));
                }
            }, 10000);
            this.pendingResults.set(id, { resolve, reject, timeout });
            this.ws?.send(JSON.stringify(payload));
            this.logger.debug(`[命令已发送] ID ${id}: ${domain}.${service}`);
        });
    }
    async fetchHistory(entityIds, hours) {
        const { haUrl, token } = await this.getDynamicConfig();
        if (!haUrl || !token) {
            throw new Error('Home Assistant URL 或 Token 未配置，请检查设置。');
        }
        const startTime = new Date(Date.now() - hours * 3600 * 1000).toISOString();
        const entityFilter = entityIds.join(',');
        const url = `${haUrl}/api/history/period/${startTime}?filter_entity_id=${entityFilter}&minimal_response=true`;
        this.logger.debug(`正在获取 ${entityIds.length} 个实体的历史记录，起始时间: ${startTime}`);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text().catch(() => '无错误信息');
                this.logger.error(`HA 历史 API 错误 [${response.status}]: ${errorText}`);
                return [];
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error.name === 'AbortError') {
                this.logger.error(`HA 历史获取超时 (15秒)，共 ${entityIds.length} 个实体。`);
            }
            else {
                this.logger.error(`获取 HA 历史失败: ${error.message || error}`);
            }
            return [];
        }
    }
    async fetchMediaImage(path) {
        const { haUrl, token } = await this.getDynamicConfig();
        if (!haUrl || !token)
            throw new Error('HA 未配置');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        const url = `${haUrl}${cleanPath}`;
        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error(`HA 返回错误状态码 ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            return { data: buffer, contentType };
        }
        catch (e) {
            this.logger.error(`代理 HA 图片失败 ${url}: ${e.message}`);
            throw e;
        }
    }
    async getDynamicConfig() {
        let haUrl = this.config.get('HA_URL', '');
        let token = this.config.get('HA_TOKEN', '');
        try {
            const record = await this.prisma.projectConfig.findUnique({
                where: { projectId: 'default' },
            });
            if (record?.layout) {
                const layout = JSON.parse(record.layout);
                if (layout.haConfig) {
                    haUrl = layout.haConfig.url || haUrl;
                    token = layout.haConfig.token || token;
                }
            }
        }
        catch (e) { }
        haUrl = haUrl?.replace(/\/$/, '');
        return { haUrl, token };
    }
    async connect() {
        if (this.destroyed)
            return;
        const { haUrl, token } = await this.getDynamicConfig();
        if (!haUrl || !token) {
            this.logger.warn('⚠️ Home Assistant 未配置 (HA_URL/HA_TOKEN 缺失)。等待中...');
            this.eventEmitter.emit(types_1.HA_EVENTS.DISCONNECTED, { reason: 'unconfigured' });
            return;
        }
        const normalizedUrl = haUrl.replace(/\/$/, '');
        const wsUrl = normalizedUrl.replace(/^http/, 'ws') + '/api/websocket';
        this.logger.log(`正在连接 HA WebSocket: ${wsUrl}`);
        try {
            this.ws = new ws_1.default(wsUrl);
            this.setupEventHandlers();
        }
        catch (err) {
            this.logger.error(`创建 WebSocket 失败: ${err}`);
            this.scheduleReconnect();
        }
    }
    setupEventHandlers() {
        if (!this.ws)
            return;
        this.ws.on('open', () => {
            this.logger.log('WebSocket 连接已打开，等待认证...');
        });
        this.ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                this.handleMessage(msg);
            }
            catch (err) {
                this.logger.error(`解析消息失败: ${err}`);
            }
        });
        this.ws.on('close', (code, reason) => {
            const wasConnected = this.connected;
            this.connected = false;
            this.authenticated = false;
            if (wasConnected) {
                this.logger.warn(`WebSocket 已关闭: ${code} ${reason}`);
                this.eventEmitter.emit(types_1.HA_EVENTS.DISCONNECTED, {
                    reason: reason?.toString() || 'unknown',
                });
            }
            if (!this.destroyed) {
                this.scheduleReconnect();
            }
        });
        this.ws.on('error', (err) => {
            this.logger.error(`WebSocket 错误: ${err.message}`);
        });
    }
    handleMessage(msg) {
        const type = msg.type;
        switch (type) {
            case 'auth_required':
                this.authenticate();
                break;
            case 'auth_ok':
                this.onAuthOk(msg);
                break;
            case 'auth_invalid':
                this.logger.error('HA 认证失败。请检查 .env 中的 HA_TOKEN');
                this.logger.error('停止重连尝试 (无效的Token)。');
                this.destroyed = true;
                this.cleanup();
                this.eventEmitter.emit(types_1.HA_EVENTS.DISCONNECTED, { reason: 'auth_invalid' });
                break;
            case 'result':
                this.handleResult(msg);
                break;
            case 'event':
                this.handleEvent(msg);
                break;
            default:
                break;
        }
    }
    async authenticate() {
        const { token } = await this.getDynamicConfig();
        if (!token) {
            this.logger.error('HA_TOKEN 未在数据库或 .env 中设置!');
            return;
        }
        this.logger.log('正在发送认证Token...');
        this.ws?.send(JSON.stringify({ type: 'auth', access_token: token }));
    }
    onAuthOk(msg) {
        this.authenticated = true;
        this.connected = true;
        this.haVersion = msg.ha_version;
        this.lastConnectedAt = new Date().toISOString();
        this.reconnectDelay = 1000;
        this.reconnectCount = 0;
        this.logger.log(`✅ 已连接到 HA ${this.haVersion}`);
        this.getDynamicConfig().then(({ haUrl }) => {
            this.eventEmitter.emit(types_1.HA_EVENTS.CONNECTED, {
                ha_version: this.haVersion,
                ha_url: haUrl,
            });
        });
        this.fetchAllStates();
        this.subscribeToStateChanges();
    }
    fetchAllStates() {
        const id = this.messageId++;
        this.logger.log(`正在获取所有实体状态 (消息 ID: ${id})...`);
        this.ws?.send(JSON.stringify({ id, type: 'get_states' }));
    }
    subscribeToStateChanges() {
        const id = this.messageId++;
        this.logger.log(`正在订阅状态变更事件 (消息 ID: ${id})...`);
        this.ws?.send(JSON.stringify({ id, type: 'subscribe_events', event_type: 'state_changed' }));
    }
    handleResult(msg) {
        const id = msg.id;
        const pending = this.pendingResults.get(id);
        if (pending) {
            clearTimeout(pending.timeout);
            this.pendingResults.delete(id);
            if (msg.success) {
                pending.resolve(msg.result);
            }
            else {
                pending.reject(msg.error);
            }
            return;
        }
        const result = msg.result;
        if (!result)
            return;
        if (Array.isArray(result)) {
            const entities = result;
            this.logger.log(`📦 已接收 ${entities.length} 个初始实体状态`);
            this.eventEmitter.emit(types_1.HA_EVENTS.INITIAL_STATES, entities);
        }
    }
    handleEvent(msg) {
        const event = msg.event;
        if (!event)
            return;
        const eventType = event.event_type;
        if (eventType !== 'state_changed')
            return;
        const data = event.data;
        if (!data)
            return;
        const stateChangedEvent = {
            entity_id: data.entity_id,
            old_state: data.old_state || null,
            new_state: data.new_state || null,
            changed_at: event.time_fired || new Date().toISOString(),
        };
        const entityId = stateChangedEvent.entity_id;
        const oldState = stateChangedEvent.old_state?.state ?? 'null';
        const newState = stateChangedEvent.new_state?.state ?? 'null';
        this.logger.verbose(`[状态] ${entityId}: ${oldState} → ${newState}`);
        this.eventEmitter.emit(types_1.HA_EVENTS.STATE_CHANGED, stateChangedEvent);
    }
    scheduleReconnect() {
        if (this.destroyed)
            return;
        if (this.reconnectTimer)
            return;
        this.reconnectCount++;
        this.logger.warn(`将在 ${this.reconnectDelay / 1000}秒后重连... (第 ${this.reconnectCount} 次尝试)`);
        this.eventEmitter.emit(types_1.HA_EVENTS.RECONNECTING, {
            attempt: this.reconnectCount,
            delay: this.reconnectDelay,
        });
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.cleanup();
            this.connect();
        }, this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }
    cleanup() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.removeAllListeners();
            if (this.ws.readyState === ws_1.default.OPEN || this.ws.readyState === ws_1.default.CONNECTING) {
                this.ws.terminate();
            }
            this.ws = null;
        }
        this.connected = false;
        this.authenticated = false;
    }
};
exports.HaConnectorService = HaConnectorService;
exports.HaConnectorService = HaConnectorService = HaConnectorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object, prisma_service_1.PrismaService])
], HaConnectorService);
