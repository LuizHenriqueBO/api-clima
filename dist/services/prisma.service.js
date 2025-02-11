"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class PrismaService {
    constructor() { }
    static getInstance() {
        if (!PrismaService.instance) {
            const _PrismaService = new client_1.PrismaClient({
                log: [
                    {
                        emit: 'event',
                        level: 'query',
                    },
                    {
                        emit: 'stdout',
                        level: 'error',
                    },
                    {
                        emit: 'stdout',
                        level: 'info',
                    },
                    {
                        emit: 'stdout',
                        level: 'warn',
                    },
                ],
            });
            _PrismaService.$on('query', (e) => {
                console.log('Query: ' + e.query);
                console.log('Params: ' + e.params);
                console.log('Duration: ' + e.duration + 'ms');
            });
            PrismaService.instance = _PrismaService;
        }
        return PrismaService.instance;
    }
}
exports.default = PrismaService;
//# sourceMappingURL=prisma.service.js.map