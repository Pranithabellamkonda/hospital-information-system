USE HIS;

SHOW TABLES;

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
    FOREIGN KEY (SpecializationId)
        REFERENCES Specialization (SpecializationId)
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
    FOREIGN KEY (AppointmentSlotId) REFERENCES AppointmentSlot(AppointmentSlotId) ON DELETE CASCADE,
    FOREIGN KEY (DoctorId) REFERENCES Doctor(DoctorId) ON DELETE CASCADE,
    FOREIGN KEY (PatientId) REFERENCES Patient(PatientId) ON DELETE CASCADE,
    CONSTRAINT UniqueDoctorSlot UNIQUE (DoctorId, AppointmentSlotId),
    CONSTRAINT UniquePatientSlot UNIQUE (PatientId, AppointmentSlotId)
);

CREATE TABLE Billing(
	BillingId INT AUTO_INCREMENT PRIMARY KEY,
    AdminId INT NOT NULL,
    PatientId INT NOT NULL,
    BillingAmount decimal(10,2) NOT NULL,
    BillingDate date NOT NULL,
    FOREIGN KEY (PatientId) REFERENCES Patient(PatientId),
    FOREIGN KEY (AdminId) REFERENCES Admin(AdminId)
);


CREATE TABLE ADMIN(
	AdminId INT AUTO_INCREMENT PRIMARY KEY,
    AdminFName VARCHAR(25) NOT NULL,
    AdminLName VARCHAR(25) NOT NULL,
    Phone VARCHAR(25) NOT NULL,
    Email VARCHAR(50) NOT NULL
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
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `PopulateAppointmentSlotsForMonth`()
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
END$$
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
