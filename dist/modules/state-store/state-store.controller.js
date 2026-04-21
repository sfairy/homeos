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
exports.StateStoreController = void 0;
const common_1 = require("@nestjs/common");
const state_store_service_1 = require("./state-store.service");
let StateStoreController = class StateStoreController {
    constructor(stateStore) {
        this.stateStore = stateStore;
    }
    getAllEntities(domain, search) {
        let entities = this.stateStore.getAll(domain);
        if (search) {
            const lower = search.toLowerCase();
            entities = entities.filter((e) => e.entity_id.toLowerCase().includes(lower) ||
                String(e.attributes?.friendly_name || '').toLowerCase().includes(lower));
        }
        return {
            count: entities.length,
            entities,
        };
    }
    getEntity(entityId) {
        const entity = this.stateStore.getById(entityId);
        if (!entity) {
            throw new common_1.NotFoundException({
                error: '实体未找到',
                entity_id: entityId,
            });
        }
        return entity;
    }
};
exports.StateStoreController = StateStoreController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('domain')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StateStoreController.prototype, "getAllEntities", null);
__decorate([
    (0, common_1.Get)(':entity_id'),
    __param(0, (0, common_1.Param)('entity_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StateStoreController.prototype, "getEntity", null);
exports.StateStoreController = StateStoreController = __decorate([
    (0, common_1.Controller)('entities'),
    __metadata("design:paramtypes", [state_store_service_1.StateStoreService])
], StateStoreController);
