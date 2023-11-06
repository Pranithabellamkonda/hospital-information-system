import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Billing } from '../classes/billing.js';

const billingRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

billingRouter.get('/billing', async (_req: Request, res: Response) => {
  try {
      const results: Array<Billing> = await dbConnection.query('select * from billing', { type: QueryTypes.SELECT });
  
      const billing = results.map(b => {
        return {
            BillingId: b.BillingId,
            PatientId: b.PatientId,
            BillingAmount: b.BillingAmount,
            BillingDate: b.BillingDate,
            AdminId: b.AdminId
        };
      });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify(billing, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});
  
billingRouter.post('/billing', async (_req: Request, res: Response) => {
  try {
      const billing: Billing  = _req.body;

    await dbConnection.query(`INSERT INTO Billing (PatientId, AdminId,BillingAmount, BillingDate) 
    VALUES ('${billing.PatientId}','${billing.AdminId}','${billing.BillingAmount}','${billing.BillingDate}')`, { type: QueryTypes.INSERT });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

export default billingRouter;
