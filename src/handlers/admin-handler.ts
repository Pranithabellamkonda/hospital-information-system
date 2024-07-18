import express, { type Request, type Response } from 'express';
import { QueryTypes, Sequelize } from 'sequelize';
import { Admin } from '../classes/admin.js';
import { Billing } from '../classes/billing.js';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { IAuthorizationRequest } from '../classes/type-definitions.js';

const adminsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

const isUserAuthorized = async (username: string, adminId: string) => {
  const results: Array<Admin> = await dbConnection.query(`select * from Admin where AdminId = '${adminId}'`, { type: QueryTypes.SELECT });

  return results[0].Username === username;
};

adminsRouter.get('/admins', async (_req: Request, res: Response) => {
    try {
      const results: Array<Admin> = await dbConnection.query('select * from Admin', { type: QueryTypes.SELECT });
  
      const admin = results.map(a => {
        return {
            AdminId: a.AdminId,
            AdminName: `${a.AdminFName} ${a.AdminLName}`,
            Phone: a.Phone,
            Email: a.Email
        };
      });
  
      return res.header('Content-type', 'application/json').status(200).send(JSON.stringify(admin, null, 4));
    } catch (err: any) {
      logger.error('Error occurred', err.message);
      return res.status(500).send('Error occurred');
    }
  });

adminsRouter.get('/admins/:id', async (req: Request, res: Response) => {
  try {
    const results: Array<Admin> = await dbConnection.query(`select * from Admin where AdminId = '${req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const admin = results[0];

      if (admin.Username !== (<IAuthorizationRequest>req).dbUser.Username) {
        return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
          'Status': 'Forbidden'
        }, null, 4));
      }

      return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
          AdminId: admin.AdminId,
          AdminName: `${admin.AdminFName} ${admin.AdminLName}`
      }, null, 4));
    } else {
      return res.header('Content-type', 'application/json').status(404).send();
    }
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

adminsRouter.get('/admins/:id/billing',  async (req: Request, res: Response) => {
  try {
    const results: Array<Billing> = await dbConnection.query(`select b.BillingId, b.PatientId, p.PatientFName, 
    p.PatientLName,b.BillingAmount, b.BillingDate from Billing b join Patient p  on b.PatientId = p.PatientId  
    where AdminId = '${req.params.id}'`, { type: QueryTypes.SELECT });

      const b = results[0];

      return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
          BillingId: b.BillingId,
          PatientId: b.PatientId,
          PatientName: `${b.PatientFName} ${b.PatientLName}`,
          BillingAmount: b.BillingAmount,
          BillingDate: b.BillingDate
      }, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

adminsRouter.post('/admins/:id/billing', async (req: Request, res: Response) => {
  try {
    const billing: Billing  = req.body;
    const isAuthorized = await isUserAuthorized((<IAuthorizationRequest>req).dbUser.Username, billing.AdminId);
    if(!isAuthorized) {
      return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
        'Status': 'Forbidden'
      }, null, 4));
    }

    await dbConnection.query(`INSERT INTO Billing (PatientId, BillingAmount, BillingDate, AdminId) 
    VALUES ('${billing.PatientId}','${billing.BillingAmount}','${billing.BillingDate}','${billing.AdminId}')`, 
    { type: QueryTypes.INSERT });

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

adminsRouter.put('/admins/:id', async (req: Request, res: Response) => {
  try {
    const isAuthorized = await isUserAuthorized((<IAuthorizationRequest>req).dbUser.Username, req.params.id);
    if(!isAuthorized) {
      return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
        'Status': 'Forbidden'
      }, null, 4));
    }

    const admin: Admin = req.body;

    await dbConnection.query(`UPDATE Admin SET AdminFName = '${admin.AdminFName}', 
    AdminLName = '${admin.AdminLName}', Phone = '${admin.Phone}', Email = '${admin.Email}' 
    where AdminId = '${req.params.id}'`, { type: QueryTypes.UPDATE });

      return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
    } catch (err: any) {
      logger.error('Error occurred', err.message);
      return res.status(500).send('Error occurred');
    }
  });

export default adminsRouter;