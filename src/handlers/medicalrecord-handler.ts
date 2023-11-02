import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { MedicalRecord } from '../classes/medicalrecord.js';

const medicalrecordsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

medicalrecordsRouter.get('/medical-records', async (_req: Request, res: Response) => {
    try {
      const results: Array<MedicalRecord> = await dbConnection.query('select * from medicalrecord', { type: QueryTypes.SELECT });
  
      const medicalrecords = results.map(m => {
        return {
            RecordId: m.RecordId,
            PatientId: m.PatientId,
            DoctorId: m.DoctorId,
            Date: m.Date,
            Diagnosis: m.Diagnosis,
            Prescription: m.Prescription
        };
      });
  
      res.header('Content-type', 'application/json').status(200).send(JSON.stringify(medicalrecords, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });
  medicalrecordsRouter.get('/medical-records/:id', async (_req: Request, res: Response) => {
  try {
    const results: Array<MedicalRecord> = await dbConnection.query(`select * from medicalrecord where RecordId = '${_req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const medicalrecord = results[0];

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
            RecordId: medicalrecord.RecordId,
            PatientId: medicalrecord.PatientId,
            DoctorId: medicalrecord.DoctorId,
            Date: medicalrecord.Date,
            Diagnosis: medicalrecord.Diagnosis,
            Prescription: medicalrecord.Prescription
      }, null, 4));
    } else {
      res.header('Content-type', 'application/json').status(404).send();
    }
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

medicalrecordsRouter.post('/medical-records', async (_req: Request, res: Response) => {
  try {
    const medicalrecord: MedicalRecord = _req.body;

    await dbConnection.query(`INSERT INTO MedicalRecord (PatientId, DoctorId, Date, Diagnosis,Prescription) VALUES 
    ('${medicalrecord.PatientId}', '${medicalrecord.DoctorId}', '${medicalrecord.Date}', '${medicalrecord.Diagnosis}','${medicalrecord.Prescription}' )`,
     { type: QueryTypes.INSERT });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

export default medicalrecordsRouter;
