USE HIS;

CREATE TABLE User (
    Username VARCHAR(25) NOT NULL PRIMARY KEY,
    HashedPassword VARCHAR(300) NOT NULL,
    Salt VARCHAR(200) NOT NULL,
    Role ENUM('Doctor', 'Patient', 'Admin')
);

CREATE TABLE Patient (
    PatientId INT AUTO_INCREMENT PRIMARY KEY,
    PatientFName VARCHAR(25) NOT NULL,
    PatientLName VARCHAR(25) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Gender VARCHAR(10),
    Phone VARCHAR(25) NOT NULL,
    Email VARCHAR(50)
);

CREATE TABLE Specialization (
    SpecializationId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(25) NOT NULL,
    Description VARCHAR(50) NOT NULL
);


CREATE TABLE Doctor (
    DoctorId INT AUTO_INCREMENT PRIMARY KEY,
    DoctorFName VARCHAR(25) NOT NULL,
    DoctorLName VARCHAR(25) NOT NULL,
    SpecializationId INT NOT NULL,
    Phone VARCHAR(25) NOT NULL,
    Email VARCHAR(50),
    Username VARCHAR(50) NOT NULL,
    FOREIGN KEY (SpecializationId)
        REFERENCES Specialization (SpecializationId),
	FOREIGN KEY (Username) 
		REFERENCES User(Username)
);


CREATE TABLE AppointmentSlot (
    AppointmentSlotId INT AUTO_INCREMENT PRIMARY KEY,
    AppointmentStartTime DATETIME NOT NULL,
    AppointmentEndTime DATETIME NOT NULL
);
       
            
CREATE TABLE Appointment (
    AppointmentId INT AUTO_INCREMENT PRIMARY KEY,
    AppointmentSlotId INT NOT NULL,
    DoctorId INT NOT NULL,
    PatientId INT NOT NULL,
    Notes VARCHAR(500) DEFAULT NULL,
    FOREIGN KEY (AppointmentSlotId)
        REFERENCES AppointmentSlot (AppointmentSlotId)
        ON DELETE CASCADE,
    FOREIGN KEY (DoctorId)
        REFERENCES Doctor (DoctorId)
        ON DELETE CASCADE,
    FOREIGN KEY (PatientId)
        REFERENCES Patient (PatientId)
        ON DELETE CASCADE,
    CONSTRAINT UniqueDoctorSlot UNIQUE (DoctorId , AppointmentSlotId),
    CONSTRAINT UniquePatientSlot UNIQUE (PatientId , AppointmentSlotId)
);

CREATE TABLE Admin (
    AdminId INT AUTO_INCREMENT PRIMARY KEY,
    AdminFName VARCHAR(25) NOT NULL,
    AdminLName VARCHAR(25) NOT NULL,
    Phone VARCHAR(25) NOT NULL,
    Email VARCHAR(50) NOT NULL,
    Username VARCHAR(50) NOT NULL,
    FOREIGN KEY (Username) 
		REFERENCES User(Username)
);

CREATE TABLE Billing (
    BillingId INT AUTO_INCREMENT PRIMARY KEY,
    AdminId INT NOT NULL,
    PatientId INT NOT NULL,
    BillingAmount DECIMAL(10 , 2 ) NOT NULL,
    BillingDate DATE NOT NULL,
    FOREIGN KEY (PatientId)
        REFERENCES Patient (PatientId),
    FOREIGN KEY (AdminId)
        REFERENCES Admin (AdminId)
);



CREATE TABLE MedicalRecord (
    RecordId INT AUTO_INCREMENT PRIMARY KEY,
    PatientId INT NOT NULL,
    DoctorId INT NOT NULL,
    Date DATE NOT NULL,
    Diagnosis VARCHAR(50) NOT NULL,
    Prescription VARCHAR(50) NOT NULL,
    FOREIGN KEY (PatientId)
        REFERENCES Patient (PatientId),
    FOREIGN KEY (DoctorId)
        REFERENCES Doctor (DoctorId)
);

/* Do not run the following every time. 
It is only supposed to be run once to pre-populate data for 1 month. */
DELIMITER //
CREATE PROCEDURE `PopulateAppointmentSlotsForMonth`()
BEGIN
    DECLARE today_date DATE;
    DECLARE end_date DATE;
    DECLARE current_datetime DATETIME;
    
    SET today_date = CURDATE();
    SET end_date = DATE_ADD(CURDATE(), INTERVAL 1 MONTH);
    
    WHILE today_date <= end_date DO
        SET current_datetime = TIMESTAMP(today_date, '09:00:00');
        
        WHILE HOUR(current_datetime) < 17 DO
            IF HOUR(current_datetime) <> 12 THEN
                INSERT INTO AppointmentSlot (AppointmentStartTime, AppointmentEndTime)
                VALUES (current_datetime, DATE_ADD(current_datetime, INTERVAL 1 HOUR));
            END IF;
            
            SET current_datetime = DATE_ADD(current_datetime, INTERVAL 1 HOUR);
        END WHILE;
        
        SET today_date = DATE_ADD(today_date, INTERVAL 1 DAY);
    END WHILE;
