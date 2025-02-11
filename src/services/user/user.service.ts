import {  v4 as uuidv4  } from 'uuid';
import PrismaService from "../prisma.service";

const prisma = PrismaService.getInstance();


export const queryUsersCount = async (search: string = '') => {
    const countWithSearch = await prisma.users.count({
        where: {
            OR: [
                { name: {contains: search} },
                { email: {contains: search} }
            ]
        }
    });
    return countWithSearch;
};


export const queryUsers = async (search: string = '', take: number, skip: number) => {
    const findWithSearch = await prisma.users.findMany({
        skip: skip || 0,
        take: take || 10,
        where: {
            OR: [
                { name: {contains: search} },
                { email: {contains: search} }
            ]
        },
        orderBy: {
            name: 'asc',
        }
    });
    return findWithSearch;
};


export const getUserById = async (id: string) => {
    const user = await prisma.users.findUnique({ where: { id: id } });
    return user;
};


export const createUser = async (name: string, email: string) => {
    console.log("chamando api")
    console.log(uuidv4())
    const user = await prisma.users.create({
        data: { id: uuidv4(), name, email }
    });
    return user;
};