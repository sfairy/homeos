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
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SecurityService = SecurityService_1 = class SecurityService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(SecurityService_1.name);
    }
    async getDynamicConfig() {
        let haUrl = this.configService.get('HA_URL') || 'http://localhost:8123';
        let eventsPath = '/local/doorbell_snapshots/events.jsonl';
        try {
            const record = await this.prisma.projectConfig.findUnique({
                where: { projectId: 'default' },
            });
            if (record?.layout) {
                const layout = JSON.parse(record.layout);
                if (layout.haConfig) {
                    haUrl = layout.haConfig.url || haUrl;
                    eventsPath = layout.haConfig.eventsPath || eventsPath;
                }
            }
        }
        catch (e) { }
        return { haUrl, eventsPath };
    }
    async fetchEvents() {
        try {
            const { haUrl, eventsPath } = await this.getDynamicConfig();
            const eventsUrl = `${haUrl}${eventsPath}`;
            const response = await fetch(eventsUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    this.logger.warn('在 HA 中未找到 events.jsonl，假设尚无事件。');
                    return [];
                }
                throw new Error(`获取事件失败: ${response.status} ${response.statusText}`);
            }
            const text = await response.text();
            const lines = text.split('\n').filter((line) => line.trim() !== '');
            const events = lines
                .map((line) => {
                try {
                    const e = JSON.parse(line);
                    if (e.img && e.img.startsWith('/local/')) {
                        e.img = `${haUrl}${e.img}`;
                    }
                    return e;
                }
                catch (e) {
                    return null;
                }
            })
                .filter((e) => e !== null);
            events.sort((a, b) => {
                const datetimeA = new Date(`${a.date}T${a.time}`).getTime();
                const datetimeB = new Date(`${b.date}T${b.time}`).getTime();
                return datetimeB - datetimeA;
            });
            return events;
        }
        catch (error) {
            this.logger.error(`从 HA 获取事件失败: ${error.message}`);
            throw error;
        }
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], SecurityService);
