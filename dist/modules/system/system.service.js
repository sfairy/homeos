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
var SystemService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const ui_config_service_1 = require("../ui-config/ui-config.service");
const rxjs_1 = require("rxjs");
let SystemService = SystemService_1 = class SystemService {
    constructor(httpService, uiConfigService) {
        this.httpService = httpService;
        this.uiConfigService = uiConfigService;
        this.logger = new common_1.Logger(SystemService_1.name);
    }
    async getMoviePilotUrl() {
        const config = await this.uiConfigService.getConfig('default');
        if (!config || !config.layout) {
            throw new common_1.InternalServerErrorException('系统配置未找到');
        }
        try {
            const layout = JSON.parse(config.layout);
            const url = layout.moviePilotUrl;
            if (!url) {
                throw new common_1.NotFoundException('MoviePilot URL 未在仪表板设置中配置');
            }
            return url.replace(/\/$/, '');
        }
        catch (e) {
            this.logger.error(`解析布局配置失败: ${e.message}`);
            throw new common_1.InternalServerErrorException('无效的布局配置');
        }
    }
    async proxyImage(imgUrl, incomingHeaders, res) {
        const baseUrl = await this.getMoviePilotUrl();
        const targetUrl = `${baseUrl}/api/v1/system/img/0?imgurl=${encodeURIComponent(imgUrl)}`;
        this.logger.debug(`正在代理图片请求到: ${targetUrl}`);
        const headers = this.filterHeaders(incomingHeaders);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(targetUrl, {
                responseType: 'arraybuffer',
                headers,
                timeout: 10000,
            }));
            const contentType = response.headers['content-type'];
            if (contentType)
                res.setHeader('Content-Type', contentType);
            const cacheControl = response.headers['cache-control'];
            if (cacheControl) {
                res.setHeader('Cache-Control', cacheControl);
            }
            else {
                res.setHeader('Cache-Control', 'public, max-age=3600');
            }
            res.send(response.data);
        }
        catch (e) {
            this.logger.error(`从 ${targetUrl} 代理图片失败: ${e.message}`);
            throw new common_1.NotFoundException('无法通过 MoviePilot 代理获取远程图片');
        }
    }
    async proxySystemApi(path, method, query, body, incomingHeaders, res) {
        const baseUrl = await this.getMoviePilotUrl();
        const targetUrl = `${baseUrl}/api/v1/system/${path}`;
        this.logger.debug(`正在代理 ${method} 请求到: ${targetUrl}`);
        const headers = this.filterHeaders(incomingHeaders);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.request({
                url: targetUrl,
                method,
                params: query,
                data: body,
                headers,
                timeout: 5000,
            }));
            res.status(response.status).json(response.data);
        }
        catch (e) {
            this.logger.error(`从 ${targetUrl} 代理 API 失败: ${e.message}`);
            if (e.response) {
                res.status(e.response.status).json(e.response.data);
            }
            else {
                throw new common_1.InternalServerErrorException(`MoviePilot 代理错误: ${e.message}`);
            }
        }
    }
    filterHeaders(incomingHeaders) {
        const forwardHeaders = {};
        const exclude = ['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding'];
        for (const key in incomingHeaders) {
            if (!exclude.includes(key.toLowerCase())) {
                forwardHeaders[key] = incomingHeaders[key];
            }
        }
        return forwardHeaders;
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = SystemService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        ui_config_service_1.UiConfigService])
], SystemService);