END //
DELIMITER ;


/* Run the following procedure every day to add slots for a new day 1 month from now and
 delete the appointment slots for yesterday. */
DELIMITER //

CREATE PROCEDURE PopulateAppointmentSlotsForOneDay()
BEGIN
    DECLARE target_date DATE;
    DECLARE current_datetime DATETIME;
    
    -- Calculate the target date (one month from today)
    SET target_date = DATE_ADD(CURDATE(), INTERVAL 1 MONTH);
    
    -- Delete outdated records for the target date
    DELETE FROM AppointmentSlot WHERE DATE(AppointmentStartTime) = target_date;
    
    -- Add slots for each hour between 9 AM and 5 PM excluding noon to 1 PM
    SET current_datetime = TIMESTAMP(target_date, '09:00:00');
    
    WHILE HOUR(current_datetime) < 17 DO
        IF HOUR(current_datetime) <> 12 THEN
            INSERT INTO AppointmentSlot (AppointmentStartTime, AppointmentEndTime)
            VALUES (current_datetime, DATE_ADD(current_datetime, INTERVAL 1 HOUR));
        END IF;
        
        SET current_datetime = DATE_ADD(current_datetime, INTERVAL 1 HOUR);
    END WHILE;
END //

DELIMITER ;



CREATE EVENT PopulateAppointmentSlotsEvent
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '00:00:00')
DO
CALL PopulateAppointmentSlotsForOneDay();

CALL PopulateAppointmentSlotsForOneDay();


INSERT INTO Specialization (Name, Description)
VALUES 
    ('Cardiology', 'Specializing in heart-related issues'),
    ('Dermatology', 'Specializing in skin diseases'),
    ('Orthopedics', 'Specializing in bone and joint problems'),
    ('Oncology', 'Specializing in cancer treatment'),
    ('Pediatrics', 'Specializing in child health'),
    ('Neurology', 'Specializing in nervous system disorders'),
    ('Gastroenterology', 'Specializing in digestive system disorders'),
    ('Endocrinology', 'Specializing in hormonal disorders'),
    ('Ophthalmology', 'Specializing in eye diseases'),
    ('Urology', 'Specializing in urinary tract and male reproductive system issues');

INSERT INTO Doctor (DoctorFName, DoctorLName, SpecializationId, Phone, Email, Username)
VALUES 
    ('John', 'Smith', 11, '123-456-7890', 'john.smith@example.com', 'johnsmith123'),
    ('Alice', 'Johnson', 12, '987-654-3210', 'alice.j@example.com', 'alicejohnson456'),
    ('Michael', 'Davis', 13, '555-123-4567', 'michael.d@example.com', 'michaeldavis789'),
    ('Emily', 'Brown', 14, '111-222-3333', 'emily.b@example.com', 'emilybrown101'),
    ('David', 'Lee', 15, '333-444-5555', 'david.l@example.com', 'davidlee2022'),
    ('Olivia', 'Johnson', 16, '555-666-7777', 'olivia.j@example.com', 'oliviajohnson77'),
    ('Daniel', 'Martinez', 17, '777-888-9999', 'daniel.m@example.com', 'danielmartinez888'),
    ('Sophia', 'Williams',18, '888-999-0000', 'sophia.w@example.com', 'sophiawilliams999'),
    ('Liam', 'Anderson', 19, '222-333-4444', 'liam.a@example.com', 'liamanderson222'),
    ('Ava', 'Garcia', 20, '444-555-6666', 'ava.g@example.com', 'avagarcia444');
    
INSERT INTO Admin (AdminFName, AdminLName, Phone, Email)
VALUES 
    ('Pranitha', 'B', '123-406-7890', 'pranitha.b@example.com'),
    ('Rekha', 'S', '987-664-3210', 'rekha.s@example.com'),
    ('Youssef', 'E','555-129-4567', 'youssef.e@example.com');

