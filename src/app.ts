import express, { Express } from 'express';
import adminsRouter from './handlers/admin-handler.js';
import appointmentsRouter from './handlers/appointment-handler.js';
import appointmentslotsRouter from './handlers/appointmentslot-handler.js';
import authRouter from './handlers/auth-handler.js';
import billingRouter from './handlers/billing-handler.js';
import doctorsRouter from './handlers/doctor-handler.js';
import medicalrecordsRouter from './handlers/medicalrecord-handler.js';
import patientsRouter from './handlers/patient-handler.js';
import specializationsRouter from './handlers/specialization-handler.js';
import passport from './middlewares/authentication-middleware.js';
import { container } from './utils/inversify-orchestrator.js';
import { Logger } from './utils/logger.js';
import { TYPES } from './utils/types.js';

const app: Express = express();
const logger = container.get<Logger>(TYPES.Logger);

app.use(express.json());

app.use(passport.initialize());

app.use('/api',
  authRouter, 
  patientsRouter, 
  doctorsRouter, 
  appointmentsRouter, 
  appointmentslotsRouter,
  medicalrecordsRouter, 
  specializationsRouter,
  billingRouter, 
  adminsRouter
);

app.listen(8080, async () => {
  logger.info('⚡️[server]: Server is running at http://localhost:8080');
});
