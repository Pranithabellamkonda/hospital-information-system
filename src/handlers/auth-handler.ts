import crypto from 'crypto';
import express, { type Request, type Response } from 'express';
import { QueryTypes, Sequelize } from 'sequelize';
import { User as UserIn } from '../classes/in/user.js';
import { User as UserOut } from '../classes/in/user.js';
import { Role } from '../classes/out/user.js';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import passport from '../middlewares/authentication-middleware.js';

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

        res.header('Content-type', 'application/json').status(200).send(JSON.stringify({ 'Status': 'Success' }, null, 4));
    } catch (err: any) {
        res.status(500).send('Error occurred');
        logger.error('Error occurred', err.message);
    }
});

authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        passport.authenticate('password', (err: Error, user: UserOut, info: string, status: any) => {
            logger.info(info, status);
            
            if (err) throw err;

            res.header('Content-type', 'application/json').status(200).send(JSON.stringify({ 
                'Status': 'Success',
                'Message': `Log in successful for ${user.Username}`
             }, null, 4));
        })(req, res);
    } catch (err: any) {
        res.status(500).send('Error occurred');
        logger.error('Error occurred', err.message);
    }
});

export default authRouter;