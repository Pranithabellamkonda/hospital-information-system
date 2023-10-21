import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Appointment } from '../classes/appointment.js';

const appointmentsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

appointmentsRouter.get('/appointments', async (_req: Request, res: Response) => {
    try {
      const results: Array<Appointment> = await dbConnection.query('select * from appointment', { type: QueryTypes.SELECT });
  
      const appointments = results.map(a => {
        return {
            AppointmentId: a.AppointmentId,
            PatientId: a.PatientId,
            DoctorId: a.DoctorId,
            AppointmentDate: a.AppointmentDate,
            Notes: a.Notes
        };
      });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify(appointments, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });
appointmentsRouter.get('/appointments/:id', async (_req: Request, res: Response) => {
  try {
    const results: Array<Appointment> = await dbConnection.query(`select * from appointment where AppointmentId = '${_req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const appointment = results[0];

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
        AppointmentId: appointment.AppointmentId,
        PatientId: appointment.PatientId,
        DoctorId: appointment.DoctorId,
        AppointmentDate: appointment.AppointmentDate,
        Notes: appointment.Notes
      }, null, 4));
    } else {
      res.header('Content-type', 'application/json').status(404).send();
    }
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

appointmentsRouter.post('/appointments', async (_req: Request, res: Response) => {
  try {
    const appointment: Appointment = _req.body;

    await dbConnection.query(`INSERT INTO Appointment (AppointmentId, PatientId, DoctorId, AppointmentDate, Notes) VALUES 
    ('${appointment.AppointmentId}', '${appointment.PatientId}', '${appointment.DoctorId}', '${appointment.AppointmentDate}', '${appointment.Notes}')`,
     { type: QueryTypes.INSERT });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

export default appointmentsRouter;
