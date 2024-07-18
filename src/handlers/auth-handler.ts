import crypto from 'crypto';
import express, { type Request, type Response } from 'express';
import { IVerifyOptions } from 'passport-local';
import { QueryTypes, Sequelize } from 'sequelize';
import { User as UserIn } from '../classes/in/user.js';
import { Role, User as UserOut } from '../classes/out/user.js';
import passport from '../middlewares/authentication-middleware.js';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { Patient } from '../classes/patient.js';
import { Doctor } from '../classes/doctor.js';
import { Admin } from '../classes/admin.js';

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
        passport.authenticate('password', async (err: Error, user: UserOut, options?: IVerifyOptions) => {
            if (err) throw err;

            if (options?.message === 'Incorrect username!' || options?.message === 'Incorrect password!' || options?.message === 'Missing credentials') {
                return res.header('Content-type', 'application/json').status(401).send(JSON.stringify({ 
                    'Status': 'Unauthorized',
                    'Message': options.message
                 }, null, 4));
            }

            const response: Record<string, string> = {
                Username: user.Username,
                Role: user.Role,
                Id: undefined
            };

            switch (user.Role) {
                case Role.Patient: {
                    const results: Array<Patient> = await dbConnection.query(`SELECT PatientId FROM Patient WHERE 
                        Username = '${user.Username}'`, { type: QueryTypes.SELECT });

                        if (results.length === 1) 
                            response.Id = results[0].PatientId;
                    }  
                    break;
                case Role.Doctor: {
                    const results: Array<Doctor> = await dbConnection.query(`SELECT DoctorId FROM Doctor WHERE 
                        Username = '${user.Username}'`, { type: QueryTypes.SELECT });

                        response.Id = results[0].DoctorId;
                    }  
                    break;
                default: {
                    const results: Array<Admin> = await dbConnection.query(`SELECT AdminId FROM Admin WHERE 
                        Username = '${user.Username}'`, { type: QueryTypes.SELECT });

                        response.Id = results[0].AdminId;
                    }  
                    break;
            }

            return res.header('Content-type', 'application/json').status(200).send(JSON.stringify(response, null, 4));
        })(req, res);
    } catch (err: any) {
        logger.error('Error occurred', err.message);
        return res.status(500).send('Error occurred');
    }
});

export default authRouter;