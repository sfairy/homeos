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
var CommandProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandProxyService = void 0;
const common_1 = require("@nestjs/common");
const ha_connector_service_1 = require("../ha-connector/ha-connector.service");
let CommandProxyService = CommandProxyService_1 = class CommandProxyService {
    constructor(haConnector) {
        this.haConnector = haConnector;
        this.logger = new common_1.Logger(CommandProxyService_1.name);
    }
    async callService(dto) {
        const status = await this.haConnector.getStatus();
        if (!status.connected) {
            throw new common_1.ServiceUnavailableException({
                error: 'HA 未连接',
                ha_url: status.ha_url,
            });
        }
        try {
            const data = await this.haConnector.callService(dto.domain, dto.service, dto.entity_id, dto.service_data, dto.return_response);
            const messageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const timestamp = new Date().toISOString();
            this.logger.log(`[CMD] ${dto.domain}.${dto.service} → ${dto.entity_id} | id: ${messageId}`);
            return { success: true, message_id: messageId, timestamp, data };
        }
        catch (e) {
            this.logger.error(`[CMD ERROR] ${dto.domain}.${dto.service} failed: ${JSON.stringify(e)}`);
            throw new common_1.BadRequestException({
                message: `Home Assistant 服务错误: ${e.message || '未知错误'}`,
                error_details: e,
            });
        }
    }
    async fetchHistory(entityIds, hours) {
        return this.haConnector.fetchHistory(entityIds, hours);
    }
    async getHaStatus() {
        return await this.haConnector.getStatus();
    }
    async fetchMediaImage(path) {
        return this.haConnector.fetchMediaImage(path);
    }
};
exports.CommandProxyService = CommandProxyService;
exports.CommandProxyService = CommandProxyService = CommandProxyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ha_connector_service_1.HaConnectorService])
], CommandProxyService);
