import { type Request } from 'express';
import { Role, User } from './out/user.js';

export enum LogOutput {
    console,
    file
}

export interface IAuthorizationRequest extends Request {
    dbUser: User;
}

export type RoleMap = {
    route: string;
    allowedRoles: Array<Role>;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}