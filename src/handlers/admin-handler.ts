import express, { type Request, type Response } from 'express';
import { QueryTypes, Sequelize } from 'sequelize';
import { Admin } from '../classes/admin.js';
import { Billing } from '../classes/billing.js';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';

const adminsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

adminsRouter.get('/admins', async (_req: Request, res: Response) => {
    try {
      const results: Array<Admin> = await dbConnection.query('select * from admin', { type: QueryTypes.SELECT });
  
      const admin = results.map(a => {
        return {
            AdminId: a.AdminId,
            AdminName: `${a.AdminFName} ${a.AdminLName}`,
            Phone: a.Phone,
            Email: a.Email
        };
      });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify(admin, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

  adminsRouter.get('/admins/:id', async (_req: Request, res: Response) => {
    try {
      const results: Array<Admin> = await dbConnection.query(`select * from admin where AdminId = '${_req.params.id}'`, { type: QueryTypes.SELECT });
  
      if (results.length > 0) {
        const admin = results[0];
  
        res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
            AdminId: admin.AdminId,
            AdminName: `${admin.AdminFName} ${admin.AdminLName}`
        }, null, 4));
      } else {
        res.header('Content-type', 'application/json').status(404).send();
      }
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

  adminsRouter.get('/admins/:id/billing',  async (_req: Request, res: Response) => {
    try {
      const results: Array<Billing> = await dbConnection.query(`select b.BillingId, b.PatientId, p.PatientFName, p.PatientLName,b.BillingAmount, b.BillingDate from billing b join patient p  on b.PatientId = p.PatientId  where AdminId = '${_req.params.id}'`, { type: QueryTypes.SELECT });
  
        const b = results[0];
  
        res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
            BillingId: b.BillingId,
            PatientId: b.PatientId,
            PatientName: `${b.PatientFName} ${b.PatientLName}`,
            BillingAmount: b.BillingAmount,
            BillingDate: b.BillingDate
        }, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

  adminsRouter.post('/admin/:id/billing', async (_req: Request, res: Response) => {
    try {
        const billing: Billing  = _req.body;

      await dbConnection.query(`INSERT INTO Billing (PatientId, BillingAmount, BillingDate, AdminId) 
      VALUES ('${billing.PatientId}','${billing.BillingAmount}','${billing.BillingDate}','${billing.AdminId}')`, { type: QueryTypes.INSERT });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });
  
  export default adminsRouter;