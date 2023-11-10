import crypto from 'crypto';
import express, { type Request, type Response } from 'express';
import { IVerifyOptions } from 'passport-local';
import { QueryTypes, Sequelize } from 'sequelize';
import { User as UserIn, User as UserOut } from '../classes/in/user.js';
import { Role } from '../classes/out/user.js';
import passport from '../middlewares/authentication-middleware.js';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';

const authRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

authRouter.post('/signup', async (req: Request, res: Response) => {
    try {
        const user: UserIn = req.body;
        const salt = crypto.randomBytes(16);

        const hashedPassword = crypto.pbkdf2Sync(user.Password, salt, 31000, 32, 'sha256');

        await dbConnection.query(`INSERT INTO User (Username, HashedPassword, Salt, Role) VALUES 
        ('${user.Username}','${hashedPassword.toString('base64')}','${salt.toString('base64')}', '${Role.Patient}')`,
        { type: QueryTypes.INSERT });

        return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({ 'Status': 'Success' }, null, 4));
    } catch (err: any) {
        logger.error('Error occurred', err.message);
        return res.status(500).send('Error occurred');
    }
});

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        passport.authenticate('password', (err: Error, user: UserOut, options?: IVerifyOptions) => {
            if (err) throw err;

            if (options?.message === 'Incorrect username!' || options?.message === 'Incorrect password!') {
                return res.header('Content-type', 'application/json').status(401).send(JSON.stringify({ 
                    'Status': 'Unauthorized',
                    'Message': options.message
                 }, null, 4));
            }

            return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({ 
                'Status': 'Success',
                'Message': `Log in successful for ${user.Username}`
             }, null, 4));
        })(req, res);
    } catch (err: any) {
        logger.error('Error occurred', err.message);
        return res.status(500).send('Error occurred');
    }
});

export default authRouter;