USE HIS;

CREATE TABLE Patient(
	PatientId varchar(25) NOT NULL,
    PatientFName varchar(25) NOT NULL,
    PatientLName varchar(25) NOT NULL,
    DateOfBirth date NOT NULL,
    Gender varchar(10),
    Phone varchar(25) NOT NULL,
    Email varchar(50),
    PRIMARY KEY (PatientID)
);

CREATE TABLE Doctor(
	DoctorId varchar(25) NOT NULL,
    DoctorFName varchar(25) NOT NULL,
    DoctorLName varchar(25) NOT NULL,
    Specialization varchar(50) NOT NULL,
    Phone varchar(25) NOT NULL,
    Email varchar(50),
    PRIMARY KEY (DoctorID)
);

CREATE TABLE Appointment(
AppointmentId varchar(25) NOT NULL,
PatientId varchar(25) NOT NULL,
DoctorId varchar(25) NOT NULL,
AppointmentDate date NOT NULL,
Notes varchar(50) DEFAULT NULL,
PRIMARY KEY (AppointmentID),
FOREIGN KEY (PatientID) REFERENCES Patient(PatientID),
FOREIGN KEY (DoctorID) REFERENCES Doctor(DoctorID)
);

CREATE TABLE MedicalRecord(
	RecordId varchar(25) NOT NULL,
    PatientId varchar(25) NOT NULL,
    DoctorId varchar(25) NOT NULL,
    Date date NOT NULL,
    Diagnosis varchar(50) NOT NULL,
    Prescription varchar(50) NOT NULL,
    PRIMARY KEY(RecordId),
    FOREIGN KEY (PatientId) REFERENCES Patient(PatientId),
    FOREIGN KEY (DoctorId) REFERENCES Doctor(DoctorId)
);

CREATE TABLE Billing(
	BillingId varchar(25) NOT NULL,
    PatientId varchar(25) NOT NULL,
    BillingAmount decimal(10,2) NOT NULL,
    BillingDate date NOT NULL,
    PRIMARY KEY(BillingId),
    FOREIGN KEY (PatientId) REFERENCES Patient(PatientId)
);


INSERT INTO Patient (PatientId, PatientFName, PatientLName, DateOfBirth, Gender, Phone, Email)
VALUES 
('P001', 'John', 'Doe', '1990-05-15', 'Male', '+1234567890', 'john.doe@example.com'),
('P002', 'Alice', 'Johnson', '1985-09-20', 'Female', '+1987654321', 'alice.j@example.com'),
('P003', 'Michael', 'Smith', '1978-03-10', 'Male', '+1765432109', 'michael.smith@example.com'),
('P004', 'Emily', 'Brown', '1995-12-28', 'Female', '+1456789023', 'emily.b@example.com');

INSERT INTO Doctor (DoctorId, DoctorFName, DoctorLName, Specialization, Phone, Email)
VALUES 
('D001', 'Dr. Sarah', 'Johnson', 'Cardiologist', '+1122334455', 'sarah.j@example.com'),
('D002', 'Dr. David', 'Miller', 'Orthopedic Surgeon', '+1567890123', 'david.m@example.com'),
('D003', 'Dr. Lisa', 'Anderson', 'Dermatologist', '+1987654321', 'lisa.a@example.com'),
('D004', 'Dr. James', 'Wilson', 'Neurologist', '+1654321098', 'james.w@example.com');

INSERT INTO Appointment (AppointmentId, PatientId, DoctorId, AppointmentDate, Notes)
VALUES 
('A001', 'P001', 'D001', '2023-10-18', 'Regular checkup'),
('A002', 'P002', 'D002', '2023-10-20', 'Pain in the knee'),
('A003', 'P003', 'D003', '2023-10-22', 'Skin rash issue'),
('A004', 'P004', 'D004', '2023-10-25', 'Headaches and dizziness');

INSERT INTO MedicalRecord (RecordId, PatientId, DoctorId, Date, Diagnosis, Prescription)
VALUES 
('M001', 'P001', 'D001', '2023-10-18', 'Hypertension', 'Prescribed medication for blood pressure'),
('M002', 'P002', 'D002', '2023-10-20', 'Knee strain', 'Physical therapy sessions prescribed'),
('M003', 'P003', 'D003', '2023-10-22', 'Allergic dermatitis', 'Prescribed topical ointment'),
('M004', 'P004', 'D004', '2023-10-25', 'Migraine', 'Prescribed migraine relief medication');

INSERT INTO Billing (BillingId, PatientId, BillingAmount, BillingDate)
VALUES 
('B001', 'P001', 150.00, '2023-10-19'),
('B002', 'P002', 200.50, '2023-10-21'),
('B003', 'P003', 75.25, '2023-10-23'),
('B004', 'P004', 120.75, '2023-10-26');









