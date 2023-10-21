import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Billing } from '../classes/billing.js';

const billingsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

billingsRouter.get('/billing', async (_req: Request, res: Response) => {
    try {
      const results: Array<Billing> = await dbConnection.query('select * from billing', { type: QueryTypes.SELECT });
  
      const billings = results.map(b => {
        return {
            BillingId: b.BillingId,
            PatientId: b.PatientId,
            BillingAmount: b.BillingAmount,
            BillingDate: b.BillingDate
        };
      });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify(billings, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });
  billingsRouter.get('/billing/:id', async (_req: Request, res: Response) => {
  try {
    const results: Array<Billing> = await dbConnection.query(`select * from billing where BillingId = '${_req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const billing = results[0];

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
            BillingId: billing.BillingId,
            PatientId: billing.PatientId,
            BillingAmount: billing.BillingAmount,
            BillingDate: billing.BillingDate
      }, null, 4));
    } else {
      res.header('Content-type', 'application/json').status(404).send();
    }
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

billingsRouter.post('/billing', async (_req: Request, res: Response) => {
  try {
    const billing: Billing = _req.body;

    await dbConnection.query(`INSERT INTO Billing (BillingId, PatientId, BillingAmount, BillingDate) VALUES 
    ('${billing.BillingId}', '${billing.PatientId}', '${billing.BillingAmount}', '${billing.BillingDate}')`,
     { type: QueryTypes.INSERT });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

export default billingsRouter;
