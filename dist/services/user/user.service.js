"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getUserById = exports.queryUsers = exports.queryUsersCount = void 0;
const uuid_1 = require("uuid");
const prisma_service_1 = __importDefault(require("../prisma.service"));
const prisma = prisma_service_1.default.getInstance();
const queryUsersCount = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (search = '') {
    const countWithSearch = yield prisma.users.count({
        where: {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } }
            ]
        }
    });
    return countWithSearch;
});
exports.queryUsersCount = queryUsersCount;
const queryUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (search = '', take, skip) {
    const findWithSearch = yield prisma.users.findMany({
        skip: skip || 0,
        take: take || 10,
        where: {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } }
            ]
        },
        orderBy: {
            name: 'asc',
        }
    });
    return findWithSearch;
});
exports.queryUsers = queryUsers;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.users.findUnique({ where: { id: id } });
    return user;
});
exports.getUserById = getUserById;
const createUser = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("chamando api");
    console.log((0, uuid_1.v4)());
    const user = yield prisma.users.create({
        data: { id: (0, uuid_1.v4)(), name, email }
    });
    return user;
});
exports.createUser = createUser;
//# sourceMappingURL=user.service.js.map