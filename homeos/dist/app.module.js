"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const ha_connector_module_1 = require("./modules/ha-connector/ha-connector.module");
const state_store_module_1 = require("./modules/state-store/state-store.module");
const command_proxy_module_1 = require("./modules/command-proxy/command-proxy.module");
const ws_push_module_1 = require("./modules/ws-push/ws-push.module");
const auth_module_1 = require("./modules/auth/auth.module");
const ui_config_module_1 = require("./modules/ui-config/ui-config.module");
const security_module_1 = require("./modules/security/security.module");
const system_module_1 = require("./modules/system/system.module");
const prisma_module_1 = require("./common/prisma/prisma.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'floorplans'),
                serveRoot: '/floorplans',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'icons'),
                serveRoot: '/icons',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'client'),
                exclude: ['/api*'],
                renderPath: '*',
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            ha_connector_module_1.HaConnectorModule,
            state_store_module_1.StateStoreModule,
            command_proxy_module_1.CommandProxyModule,
            ws_push_module_1.WsPushModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            ui_config_module_1.UiConfigModule,
            security_module_1.SecurityModule,
            system_module_1.SystemModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
