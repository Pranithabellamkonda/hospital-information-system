import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { AppointmentSlot } from '../classes/appointmentslot.js';

const appointmentslotsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

appointmentslotsRouter.get('/appointment-slots', async (_req: Request, res: Response) => {
    try {
      const results: Array<AppointmentSlot> = await dbConnection.query('select * from AppointmentSlot', { type: QueryTypes.SELECT });
  
      const appointmentslot = results.map(a => {
        return {
            AppointmentSlotId: a.AppointmentSlotId,
            AppointmentStartTime: a.AppointmentStartTime,
            AppointmentEndTime: a.AppointmentEndTime
        };
      });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify(appointmentslot, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

  appointmentslotsRouter.get('/appointment-slots/:id', async (_req: Request, res: Response) => {
    try {
      const results: Array<AppointmentSlot> = await dbConnection.query(`select * from Admin where AppointmentSlotId = '${_req.params.id}'`, { type: QueryTypes.SELECT });
  
      if (results.length > 0) {
        const appointmentslot = results[0];
  
        res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
            AppointmentSlotId: appointmentslot.AppointmentSlotId,
            AppointmentStartTime: appointmentslot.AppointmentStartTime,
            AppointmentEndTime: appointmentslot.AppointmentEndTime
        }, null, 4));
      } else {
        res.header('Content-type', 'application/json').status(404).send();
      }
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });
  
  export default appointmentslotsRouter;