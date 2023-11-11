import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Appointment } from '../classes/appointment.js';
import { IAuthorizationRequest } from '../classes/type-definitions.js';
import { Role } from '../classes/out/user.js';
import { Patient } from '../classes/patient.js';

const appointmentsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

appointmentsRouter.get('/appointments', async (_req: Request, res: Response) => {
    try {
      const results: Array<Appointment> = await dbConnection.query('select * from Appointment', { type: QueryTypes.SELECT });
  
      const appointments = results.map(a => {
        return {
            AppointmentId: a.AppointmentId,
            PatientId: a.PatientId,
            DoctorId: a.DoctorId,
            AppointmentSlotId: a.AppointmentSlotId,
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
    const results: Array<Appointment> = await dbConnection.query(`select * from Appointment where AppointmentId = '${_req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const appointment = results[0];

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
        AppointmentId: appointment.AppointmentId,
        PatientId: appointment.PatientId,
        DoctorId: appointment.DoctorId,
        AppointmentSlotId: appointment.AppointmentSlotId,
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

appointmentsRouter.post('/appointments', async (req: Request, res: Response) => {
    try {
      const appointment: Appointment = req.body;
      const user = (<IAuthorizationRequest>req).dbUser;

    if (user.Role === Role.Patient) {
      const results : Array<Patient> = await dbConnection.query(`SELECT P.PatientId FROM User U JOIN Patient P 
      ON P.Username = U.Username WHERE U.Username = '${user.Username}'`, { type: QueryTypes.SELECT });

      if(results[0].PatientId !== appointment.PatientId) {
        return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
          'Status': 'Forbidden'
        }, null, 4));
      }
    }
  
      await dbConnection.query(`INSERT INTO Appointment (PatientId, DoctorId, AppointmentSlotId, Notes) VALUES 
      ('${appointment.PatientId}', '${appointment.DoctorId}', '${appointment.AppointmentSlotId}', '${appointment.Notes}')`,
      { type: QueryTypes.INSERT });

      return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
    } catch (err: any) {
      logger.error('Error occurred', err.message);
      return res.status(500).send('Error occurred');
    }
});

appointmentsRouter.patch('/appointments/:id', async (req: Request, res: Response) => {
  try {
    const appointment: Appointment = req.body;
    const user = (<IAuthorizationRequest>req).dbUser;

    if (user.Role === Role.Patient) {
      const results : Array<Patient> = await dbConnection.query(`SELECT P.Username FROM Appointment A JOIN Patient P ON 
      A.PatientId = P.PatientId WHERE AppointmentId = ${req.params.id}`, { type: QueryTypes.SELECT });
      if(results[0].Username !== user.Username) {
        return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
          'Status': 'Forbidden'
        }, null, 4));
      }
    }

    await dbConnection.query(`UPDATE Appointment SET AppointmentSlotId = '${appointment.AppointmentSlotId}', 
    Notes = '${appointment.Notes}' where AppointmentId = '${req.params.id}'`, { type: QueryTypes.UPDATE });

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

appointmentsRouter.delete('/appointments/:id', async (req: Request, res: Response) => {
  try {
    const user = (<IAuthorizationRequest>req).dbUser;

    if (user.Role === Role.Patient) {
      const results : Array<Patient> = await dbConnection.query(`SELECT P.Username FROM Appointment A JOIN Patient P ON 
      A.PatientId = P.PatientId WHERE AppointmentId = ${req.params.id}`, { type: QueryTypes.SELECT });
      if(results[0].Username !== user.Username) {
        return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
          'Status': 'Forbidden'
        }, null, 4));
      }
    }

    await dbConnection.query(`DELETE FROM Appointment WHERE AppointmentId = '${req.params.id}'`, { type: QueryTypes.DELETE });

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

export default appointmentsRouter;