INSERT INTO Patient (PatientFName, PatientLName, DateOfBirth, Gender, Phone, Email)
VALUES 
    ('John', 'Doe', '1980-05-15', 'Male', '123-456-7890', 'john.doe@example.com'),
    ('Alice', 'Smith', '1982-09-22', 'Female', '987-654-3210', 'alice.smith@example.com'),
    ('Michael', 'Johnson', '1978-07-10', 'Male', '555-123-4567', 'michael.j@example.com'),
    ('Emily', 'Davis', '1991-03-28', 'Female', '111-222-3333', 'emily.d@example.com'),
    ('David', 'Clark', '1985-11-19', 'Male', '999-888-7777', 'david.c@example.com'),
    ('Emma', 'Lee', '1983-08-05', 'Female', '333-444-5555', 'emma.lee@example.com'),
    ('James', 'Moore', '1989-12-09', 'Male', '777-666-5555', 'james.moore@example.com'),
    ('Olivia', 'Anderson', '1987-06-17', 'Female', '222-333-4444', 'olivia.a@example.com'),
    ('Sophia', 'Brown', '1984-04-02', 'Female', '444-555-6666', 'sophia.b@example.com'),
    ('Daniel', 'Martinez', '1979-01-25', 'Male', '666-777-8888', 'daniel.m@example.com'),
    ('Liam', 'Wilson', '1988-07-18', 'Male', '123-234-3456', 'liam.w@example.com'),
    ('Ava', 'Johnson', '1986-02-12', 'Female', '345-456-5678', 'ava.j@example.com'),
    ('Oliver', 'Moore', '1981-09-29', 'Male', '567-678-7890', 'oliver.m@example.com'),
    ('Sophie', 'Thompson', '1983-11-14', 'Female', '789-890-1234', 'sophie.t@example.com'),
    ('Mason', 'Davis', '1982-03-06', 'Male', '234-345-4567', 'mason.d@example.com'),
    ('Amelia', 'Hill', '1980-08-22', 'Female', '456-567-6789', 'amelia.h@example.com'),
    ('Ethan', 'Carter', '1978-12-17', 'Male', '678-789-8901', 'ethan.c@example.com'),
    ('Olivia', 'Young', '1985-05-08', 'Female', '890-901-2345', 'olivia.y@example.com'),
    ('Lucas', 'Baker', '1984-06-30', 'Male', '123-234-3456', 'lucas.b@example.com'),
    ('Ava', 'Barnes', '1981-10-25', 'Female', '345-456-5678', 'ava.b@example.com'),
    ('Logan', 'Turner', '1982-08-11', 'Male', '567-678-7890', 'logan.t@example.com'),
    ('Emma', 'Morgan', '1986-04-19', 'Female', '789-890-1234', 'emma.m@example.com'),
    ('Owen', 'Hill', '1983-02-02', 'Male', '234-345-4567', 'owen.h@example.com'),
    ('Chloe', 'Fisher', '1980-09-14', 'Female', '456-567-6789', 'chloe.f@example.com'),
    ('Alexander', 'Ward', '1981-07-05', 'Male', '678-789-8901', 'alexander.w@example.com'),
    ('Aria', 'Lewis', '1987-01-28', 'Female', '890-901-2345', 'aria.l@example.com'),
    ('Noah', 'Cooper', '1985-06-13', 'Male', '123-234-3456', 'noah.c@example.com'),
    ('Ava', 'Bennett', '1984-12-09', 'Female', '345-456-5678', 'ava.be@example.com'),
    ('Liam', 'Taylor', '1982-10-18', 'Male', '567-678-7890', 'liam.t@example.com'),
    ('Emma', 'Ward', '1981-05-03', 'Female', '789-890-1234', 'emma.w@example.com'),
    ('Mason', 'Evans', '1980-03-21', 'Male', '234-345-4567', 'mason.e@example.com'),
    ('Olivia', 'Lopez', '1987-11-16', 'Female', '456-567-6789', 'olivia.l@example.com'),
    ('Noah', 'Garcia', '1983-09-10', 'Male', '678-789-8901', 'noah.g@example.com'),
    ('Sophia', 'Perez', '1982-08-02', 'Female', '890-901-2345', 'sophia.p@example.com'),
    ('Ethan', 'Turner', '1981-06-25', 'Male', '123-234-3456', 'ethan.t@example.com'),
    ('Aria', 'Hill', '1986-04-07', 'Female', '345-456-5678', 'aria.h@example.com'),
    ('Liam', 'Foster', '1985-01-31', 'Male', '567-678-7890', 'liam.f@example.com'),
    ('Emma', 'Ramirez', '1984-10-22', 'Female', '789-890-1234', 'emma.r@example.com'),
    ('Ava', 'Ward', '1983-07-15', 'Female', '234-345-4567', 'ava.w@example.com'),
    ('Mason', 'Carter', '1982-05-07', 'Male', '456-567-6789', 'mason.c@example.com'),
    ('Sophia', 'Powell', '1981-03-02', 'Female', '678-789-8901', 'sophia.po@example.com'),
    ('Liam', 'Cooper', '1980-12-25', 'Male', '890-901-2345', 'liam.co@example.com');
    
-- Insert medical records for patients and doctors
DELIMITER //

CREATE PROCEDURE InsertMedicalRecords()
BEGIN
    DECLARE patientId INT;
    DECLARE doctorId INT;
    DECLARE recordCount INT;
    
    SET patientId = 1;
    WHILE patientId <= 42 DO
        -- Each patient has medical records with 2-3 random doctors
        SET recordCount = 0;
        WHILE recordCount < CEIL(RAND() * 2) + 1 DO
            SET doctorId = FLOOR(11 + RAND() * 10);
            INSERT INTO MedicalRecord (PatientId, DoctorId, Date, Diagnosis, Prescription)
            VALUES 
                (patientId, doctorId, DATE_ADD(CURDATE(), INTERVAL -FLOOR(RAND() * 365) DAY), 
                CONCAT('Diagnosis for Patient ', patientId, ' and Doctor ', doctorId), 
                CONCAT('Prescription for Patient ', patientId, ' and Doctor ', doctorId));
            SET recordCount = recordCount + 1;
        END WHILE;
        SET patientId = patientId + 1;
    END WHILE;
    
END //

DELIMITER ;

CALL InsertMedicalRecords();



