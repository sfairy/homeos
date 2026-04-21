"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UiConfigService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const FLOORPLANS_DIR = process.env.FLOORPLANS_DIR || path.join(process.cwd(), 'floorplans');
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);
const ICONS_CUSTOM_DIR = path.join(process.cwd(), 'icons');
const getBuiltinIconsDir = () => {
    const prodPath = path.join(process.cwd(), 'client', 'icons');
    if (fs.existsSync(prodPath))
        return prodPath;
    const devPathRoot = path.join(process.cwd(), 'frontend', 'public', 'icons');
    if (fs.existsSync(devPathRoot))
        return devPathRoot;
    const devPathBackend = path.join(process.cwd(), '..', 'frontend', 'public', 'icons');
    if (fs.existsSync(devPathBackend))
        return devPathBackend;
    return prodPath;
};
const ICONS_BUILTIN_DIR = getBuiltinIconsDir();
let UiConfigService = UiConfigService_1 = class UiConfigService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(UiConfigService_1.name);
        this.logger.log(`📁 平面图资源目录: ${FLOORPLANS_DIR}`);
        if (!fs.existsSync(FLOORPLANS_DIR)) {
            this.logger.log(`✨ 正在创建资源目录: ${FLOORPLANS_DIR}`);
            fs.mkdirSync(FLOORPLANS_DIR, { recursive: true, mode: 0o777 });
        }
    }
    async getConfig(projectId = 'default') {
        const config = await this.prisma.projectConfig.findUnique({
            where: { projectId },
        });
        if (!config) {
            return {
                projectId,
                layout: '{}',
            };
        }
        return config;
    }
    async saveConfig(projectId = 'default', layout) {
        this.logger.log(`正在保存项目布局配置: ${projectId}`);
        const result = await this.prisma.projectConfig.upsert({
            where: { projectId },
            update: { layout },
            create: { projectId, layout },
        });
        this.eventEmitter.emit('SYSTEM_CONFIG_UPDATED');
        return result;
    }
    async listProfiles() {
        return this.prisma.projectConfig.findMany({
            select: {
                projectId: true,
                updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async deleteProfile(projectId) {
        if (projectId === 'default') {
            throw new Error('无法删除默认配置文件');
        }
        return this.prisma.projectConfig.delete({
            where: { projectId },
        });
    }
    async exportAllConfigs() {
        return this.prisma.projectConfig.findMany({
            orderBy: { updatedAt: 'desc' },
        });
    }
    async importAllConfigs(configs) {
        this.logger.log(`📦 正在恢复所有项目配置 (${configs.length} 项)...`);
        for (const item of configs) {
            if (!item.projectId || !item.layout)
                continue;
            await this.prisma.projectConfig.upsert({
                where: { projectId: item.projectId },
                update: { layout: item.layout },
                create: { projectId: item.projectId, layout: item.layout },
            });
        }
        this.eventEmitter.emit('SYSTEM_CONFIG_UPDATED');
        return { success: true, count: configs.length };
    }
    getSafePath(subPath = '') {
        const root = path.resolve(FLOORPLANS_DIR);
        const target = path.resolve(path.join(root, subPath));
        if (!target.startsWith(root)) {
            throw new Error('检测到目录遍历攻击');
        }
        return target;
    }
    listFloorplans(subPath = '') {
        try {
            const targetDir = this.getSafePath(subPath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
            }
            const items = fs.readdirSync(targetDir, { withFileTypes: true });
            return items
                .filter((item) => {
                if (item.isDirectory())
                    return true;
                return ALLOWED_EXTS.has(path.extname(item.name).toLowerCase());
            })
                .map((item) => {
                const fullPath = path.join(targetDir, item.name);
                const relativePath = path.join(subPath, item.name);
                const stat = fs.statSync(fullPath);
                if (item.isDirectory()) {
                    return { name: item.name, type: 'dir' };
                }
                return {
                    name: item.name,
                    type: 'file',
                    url: `/floorplans/${relativePath}`,
                    size: stat.size,
                };
            });
        }
        catch (e) {
            this.logger.error(`列出 "${subPath}" 下的平面图失败: ${e.message}`);
            return [];
        }
    }
    createDirectory(subPath) {
        const targetDir = this.getSafePath(subPath);
        if (fs.existsSync(targetDir)) {
            throw new Error('目录已存在');
        }
        fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
        this.logger.log(`目录已创建: ${subPath}`);
        return { success: true, path: subPath };
    }
    listIcons() {
        const iconSet = new Set();
        this.logger.debug(`🔍 开始扫描图标...`);
        if (fs.existsSync(ICONS_BUILTIN_DIR)) {
            try {
                const files = fs.readdirSync(ICONS_BUILTIN_DIR);
                const svgs = files.filter((f) => f.toLowerCase().endsWith('.svg'));
                svgs.forEach((f) => iconSet.add(f));
                this.logger.debug(`✅ 在 ${ICONS_BUILTIN_DIR} 中找到 ${svgs.length} 个内置图标`);
            }
            catch (e) {
                this.logger.warn(`❌ 读取内置图标失败: ${e.message}`);
            }
        }
        else {
            this.logger.warn(`⚠️ 未找到内置图标目录: ${ICONS_BUILTIN_DIR}`);
        }
        if (fs.existsSync(ICONS_CUSTOM_DIR)) {
            try {
                const files = fs.readdirSync(ICONS_CUSTOM_DIR);
                const svgs = files.filter((f) => f.toLowerCase().endsWith('.svg'));
                svgs.forEach((f) => iconSet.add(f));
                this.logger.debug(`✅ 在 ${ICONS_CUSTOM_DIR} 中找到 ${svgs.length} 个自定义图标`);
                if (svgs.length > 0) {
                    this.logger.debug(`📄 自定义图标: ${svgs.join(', ')}`);
                }
            }
            catch (e) {
                this.logger.warn(`❌ 读取自定义图标失败: ${e.message}`);
            }
        }
        else {
            this.logger.debug(`ℹ️ 未找到自定义图标目录（未挂载时正常）: ${ICONS_CUSTOM_DIR}`);
        }
        const result = Array.from(iconSet).sort();
        this.logger.debug(`🏁 图标加载完成，共 ${result.length} 个`);
        return result;
    }
    getIconPath(filename) {
        const safeName = path.basename(filename);
        const customPath = path.join(ICONS_CUSTOM_DIR, safeName);
        if (fs.existsSync(customPath))
            return customPath;
        const builtinPath = path.join(ICONS_BUILTIN_DIR, safeName);
        if (fs.existsSync(builtinPath))
            return builtinPath;
        return null;
    }
    saveFloorplan(filename, buffer, subPath = '') {
        const targetDir = this.getSafePath(subPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true, mode: 0o755 });
        }
        const safeName = path.basename(filename);
        const ext = path.extname(safeName).toLowerCase();
        if (!ALLOWED_EXTS.has(ext)) {
            throw new Error(`文件类型 "${ext}" 不允许。`);
        }
        const dest = path.join(targetDir, safeName);
        fs.writeFileSync(dest, buffer, { mode: 0o644 });
        const relativeUrl = path.join(subPath, safeName);
        this.logger.log(`平面图已保存到 ${subPath}: ${safeName} (${buffer.length} 字节)`);
        return { name: safeName, url: `/floorplans/${relativeUrl}` };
    }
    deleteFloorplan(fullPath) {
        const target = this.getSafePath(fullPath);
        if (!fs.existsSync(target)) {
            throw new Error('文件或目录未找到');
        }
        const stat = fs.statSync(target);
        if (stat.isDirectory()) {
            fs.rmSync(target, { recursive: true, force: true });
            this.logger.log(`目录已删除: ${fullPath}`);
        }
        else {
            fs.unlinkSync(target);
            this.logger.log(`文件已删除: ${fullPath}`);
        }
    }
};
exports.UiConfigService = UiConfigService;
exports.UiConfigService = UiConfigService = UiConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], UiConfigService);
