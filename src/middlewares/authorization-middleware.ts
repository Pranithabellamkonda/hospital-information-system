import { NextFunction, type Request, type Response } from 'express';
import { IAuthorizationRequest, RoleMap } from '../classes/type-definitions.js';
import { Role } from '../classes/out/user.js';

const rolesMap: Array<RoleMap> = [
    {
        route: '/api/patients',
        method: 'POST',
        allowedRoles: [ Role.Admin, Role.Patient ]
    },
    {
        route: '/api/patients/{id}',
        method: 'GET',
        allowedRoles: [ Role.Patient, Role.Admin ]
    },
    {
        route: '/api/patients/{id}/appointments',
        method: 'GET',
        allowedRoles: [ Role.Patient, Role.Admin ]
    },
    {
        route: '/api/appointments/{id}',
        method: 'PATCH',
        allowedRoles: [ Role.Patient, Role.Admin ]
    },
    {
        route: '/api/patients/{id}/medical-records',
        method: 'GET',
        allowedRoles: [ Role.Patient ]
    },
    {
        route: '/api/patients/{id}/billing',
        method: 'GET',
        allowedRoles: [ Role.Patient, Role.Admin ]
    },
    {
        route: '/api/patients/{id}',
        method: 'PUT',
        allowedRoles: [ Role.Patient, Role.Admin ]
    },
    {
        route: '/api/doctors',
        method: 'GET',
        allowedRoles: [ Role.Patient, Role.Admin, Role.Doctor ]
    },
    {
        route: '/api/doctors/{id}',
        method: 'GET',
        allowedRoles: [ Role.Patient, Role.Admin, Role.Doctor ]
    },
    {
        route: '/api/doctors/{id}/patients',
        method: 'GET',
        allowedRoles: [ Role.Doctor , Role.Admin ]
    },
    {
        route: '/api/doctors/{id}/appointments',
        method: 'GET',
        allowedRoles: [ Role.Doctor, Role.Admin ]
    },
    {
        route: '/api/doctors/{id}/patients/{id}/medical-records',
        method: 'GET',
        allowedRoles: [ Role.Doctor ]
    },
    {
        route: '/api/doctors/{id}/medical-records',
        method: 'POST',
        allowedRoles: [ Role.Doctor ]
    },
    {
        route: '/api/doctors/{id}',
        method: 'PUT',
        allowedRoles: [ Role.Doctor,Role.Admin ]
    },
    {
        route: '/api/patients',
        method: 'GET',
        allowedRoles: [ Role.Admin ]
    },
    {
        route: '/api/admins/{id}',
        method: 'GET',
        allowedRoles: [ Role.Admin ]
    },
    {
        route: '/api/admins/{id}',
        method: 'PUT',
        allowedRoles: [ Role.Admin ]
    },
    {
        route: '/api/admins/{id}/billing',
        method: 'GET',
        allowedRoles: [ Role.Admin ]
    },
    {
        route: '/api/admins/{id}/billing',
        method: 'POST',
        allowedRoles: [ Role.Admin ]
    },
    {
        route: '/api/appointments',
        method: 'GET',
        allowedRoles: [ Role.Admin ]
    },
    {
        route: '/api/appointments',
        method: 'POST',
        allowedRoles: [ Role.Admin, Role.Patient ]
    }
];

export const authorizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const excludedRoutes = ['/api/login', '/api/signup', 'api/doc'];

    if (excludedRoutes.includes(req.path)) {
        return next();
    }
    
    const urlTemplate = req.url.replace(/\d+/g, '{id}');
    const roleMap = rolesMap.find(rm => {
        const isMatch = urlTemplate === rm.route && rm.method === req.method;

        return isMatch;
    });

    if (!roleMap) {
        return res.header('Content-type', 'application/json').status(404).send(JSON.stringify({ 
            'Status': 'Not Found'
         }, null, 4));
    }

    if (roleMap?.allowedRoles.includes((<IAuthorizationRequest>req).dbUser.Role)) {
        return next();
    }

    return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
        'Status': 'Forbidden'
     }, null, 4));
};