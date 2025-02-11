import { PrismaClient } from '@prisma/client';

class PrismaService {
    private static instance: PrismaClient;

    private constructor() {}

    public static getInstance(): PrismaClient {
        if (!PrismaService.instance) {
            const _PrismaService = new PrismaClient({
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
            })
            
            _PrismaService.$on('query',(e:any) => {
                console.log('Query: ' + e.query)
                console.log('Params: ' + e.params)
                console.log('Duration: ' + e.duration + 'ms')
            });
            PrismaService.instance = _PrismaService;
        }
        
        return PrismaService.instance;
    }
    
}


export default PrismaService;
