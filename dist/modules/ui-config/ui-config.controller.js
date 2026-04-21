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
exports.UiConfigController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const ui_config_service_1 = require("./ui-config.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const multer_1 = require("multer");
let UiConfigController = class UiConfigController {
    constructor(uiConfigService) {
        this.uiConfigService = uiConfigService;
    }
    async getConfig(projectId) {
        const data = await this.uiConfigService.getConfig(projectId);
        return {
            success: true,
            data: {
                ...data,
                layout: JSON.parse(data.layout),
            },
        };
    }
    async listProfiles() {
        const profiles = await this.uiConfigService.listProfiles();
        return { success: true, data: profiles };
    }
    async exportConfigs() {
        const data = await this.uiConfigService.exportAllConfigs();
        return { success: true, data };
    }
    async importConfigs(body) {
        if (!body.configs || !Array.isArray(body.configs)) {
            throw new common_1.BadRequestException('无效的配置数据');
        }
        const result = await this.uiConfigService.importAllConfigs(body.configs);
        return result;
    }
    async saveConfig(projectId, body) {
        const layoutStr = typeof body.layout === 'string' ? body.layout : JSON.stringify(body.layout);
        const result = await this.uiConfigService.saveConfig(projectId, layoutStr);
        return { success: true, data: result };
    }
    async deleteProfile(projectId) {
        try {
            await this.uiConfigService.deleteProfile(projectId);
            return { success: true };
        }
        catch (e) {
            throw new common_1.BadRequestException(e.message);
        }
    }
    listFloorplans(subPath) {
        return { success: true, data: this.uiConfigService.listFloorplans(subPath || '') };
    }
    listIcons() {
        return { success: true, data: this.uiConfigService.listIcons() };
    }
    async createDirectory(subPath) {
        if (!subPath)
            throw new common_1.BadRequestException('路径是必需的');
        return { success: true, data: this.uiConfigService.createDirectory(subPath) };
    }
    uploadFloorplans(files, subPath) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('没有上传文件');
        }
        const saved = files.map((f) => this.uiConfigService.saveFloorplan(f.originalname, f.buffer, subPath || ''));
        return { success: true, uploaded: saved.length, data: saved };
    }
    deleteFloorplan(fullPath) {
        if (!fullPath)
            throw new common_1.BadRequestException('路径是必需的');
        this.uiConfigService.deleteFloorplan(fullPath);
        return { success: true, deleted: fullPath };
    }
};
exports.UiConfigController = UiConfigController;
__decorate([
    (0, common_1.Get)('project/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UiConfigController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('profiles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UiConfigController.prototype, "listProfiles", null);
__decorate([
    (0, common_1.Get)('all/export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UiConfigController.prototype, "exportConfigs", null);
__decorate([
    (0, common_1.Post)('all/import'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UiConfigController.prototype, "importConfigs", null);
__decorate([
    (0, common_1.Post)('project/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UiConfigController.prototype, "saveConfig", null);
__decorate([
    (0, common_1.Delete)('project/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UiConfigController.prototype, "deleteProfile", null);
__decorate([
    (0, common_1.Get)('floorplans'),
    __param(0, (0, common_1.Query)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UiConfigController.prototype, "listFloorplans", null);
__decorate([
    (0, common_1.Get)('icons'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UiConfigController.prototype, "listIcons", null);
__decorate([
    (0, common_1.Post)('floorplans/mkdir'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UiConfigController.prototype, "createDirectory", null);
__decorate([
    (0, common_1.Post)('floorplans/upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_, file, cb) => {
            const allowed = /\.(jpg|jpeg|png|webp|gif|svg)$/i;
            if (!allowed.test(file.originalname)) {
                return cb(new common_1.BadRequestException(`文件类型不允许: ${file.originalname}`), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Query)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", void 0)
], UiConfigController.prototype, "uploadFloorplans", null);
__decorate([
    (0, common_1.Delete)('floorplans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('path')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UiConfigController.prototype, "deleteFloorplan", null);
exports.UiConfigController = UiConfigController = __decorate([
    (0, common_1.Controller)('config'),
    __metadata("design:paramtypes", [ui_config_service_1.UiConfigService])
], UiConfigController);
