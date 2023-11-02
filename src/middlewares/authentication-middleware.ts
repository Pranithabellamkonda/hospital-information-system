import passport from 'passport';
import * as local from 'passport-local';
import { QueryTypes, Sequelize } from 'sequelize';
import crypto from 'crypto';
import { container } from '../utils/inversify-orchestrator.js';
import { TYPES } from '../utils/types.js';
import { Logger } from '../utils/logger.js';
import { User } from '../classes/out/user.js';

const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

passport.use('password', new local.Strategy(async (username: string, password: string, done) => {
    try {
        const users: Array<User> = await dbConnection.query(`SELECT * FROM User WHERE Username = '${username}'`, 
        { type: QueryTypes.SELECT });

        if (!users || users.length === 0) return done('Incorrect username!');

        crypto.pbkdf2(password, Buffer.from(users[0].Salt, 'base64'), 310000, 32, 'sha256', (err, hashedPassword: Buffer) => {
            if (err) throw err;

            const storedPasswordBytes = Buffer.from(users[0].HashedPassword, 'base64');

            if (!crypto.timingSafeEqual(storedPasswordBytes, hashedPassword)) {
                return done(null, false, { message: 'Incorrect password!' });
            }

            return done(null, users[0]);
        });

    } catch (err) {
        logger.error('Error occurred.', err);

        return done(err);
    }
}));

export default passport;