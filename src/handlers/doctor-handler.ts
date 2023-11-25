import express, { type Request, type Response } from 'express';
import { container } from '../utils/inversify-orchestrator.js';
import { type Logger } from '../utils/logger.js';
import { TYPES } from '../utils/types.js';
import { QueryTypes, Sequelize } from 'sequelize';
import { Doctor } from '../classes/doctor.js';
import { Patient } from '../classes/patient.js';
import { MedicalRecord } from '../classes/medicalrecord.js';
import { Appointment } from '../classes/appointment.js';
import { IAuthorizationRequest } from '../classes/type-definitions.js';
import { Role } from '../classes/out/user.js';
import { AppointmentSlot } from '../classes/appointmentslot.js';

const doctorsRouter = express.Router();
const logger = container.get<Logger>(TYPES.Logger);
const dbConnection = container.get<Sequelize>(TYPES.DbConnection);

const isUserAuthorized = async (username: string, doctorId: string) => {
  const results: Array<Doctor> = await dbConnection.query(`select * from Doctor where DoctorId = '${doctorId}'`, { type: QueryTypes.SELECT });

  return results[0].Username === username;
};

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

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify(doctors, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

doctorsRouter.get('/doctors/:id', async (req: Request, res: Response) => {
  try {
    const results: Array<Doctor> = await dbConnection.query(`select * from doctor where DoctorId = 
    '${req.params.id}'`, { type: QueryTypes.SELECT });

    if (results.length > 0) {
      const doctor = results[0];

      return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({
        DoctorId: doctor.DoctorId,
        DoctorName: `${doctor.DoctorFName} ${doctor.DoctorLName}`,
        Specialization: doctor.Specialization,
        Phone: doctor.Phone,
        Email: doctor.Email
      }, null, 4));
    } else {
      return res.header('Content-type', 'application/json').status(404).send();
    }
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

doctorsRouter.get('/doctors/:id/patients', async (req: Request, res: Response) => {
  try {
    const user = (<IAuthorizationRequest>req).dbUser;
    const isAuthorized = await isUserAuthorized(user.Username, req.params.id);

    if (user.Role === Role.Doctor) {
      if(!isAuthorized) {
        return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
          'Status': 'Forbidden'
        }, null, 4));
      }
    }

    const results: Array<Patient> = await dbConnection.query(`select distinct P.PatientId, 
    P.PatientFName, P.PatientLName, P.DateOfBirth, P.Gender, P.Phone, P.Email from Doctor D 
    join MedicalRecord M on D.DoctorId = M.DoctorId join Patient P on M.PatientId = P.PatientId 
    where D.DoctorId = '${req.params.id}'`, { type: QueryTypes.SELECT });

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
    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify(patients, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

doctorsRouter.get('/doctors/:id/appointments', async (req: Request, res: Response) => {
  try {
    const user = (<IAuthorizationRequest>req).dbUser;
    const isAuthorized = await isUserAuthorized(user.Username, req.params.id);

    if (user.Role === Role.Doctor) {
      if(!isAuthorized) {
        return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
          'Status': 'Forbidden'
        }, null, 4));
      }
    }

    const results: Array<Appointment> = await dbConnection.query(`select AppointmentId, PatientId, 
    AppointmentSlotId, Notes from Doctor D join Appointment A on A.DoctorId= D.DoctorId 
     where D.DoctorId = '${req.params.id}'`, 
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

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify(appointments, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

doctorsRouter.get('/doctors/:id/appointment-slots', async (req: Request, res: Response) => {
  try {
    const slots: Array<AppointmentSlot> = await dbConnection.query(`select S.AppointmentStartTime, S.AppointmentEndTime, 
    S.AppointmentSlotId from AppointmentSlot S left outer join (select * from Appointment 
    where DoctorId = '${req.params.id}') A on A.AppointmentSlotId = S.AppointmentSlotId 
    where A.AppointmentSlotId is NULL`, 
    { type: QueryTypes.SELECT });

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify(slots, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

doctorsRouter.get('/doctors/:id/patients/:pId/medical-records', async (req: Request, res: Response) => {
  try {
    const isAuthorized = await isUserAuthorized((<IAuthorizationRequest>req).dbUser.Username, req.params.id);
    if(!isAuthorized) {
      return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
        'Status': 'Forbidden'
      }, null, 4));
    }

    const results: Array<MedicalRecord> = await dbConnection.query(`select M.RecordId, M.DoctorId, 
    M.PatientId, M.Date, M.Diagnosis, M.Prescription from Doctor D join MedicalRecord M on 
    D.DoctorId = M.DoctorId where D.DoctorId = '${req.params.id}' and M.PatientId = '${req.params.pId}' `, 
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

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify(medicalrecords, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

doctorsRouter.post('/doctors', async (_req: Request, res: Response) => {
  try {
    const doctor: Doctor = _req.body;

    await dbConnection.query(`INSERT INTO Doctor (DoctorFName, DoctorLName, SpecializationId, Phone, Email, Username) VALUES 
    ('${doctor.DoctorFName}', '${doctor.DoctorLName}', '${doctor.SpecializationId}', '${doctor.Phone}', '${doctor.Email}', '${doctor.Username}')`,
     { type: QueryTypes.INSERT });

    return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    logger.error('Error occurred', err.message);
    return res.status(500).send('Error occurred');
  }
});

doctorsRouter.post('/doctors/:id/medical-records', async (req: Request, res: Response) => {
  try {
    const medicalrecord: MedicalRecord = req.body;
    const isAuthorized = await isUserAuthorized((<IAuthorizationRequest>req).dbUser.Username, medicalrecord.DoctorId);
    if(!isAuthorized) {
      return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
        'Status': 'Forbidden'
      }, null, 4));
    }

    await dbConnection.query(`INSERT INTO MedicalRecord (PatientId, DoctorId, Date, Diagnosis,Prescription) VALUES 
    ('${medicalrecord.PatientId}', '${medicalrecord.DoctorId}', '${medicalrecord.Date}', '${medicalrecord.Diagnosis}','${medicalrecord.Prescription}' )`,
     { type: QueryTypes.INSERT });

    res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
  } catch (err: any) {
    res.status(500).send('Error occurred');
    logger.error('Error occurred', err.message);
  }
});

doctorsRouter.put('/doctors/:id', async (req: Request, res: Response) => {
  try {
    const user = (<IAuthorizationRequest>req).dbUser;
    const isAuthorized = await isUserAuthorized(user.Username, req.params.id);

    if (user.Role === Role.Doctor) {
      if(!isAuthorized) {
        return res.header('Content-type', 'application/json').status(403).send(JSON.stringify({ 
          'Status': 'Forbidden'
        }, null, 4));
      }
    }

    const doctor: Doctor = req.body;

    await dbConnection.query(`UPDATE Doctor SET DoctorFName = '${doctor.DoctorFName}', 
    DoctorLName = '${doctor.DoctorLName}', SpecializationId = '${doctor.SpecializationId}', 
    Phone = '${doctor.Phone}', Email = '${doctor.Email}' where DoctorId = '${req.params.id}'`, 
    { type: QueryTypes.UPDATE });

      return res.header('Content-type', 'application/json').status(200).send(JSON.stringify({'Status': 'Success'}, null, 4));
    } catch (err: any) {
      logger.error('Error occurred', err.message);
      return res.status(500).send('Error occurred');
    }
  });

export default doctorsRouter;
