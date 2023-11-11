import crypto from 'crypto';
import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import * as local from 'passport-local';
import { QueryTypes, Sequelize } from 'sequelize';
import { User } from '../classes/out/user.js';
import { container } from '../utils/inversify-orchestrator.js';
import { Logger } from '../utils/logger.js';
import { NextFunction, type Request, type Response } from 'express';
import { TYPES } from '../utils/types.js';
import { IAuthorizationRequest } from '../classes/type-definitions.js';

const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

passport.use('password', new local.Strategy(async (username: string, password: string, done) => {
    try {
        const users: Array<User> = await dbConnection.query(`SELECT * FROM User WHERE Username = '${username}'`, 
        { type: QueryTypes.SELECT });

        if (!users || users.length === 0) return done(null, false, { message: 'Incorrect username!' });

        const inputHashedPasswordBytes = crypto.pbkdf2Sync(password, Buffer.from(users[0].Salt, 'base64'), 31000, 32, 'sha256');
        const storedHashedPasswordBytes = Buffer.from(users[0].HashedPassword, 'base64');

        if (!crypto.timingSafeEqual(storedHashedPasswordBytes, inputHashedPasswordBytes)) {
            return done(null, false, { message: 'Incorrect password!' });
        }

        return done(null, users[0]);
    } catch (err) {
        logger.error('Error occurred.', err);

        return done(err);
    }
}));

passport.use('basic', new BasicStrategy(async (username: string, password: string, done) => {
    try {
        const users: Array<User> = await dbConnection.query(`SELECT * FROM User WHERE Username = '${username}'`, 
        { type: QueryTypes.SELECT });

        if (!users || users.length === 0) return done(null, false);

        const inputHashedPasswordBytes = crypto.pbkdf2Sync(password, Buffer.from(users[0].Salt, 'base64'), 31000, 32, 'sha256');
        const storedHashedPasswordBytes = Buffer.from(users[0].HashedPassword, 'base64');

        if (!crypto.timingSafeEqual(storedHashedPasswordBytes, inputHashedPasswordBytes)) {
            return done(null, false);
        }

        return done(null, users[0]);
    } catch (err) {
        logger.error('Error occurred.', err);

        return done(err);
    }
}));

export const authenticateBasicMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const excludedRoutes = ['/api/login', '/api/signup', 'api/doc'];

    if (excludedRoutes.includes(req.path)) {
        return next();
    }

    const authenticate = passport.authenticate('basic', { session: false }, (_err: Error, user: User) => {
       if (user) {
        (<IAuthorizationRequest>req).dbUser = user;
        return next();
       } else {
        return res.header('Content-type', 'application/json').status(401).send(JSON.stringify({ 
            'Status': 'Unauthorized'
         }, null, 4));
       }
    });

    return authenticate(req, res, next);
};

export default passport;