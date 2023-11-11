import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Specialization } from '../classes/specialization.js';

const specializationsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

specializationsRouter.get('/specializations', async (_req: Request, res: Response) => {
    try {
      const results: Array<Specialization> = await dbConnection.query('select * from Specialization', { type: QueryTypes.SELECT });
  
      const specializations = results.map(s => {
        return {
            SpecializationId: s.SpecializationId,
            Name: s.Name,
            Description: s.Description
        };
      });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify(specializations, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

  specializationsRouter.get('/specializations/:id', async (_req: Request, res: Response) => {
    try {
      const results: Array<Specialization> = await dbConnection.query(`select * from Specialization 
      where SpecializationId = '${_req.params.id}'`, { type: QueryTypes.SELECT });
  
      if (results.length > 0) {
        const specialization = results[0];
  
        res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
            SpecializationId: specialization.SpecializationId,
            Name: specialization.Name,
            Description: specialization.Description
        }, null, 4));
      } else {
        res.header('Content-type', 'application/json').status(404).send();
      }
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

  specializationsRouter.post('/specializations', async (_req: Request, res: Response) => {
    try {
      const specialization: Specialization = _req.body;
  
      await dbConnection.query(`INSERT INTO Specialization (Name, Description) VALUES 
      ('${specialization.Name}', '${specialization.Description}')`,
       { type: QueryTypes.INSERT });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

  export default specializationsRouter;