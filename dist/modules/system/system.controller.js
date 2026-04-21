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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const system_service_1 = require("./system.service");
let SystemController = class SystemController {
    constructor(systemService) {
        this.systemService = systemService;
    }
    async proxyImage(imgUrl, req, res) {
        if (!imgUrl) {
            return res.status(400).send('需要 imgurl 查询参数');
        }
        await this.systemService.proxyImage(imgUrl, req.headers, res);
    }
    async proxySystemApiGet(path, query, req, res) {
        await this.systemService.proxySystemApi(path, 'GET', query, null, req.headers, res);
    }
    async proxySystemApiPost(path, query, body, req, res) {
        await this.systemService.proxySystemApi(path, 'POST', query, body, req.headers, res);
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('img/0'),
    __param(0, (0, common_1.Query)('imgurl')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "proxyImage", null);
__decorate([
    (0, common_1.Get)(':path'),
    __param(0, (0, common_1.Param)('path')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "proxySystemApiGet", null);
__decorate([
    (0, common_1.Post)(':path'),
    __param(0, (0, common_1.Param)('path')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SystemController.prototype, "proxySystemApiPost", null);
exports.SystemController = SystemController = __decorate([
    (0, common_1.Controller)('system'),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
