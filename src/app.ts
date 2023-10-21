import express, { Express } from 'express';
import patientsRouter from './handlers/patient-handler.js';
import { container } from './utils/inversify-orchestrator.js';
import { Logger } from './utils/logger.js';
import { TYPES } from './utils/types.js';
import doctorsRouter from './handlers/doctor-handler.js';
import appointmentsRouter from './handlers/appointment-handler.js';
import medicalrecordsRouter from './handlers/medicalrecord-handler.js';
import billingsRouter from './handlers/billing-handler.js';

const app: Express = express();
const logger = container.get<Logger>(TYPES.Logger);

app.use(express.json());
app.use('/', patientsRouter, doctorsRouter, appointmentsRouter, medicalrecordsRouter, billingsRouter);

app.listen(8080, async () => {
  logger.info('⚡️[server]: Server is running at http://localhost:8080');
});
