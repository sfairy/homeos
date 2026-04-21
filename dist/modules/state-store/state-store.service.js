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
var StateStoreService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStoreService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const types_1 = require("../../common/types");
const ioredis_1 = require("ioredis");
let StateStoreService = StateStoreService_1 = class StateStoreService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(StateStoreService_1.name);
        this.store = new Map();
        this.redis = null;
    }
    async onModuleInit() {
        this.logger.log('状态存储已初始化。');
        const redisUrl = this.config.get('REDIS_URL');
        if (redisUrl) {
            this.tryConnectRedis(redisUrl);
        }
        else {
            this.logger.warn('REDIS_URL 未配置，仅使用内存 L1 缓存运行。');
        }
    }
    onModuleDestroy() {
        if (this.redis) {
            this.redis.disconnect();
        }
    }
    tryConnectRedis(url) {
        try {
            this.redis = new ioredis_1.Redis(url, {
                retryStrategy: (times) => Math.min(times * 1000, 10000),
                maxRetriesPerRequest: 3,
            });
            this.redis.on('connect', () => {
                this.logger.log(`✅ 已连接到 Redis L2 缓存: ${url}`);
                this.restoreFromRedis();
            });
            this.redis.on('error', (err) => {
                this.logger.error(`Redis 连接错误: ${err.message}`);
            });
        }
        catch (err) {
            this.logger.error(`初始化 Redis 失败: ${err.message}`);
        }
    }
    async restoreFromRedis() {
        if (!this.redis)
            return;
        try {
            const keys = await this.redis.keys('shadow:entity:*');
            if (keys.length === 0) {
                this.logger.log('Redis 缓存为空，等待 HA 全量同步...');
                return;
            }
            const values = await this.redis.mget(keys);
            let restoredCount = 0;
            for (let i = 0; i < keys.length; i++) {
                const val = values[i];
                if (val) {
                    const entity = JSON.parse(val);
                    if (!this.store.has(entity.entity_id)) {
                        this.store.set(entity.entity_id, entity);
                        restoredCount++;
                    }
                }
            }
            this.logger.log(`🔄 已从 Redis L2 缓存恢复 ${restoredCount} 个实体`);
        }
        catch (err) {
            this.logger.error(`从 Redis 恢复失败: ${err.message}`);
        }
    }
    async handleInitialStates(entities) {
        this.store.clear();
        const pipeline = this.redis ? this.redis.pipeline() : null;
        for (const entity of entities) {
            this.store.set(entity.entity_id, entity);
            if (pipeline) {
                pipeline.set(`shadow:entity:${entity.entity_id}`, JSON.stringify(entity));
            }
        }
        if (pipeline) {
            await pipeline.exec().catch((e) => this.logger.error(`Redis 管道错误: ${e.message}`));
        }
        this.logger.log(`✅ 已缓存 ${this.store.size} 个来自 HA 的实体`);
    }
    async handleStateChanged(event) {
        if (event.new_state) {
            this.store.set(event.entity_id, event.new_state);
            if (this.redis) {
                this.redis
                    .set(`shadow:entity:${event.entity_id}`, JSON.stringify(event.new_state))
                    .catch((e) => this.logger.warn(`Redis 写入错误: ${e.message}`));
            }
        }
        else {
            this.store.delete(event.entity_id);
            if (this.redis) {
                this.redis
                    .del(`shadow:entity:${event.entity_id}`)
                    .catch((e) => this.logger.warn(`Redis 删除错误: ${e.message}`));
            }
        }
    }
    getAll(domain) {
        const all = Array.from(this.store.values());
        if (domain) {
            return all.filter((e) => e.entity_id.startsWith(`${domain}.`));
        }
        return all;
    }
    getById(entityId) {
        return this.store.get(entityId);
    }
    getDomains() {
        const domainMap = new Map();
        for (const entityId of this.store.keys()) {
            const domain = entityId.split('.')[0];
            domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
        }
        return Array.from(domainMap.entries())
            .map(([domain, count]) => ({ domain, count }))
            .sort((a, b) => b.count - a.count);
    }
    getCount() {
        return this.store.size;
    }
};
exports.StateStoreService = StateStoreService;
__decorate([
    (0, event_emitter_1.OnEvent)(types_1.HA_EVENTS.INITIAL_STATES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StateStoreService.prototype, "handleInitialStates", null);
__decorate([
    (0, event_emitter_1.OnEvent)(types_1.HA_EVENTS.STATE_CHANGED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StateStoreService.prototype, "handleStateChanged", null);
exports.StateStoreService = StateStoreService = StateStoreService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StateStoreService);
