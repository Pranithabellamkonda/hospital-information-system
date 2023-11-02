import express, { Express } from 'express';
import patientsRouter from './handlers/patient-handler.js';
import { container } from './utils/inversify-orchestrator.js';
import { Logger } from './utils/logger.js';
import { TYPES } from './utils/types.js';
import doctorsRouter from './handlers/doctor-handler.js';
import appointmentsRouter from './handlers/appointment-handler.js';
import medicalrecordsRouter from './handlers/medicalrecord-handler.js';
import specializationsRouter from './handlers/specialization-handler.js';
import billingRouter from './handlers/billing-handler.js';
import adminsRouter from './handlers/admin-handler.js';

const app: Express = express();
const logger = container.get<Logger>(TYPES.Logger);

app.use(express.json());
app.use('/api', patientsRouter, doctorsRouter, appointmentsRouter, medicalrecordsRouter, specializationsRouter,billingRouter, adminsRouter);

app.listen(8080, async () => {
  logger.info('⚡️[server]: Server is running at http://localhost:8080');
});
