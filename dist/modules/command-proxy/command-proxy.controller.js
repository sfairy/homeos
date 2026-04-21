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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandProxyController = void 0;
const common_1 = require("@nestjs/common");
const command_proxy_service_1 = require("./command-proxy.service");
const call_service_dto_1 = require("./dto/call-service.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CommandProxyController = class CommandProxyController {
    constructor(commandProxy) {
        this.commandProxy = commandProxy;
    }
    async callService(dto) {
        return this.commandProxy.callService(dto);
    }
    getHaStatus() {
        return this.commandProxy.getHaStatus();
    }
    async getHistory(entityIds, hours) {
        if (!entityIds) {
            throw new common_1.BadRequestException('需要 entity_ids 查询参数');
        }
        const ids = entityIds.split(',').map((id) => id.trim());
        const h = hours ? parseInt(hours, 10) : 24;
        return this.commandProxy.fetchHistory(ids, h);
    }
    async proxyMedia(path, res) {
        if (!path) {
            throw new common_1.BadRequestException('需要 path 查询参数');
        }
        try {
            const { data, contentType } = await this.commandProxy.fetchMediaImage(path);
            res.set('Content-Type', contentType);
            res.set('Cache-Control', 'public, max-age=3600');
            res.send(data);
        }
        catch (e) {
            res.status(502).send('网关错误: 无法从 HA 获取图片');
        }
    }
};
exports.CommandProxyController = CommandProxyController;
__decorate([
    (0, common_1.Post)('services/call'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [call_service_dto_1.CallServiceDto]),
    __metadata("design:returntype", Promise)
], CommandProxyController.prototype, "callService", null);
__decorate([
    (0, common_1.Get)('ha/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommandProxyController.prototype, "getHaStatus", null);
__decorate([
    (0, common_1.Get)('ha/history'),
    __param(0, (0, common_1.Query)('entity_ids')),
    __param(1, (0, common_1.Query)('hours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CommandProxyController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('ha/media-proxy'),
    __param(0, (0, common_1.Query)('path')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommandProxyController.prototype, "proxyMedia", null);
exports.CommandProxyController = CommandProxyController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [command_proxy_service_1.CommandProxyService])
], CommandProxyController);
