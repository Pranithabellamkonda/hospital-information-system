import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Patient } from '../classes/patient.js';
import { MedicalRecord } from '../classes/medicalrecord.js';
import { Appointment } from '../classes/appointment.js';
import { Billing } from '../classes/billing.js';

const patientsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

patientsRouter.get('/patients', async (_req: Request, res: Response) => {
  try {
    const results: Array<Patient> = await dbConnection.query('select * from patient', { type: QueryTypes.SELECT });

    const patients = results.map(p => {
      return {
        PatientId: p.PatientId,
        PatientName: `${p.PatientFName} ${p.PatientLName}`,
        DateOfBirth: p.DateOfBirth,
        Gender: p.Gender,
        Phone: p.Phone,
        Email: p.Email
      };
    });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify(patients, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

patientsRouter.get('/patients/:id', async (_req: Request, res: Response) => {
  try {
    const results: Array<Patient> = await dbConnection.query(`select * from patient where PatientId = '${_req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const patient = results[0];

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
        PatientId: patient.PatientId,
        PatientName: `${patient.PatientFName} ${patient.PatientLName}`,
        DateOfBirth: patient.DateOfBirth,
        Gender: patient.Gender,
        Phone: patient.Phone,
        Email: patient.Email
      }, null, 4));
    } else {
      res.header('Content-type', 'application/json').status(404).send();
    }
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

patientsRouter.get('/patients/:id/medical-records', async (_req: Request, res: Response) => {
  try {
    const results: Array<MedicalRecord> = await dbConnection.query(`select M.RecordId, M.DoctorId, D.DoctorFName, D.DoctorLName,
    M.PatientId, M.Date, M.Diagnosis, M.Prescription from Patient P join MedicalRecord M on 
    P.PatientId = M.PatientId join Doctor D on M.DoctorId = D.DoctorId where P.PatientId = '${_req.params.id}'`, 
    { type: QueryTypes.SELECT });

    const medicalrecords = results.map(m => {
      return {
          RecordId: m.RecordId,
          PatientId: m.PatientId,
          DoctorId: m.DoctorId,
          DoctorName: `${m.DoctorFName} ${m.DoctorLName}`,
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

patientsRouter.get('/patients/:id/appointments', async (_req: Request, res: Response) => {
  try {
    const results: Array<Appointment> = await dbConnection.query(`select A.AppointmentId, A.DoctorId, D.DoctorFName, D.DoctorLName, A.PatientId, A.Notes,
    S.AppointmentSlotId, S.AppointmentStartTime, S.AppointmentEndTime from Appointment A 
    join AppointmentSlot S on S.AppointmentSlotId = A.AppointmentSlotId join Doctor D on A.DoctorId = D.DoctorId where A.PatientId = '${_req.params.id}'`, 
    { type: QueryTypes.SELECT });

    const appointments = results.map(a => {
      return {
          AppointmentId: a.AppointmentId,
          PatientId: a.PatientId,
          DoctorId: a.DoctorId,
          DoctorName: `${a.DoctorFName} ${a.DoctorLName}`,
          AppointmentSlotId: a.AppointmentSlotId,
          AppointmentStartTime: a.AppointmentStartTime,
          AppointmentEndTime: a.AppointmentEndTime,
          Notes: a.Notes
      };
    });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify(appointments, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

patientsRouter.get('/patients/:id/billing', async (_req: Request, res: Response) => {
  try {
      const results: Array<Billing> = await dbConnection.query(`select * from billing where PatientId = '${_req.params.id}'`, 
      { type: QueryTypes.SELECT });
  
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

patientsRouter.post('/patients', async (_req: Request, res: Response) => {
  try {
    const patient: Patient = _req.body;

    await dbConnection.query(`INSERT INTO Patient (PatientFName, PatientLName, DateOfBirth, Gender, Phone, Email) VALUES 
    ('${patient.PatientFName}', '${patient.PatientLName}', '${patient.DateOfBirth}','${patient.Gender}', '${patient.Phone}', '${patient.Email}')`,
     { type: QueryTypes.INSERT });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

patientsRouter.put('/patients/:id', async (_req: Request, res: Response) => {
  try {
    const patient: Patient = _req.body;

    await dbConnection.query(`UPDATE Patient SET PatientFName = '${patient.PatientFName}', 
    PatientLName = '${patient.PatientLName}', DateOfBirth = '${patient.DateOfBirth}',
    Gender = '${patient.Gender}', Phone = '${patient.Phone}', Email = '${patient.Email}'
    where PatientId = '${_req.params.id}'`, { type: QueryTypes.UPDATE });

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

export default patientsRouter;
