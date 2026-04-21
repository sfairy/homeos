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
var WsPushGateway_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsPushGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const types_1 = require("../../common/types");
const state_store_service_1 = require("../state-store/state-store.service");
const ha_connector_service_1 = require("../ha-connector/ha-connector.service");
let WsPushGateway = WsPushGateway_1 = class WsPushGateway {
    constructor(stateStore, haConnector) {
        this.stateStore = stateStore;
        this.haConnector = haConnector;
        this.logger = new common_1.Logger(WsPushGateway_1.name);
        this.clientCount = 0;
    }
    afterInit() {
        this.logger.log('Socket.IO 网关已初始化');
    }
    async handleConnection(client) {
        this.clientCount++;
        this.logger.log(`客户端已连接: ${client.id} (总数: ${this.clientCount})`);
        const entities = this.stateStore.getAll();
        client.emit('initial_states', {
            type: 'initial_states',
            entities,
            count: entities.length,
            timestamp: new Date().toISOString(),
        });
        const haStatus = await this.haConnector.getStatus();
        client.emit('ha_status', {
            type: 'ha_status',
            status: haStatus.connected ? 'connected' : 'disconnected',
            ha_version: haStatus.ha_version,
            timestamp: new Date().toISOString(),
        });
    }
    handleDisconnect(client) {
        this.clientCount--;
        this.logger.log(`客户端已断开连接: ${client.id} (总数: ${this.clientCount})`);
    }
    handleStateChanged(event) {
        this.server.emit('state_changed', {
            type: 'state_changed',
            entity_id: event.entity_id,
            old_state: event.old_state,
            new_state: event.new_state,
            changed_at: event.changed_at,
        });
    }
    handleHaConnected(data) {
        this.server.emit('ha_status', {
            type: 'ha_status',
            status: 'connected',
            ha_version: data.ha_version,
            timestamp: new Date().toISOString(),
        });
    }
    handleHaDisconnected() {
        this.server.emit('ha_status', {
            type: 'ha_status',
            status: 'disconnected',
            timestamp: new Date().toISOString(),
        });
    }
    handleHaReconnecting(data) {
        this.server.emit('ha_status', {
            type: 'ha_status',
            status: 'reconnecting',
            attempt: data.attempt,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.WsPushGateway = WsPushGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], WsPushGateway.prototype, "server", void 0);
__decorate([
    (0, event_emitter_1.OnEvent)(types_1.HA_EVENTS.STATE_CHANGED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WsPushGateway.prototype, "handleStateChanged", null);
__decorate([
    (0, event_emitter_1.OnEvent)(types_1.HA_EVENTS.CONNECTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WsPushGateway.prototype, "handleHaConnected", null);
__decorate([
    (0, event_emitter_1.OnEvent)(types_1.HA_EVENTS.DISCONNECTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WsPushGateway.prototype, "handleHaDisconnected", null);
__decorate([
    (0, event_emitter_1.OnEvent)(types_1.HA_EVENTS.RECONNECTING),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WsPushGateway.prototype, "handleHaReconnecting", null);
exports.WsPushGateway = WsPushGateway = WsPushGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [state_store_service_1.StateStoreService,
        ha_connector_service_1.HaConnectorService])
], WsPushGateway);
