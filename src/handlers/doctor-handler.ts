import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Doctor } from '../classes/doctor.js';
import { Patient } from '../classes/patient.js';
import { MedicalRecord } from '../classes/medicalrecord.js';
import { Appointment } from '../classes/appointment.js';

const doctorsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

doctorsRouter.get('/doctors', async (_req: Request, res: Response) => {
  try {
    const specializationId = _req.query.specializationId;
    let filter = '';
    
    if (specializationId) {
      filter = `where S.SpecializationId = '${specializationId}'`;
    }
    const results: Array<Doctor> = await dbConnection.query(`select D.DoctorId, D.DoctorFName, 
    D.DoctorLName, S.Name as Specialization, S.Description, D.Phone, D.Email  from doctor D 
    join Specialization S on S.SpecializationId = D.SpecializationId ${filter}`,
    { type: QueryTypes.SELECT });

    const doctors = results.map(d => {
      return {
        DoctorId: d.DoctorId,
        DoctorName: `${d.DoctorFName} ${d.DoctorLName}`,
        Specialization: d.Specialization,
        Description: d.Description,
        Phone: d.Phone,
        Email: d.Email
      };
    });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify(doctors, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

doctorsRouter.get('/doctors/:id', async (_req: Request, res: Response) => {
  try {
    const results: Array<Doctor> = await dbConnection.query(`select * from doctor where DoctorId = 
    '${_req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const doctor = results[0];

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
        DoctorId: doctor.DoctorId,
        DoctorName: `${doctor.DoctorFName} ${doctor.DoctorLName}`,
        Specialization: doctor.Specialization,
        Phone: doctor.Phone,
        Email: doctor.Email
      }, null, 4));
    } else {
      res.header('Content-type', 'application/json').status(404).send();
    }
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

doctorsRouter.get('/doctors/:id/patients', async (_req: Request, res: Response) => {
  try {
    const results: Array<Patient> = await dbConnection.query(`select distinct P.PatientId, 
    P.PatientFName, P.PatientLName, P.DateOfBirth, P.Gender, P.Phone, P.Email from Doctor D 
    join MedicalRecord M on D.DoctorId = M.DoctorId join Patient P on M.PatientId = P.PatientId 
    where D.DoctorId = '${_req.params.id}'`, { type: QueryTypes.SELECT });

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

doctorsRouter.get('/doctors/:id/appointments', async (_req: Request, res: Response) => {
  try {
    const results: Array<Appointment> = await dbConnection.query(`select AppointmentId, PatientId, 
    AppointmentSlotId, Notes from Doctor D join Appointment A on A.DoctorId= D.DoctorId 
     where D.DoctorId = '${_req.params.id}'`, 
    { type: QueryTypes.SELECT });

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

doctorsRouter.get('/doctors/:id/patients/:pId/medical-records', async (_req: Request, res: Response) => {
  try {
    const results: Array<MedicalRecord> = await dbConnection.query(`select M.RecordId, M.DoctorId, 
    M.PatientId, M.Date, M.Diagnosis, M.Prescription from Doctor D join MedicalRecord M on 
    D.DoctorId = M.DoctorId where D.DoctorId = '${_req.params.id}' and M.PatientId = '${_req.params.pId}' `, 
    { type: QueryTypes.SELECT });

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

doctorsRouter.post('/doctors', async (_req: Request, res: Response) => {
  try {
    const doctor: Doctor = _req.body;

    await dbConnection.query(`INSERT INTO Doctor (DoctorFName, DoctorLName, SpecializationId, Phone, Email, Username) VALUES 
    ('${doctor.DoctorFName}', '${doctor.DoctorLName}', '${doctor.SpecializationId}', '${doctor.Phone}', '${doctor.Email}', '${doctor.Username}')`,
     { type: QueryTypes.INSERT });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

doctorsRouter.put('/doctors/:id', async (_req: Request, res: Response) => {
  try {
    const doctor: Doctor = _req.body;

    await dbConnection.query(`UPDATE Doctor SET DoctorFName = '${doctor.DoctorFName}', 
    DoctorLName = '${doctor.DoctorLName}', SpecializationId = '${doctor.SpecializationId}', 
    Phone = '${doctor.Phone}', Email = '${doctor.Email}' where DoctorId = '${_req.params.id}'`, 
    { type: QueryTypes.UPDATE });

      res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
    } catch (err: any) {
      res.status(500).send('Error occurred');
      logger.error('Error occurred', err.message);
    }
  });

export default doctorsRouter;
