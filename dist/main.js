"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.setGlobalPrefix('api/v1', { exclude: ['health'] });
    const port = process.env.PORT || 8500;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 HomeOS 后端服务运行在端口 ${port}`);
    if (process.env.HA_URL) {
        logger.log(`📡 正在连接 HA: ${process.env.HA_URL}`);
    }
    else {
        logger.warn(`⚠️ HA_URL 未在 .env 中设置，等待 UI 配置。`);
    }
}
bootstrap();
