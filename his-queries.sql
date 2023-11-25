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
    Email VARCHAR(50),
    Username VARCHAR(50) NOT NULL,
	FOREIGN KEY (Username) 
		REFERENCES User(Username)
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

INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('alexward','feTPrVSNBJmtlACaM7ZOL3W/ZTLzn2Mc0peRb516HXw=','ELOBYs0WRgsx+/uGX6f61Q==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('alicejohnson456','kBqjIqVtrHsMEhQ9AbjJdVroPbjUNZ5OjCxxAtaPZAI=','EFbJtfltI9zQuv0Ug66Yxg==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('alicesmith','7NJkhMV8LwjGG4xqJ63ruvYFs/UgTdZpGmE1fMwyC/4=','TPnqe8hzNoj9cx/pPzaAqg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('ameliahill','vFWJUh9P+uMq59PEBixnRfXix64OLt4xq6vbCMxfE9s=','LjAZLWbGYEqkhbkFqVBfhg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('ariahill','GRkZJzN8R1abBLoK2sHV2tQX5TvLflH7kJiwRCHJLh8=','k0iNJJHUatt94yHpdyMjuw==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('arialewis','WkY7r2iBJBUTJlWJ6A4MT0FXb7HWFDyNZZ0d6duhrHA=','QtfwtK+84BSerWO5Pzch+w==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('avabarnes','Q76433uJyEKgxXo+xusPPawNiKv7XwUbvmLh+4doTf0=','zvyZZzMU91HXkT4o+EeL1w==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('avabennett','1Yd0Y1FHngACjq0aADZmfqyr5KXR56JFkEFXdwEeRt0=','f0vXLJURSzEsPKGIREwD6A==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('avagarcia444','SqHGDZban54uuGIbhzuA0kRtoKCL+bHXPL8IIF51LkY=','Fbhw72jxWJw/YjWjFgjY2A==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('avajohnson','AKHkDGPWk3zYpwWm1HDXVSyu77skG8W9r9lu3zMHoHA=','5hqSKyYfEl5TvDYkVVcT6A==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('avaward','rEwxzkk4qSTHIjTxbkVQ5S5jal2dtuSDfCkBbOGSG9Q=','oWDaE0jrvLKJos5fc7JiEw==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('chloefisher','cOLVuHWqKdahSWvgzOn6MN3AEEomYXugd+r7O0zIHQc=','xzToZLi2w3R9mXqON5tN2A==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('danielmartinez','7urxjJEWAVb4FRUF9Lp1ro9he2aYE/MX6vxphuB95tM=','vqdFsaqaC3qyp07Ga6mtpQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('danielmartinez888','zNb8dVLzoz7GrGEmZli6Vyn1JcVNpFKQC1lgPAnHCCI=','7pNdFWCFuB7DjLo2cibR9Q==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('davidclark','qyEXM+5qs20lFsZS9koFY+Z8uJnLkRfEccBa+QacP/g=','n1Ka361Svoq7kvvQmJ/+ig==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('davidlee2022','3J7r4icC73HuVMrFYWbR2rrRitXUQxi3Vuw3vMcvCpk=','XYQk1+/jGMLdKvkcc2hMxA==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('emilybrown101','OxpN/SD24SNxIEEL/28jPp71WwrT6N8sm3l6sX88D2o=','c5QLWmISX91k+n89fBn1tw==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('emilydavis','b7lSGDyh/8xVAw6274AkHm5/wZCXCYHEBJmqNjrRuHs=','X0ez7r9j06nggSYE6NSI4g==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('emmalee','hKTin0HB1le+Qa80gvxP5vlNJFu2ahhgS09iqU99Exo=','x4VddzbNLTh79ElgCzssoA==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('emmaramirez','ZiUJuA208snCOYNDGe8pNheq21DFdNdf8JaFw8agKUo=','IU0uNLO8ro6k2DDokzEMsw==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('emmaward','9hfaBK4waVP0Pxn2ltQlua50peubzs8FtGEvJbXTfi4=','sjcM7h4eOYpqPTf3EXPTHQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('emorgan','KEJDGWTtM5IrDI68cI+OStoFCCWZ9vOKUbOGVCyGf4A=','/acAsI/t4rA16iMtJPn7LQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('ethancarter','yGz070zioFyAoQCVweavnRd85ajZxAti28FET4f+j2s=','lIQ2U9XEyrF+UAXse4HxWg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('ethanturner','NE7s+kPHdt13jhaUa5LE6YjjaL+mL6eDJnzjDpp8HzU=','vrDelyVo/hm93iDIOKEEHw==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('jamesmoore','aThFpaQRGyWuD7Z7DxEKzszoH4OLLd40rFsCAejU9OI=','kI2KcH7FKmsCMOG0OgC1rA==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('johndoe','ZSx66Y+x6C+mP2zU1F8bt5nNVe8oMzVptMVMJ/R9txg=','1GX7jnPmKTfvqJ/31+7AIA==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('johnsmith123','vbIfUEu9VFli/ROkqP54gJd1KH420x3Jqa2WbfXd2qM=','I1fpvzVn3Ld28jNEpem+aA==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('liamanderson222','9kwhwAmBNQ+y9k6lJfAi6pjABd/aEgYiCdAaFoKJtVs=','AMkdnxbhAK49MP+nMBcMeg==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('liamcooper','w0UJo4vm548r9C9/dmKXNOWu4lZngK0YKOgOwrxeSqc=','D7CEItY6owlh1eZGfzSVyQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('liamfoster','y8SZHnwO8HrHOJFiz6Tdyyp+6oDTI7vZuUFy2ynUjHA=','wOICuI8vR4CV1LCwXAe3Hw==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('liamtaylor','fIj9k7YRc+mXtvF9/B+Et488UKAPGVNGHKRrIL4CODk=','iKPcB3ASsmf2xVaIwqgIig==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('liamwilson','UszsQ27chGnbR7Ub6W/AsnDpJJaERcKDpzKE+padB0M=','FuG6e5C/WHk9XpI7rhuxUQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('loganturner','7lDQZIye0AUeDmM4kXeBdWEpga/OkrBE3BuATDSMUBY=','ABr8vEmbx1bEB/4NWzxeYQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('lucasbaker','lhyjg3mEf2hjJZ43bTSCghuKO04sFz+eik4a5V1S8c0=','eGFzxuQLMteXCioLklIGkg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('masoncarter','grvKRUNLqkdCb9768FRUyKXSMvA4MSd9b6iHyAtkZos=','xWmorTYuHJKCTlQ4XuYeBg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('masondavis','9cQrliSNudmeAf+t5QwY7pL/dFSEIu73M4pmC6FNRUg=','L+v9uGEBPQekaS2By8kBAA==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('masonevans','LjQBOpA964vItguskjXQV8ScTBper6GT6Ac81Mlt07c=','qhZyhFtWmUwvp1ruzML0rw==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('michaeldavis789','IOlrmbewT1CoACLFtPYN3rCwqQkjKxvctfjgdhycvKY=','MC8bu8qNI2ajYZcvbFZ8gQ==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('michaelj','/iGWv7BjZH4/Vc8xBdm0xrl/q0szW/1GTm3o4+tYShM=','6r70sYjkAFw0xDcMa77stA==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('noahcooper','DkUYxUJMiocogNy0LIlohc6dDEsavIx82rFyzWbaOkA=','4ys7F5CtwJ119OUpmgvmOg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('noahgarcia','ghq3+spz6xby9kVmPQNNg2F5VrnS5vo7gOEefXLtafs=','iTsHKCno26Be/5kdO1kHag==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('olivermoore','F+Wb0pPV5Okx+5ZBUkcDr4N5dzkpkdKDBXhssTYP11k=','HJhTAetBoYUE3n6jzc/DoQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('oliviaanderson','iZxY92WEhSWyzWaaNrVIpLkjpU7SZ3NkclJyLxaNBQY=','Kvhzc+f9H43Iml4cvbL4Qw==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('oliviajohnson77','qWjb5KE4m3HbzDnDZgKGcrki83b81m1HBVv0nuIKjzI=','kwvj7a7pZws28kibJ7Fryg==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('olivialopez','4ubTx+ZWy6ob2xpmM7j3aK5743MWODuPHrRnmY7bkPk=','pExwZl7yAewPfYwOgfC5og==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('oliviayoung','diw5OfgOes3ZxgZHxKmn6zT2HA0BFqTfLeHg8+6gHSI=','QnJ8TdCii1sBgdhAYXdlrg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('owenhill','NYZa+QFuSp/cRnQtVs7nFTEMTEWYEXd5QcKQQxsh5gY=','mIOtkzDwqltB0jF6F9iM5g==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('pranitha','3TLhBCdanxeR67kaig/5EMQuKceJITWPUcg0cTshl7A=','3SLMHx/yhtaN1jtynehgAw==','Admin');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('rekha','7YdqByRMUWMsSGVPI3ssapEEknnVpC7stStJRHps7jo=','LeOIvB1fRx7nNgZKGLCQow==','Admin');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('sophiabrown','3l/yBbg6AJ+f7QyMZ4EGenn/68R0DHZAIj/xYZnm9OA=','46sDUPeyoMF9RQqDbtY9Cg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('sophiaperez','DpSJrn2vA0+SScl+eOSNsYvh8u8FLN2RSJYFLGXUpIY=','v4PxNbRSS0YuehrrjcpXcg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('sophiapowell','BsJK4DEYXd8/VOZPq3OU1PgvN0N24j8up8Yywj6N8/0=','l7BJNc4+Yc5faBwy2STmUg==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('sophiawilliams999','LJ2VVgOZgUrkLxPdkbq/z1nWOuKJwyJe3Fm9VKtMZKY=','1hhchuLR5mCaV2EvQHOj7g==','Doctor');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('sophiethompson','NKkN5qrP8O2GJ0xLnkqdYXbk3l/7Ub4i22V3SvsAkZ0=','I23QPpmyb2wkBVxtQm9VaQ==','Patient');
INSERT INTO User (`Username`,`HashedPassword`,`Salt`,`Role`) VALUES ('youssef','KhfpMOh416psEfam7AviEF1cXEkChXCcLRT0hVLWhGU=','8wnUNqtkzR7pYhEUrkmIjg==','Admin');


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
    
INSERT INTO Admin (AdminFName, AdminLName, Phone, Email, Username)
VALUES 
    ('Pranitha', 'B', '123-406-7890', 'pranitha.b@example.com', 'pranitha'),
    ('Rekha', 'S', '987-664-3210', 'rekha.s@example.com', 'rekha'),
    ('Youssef', 'E','555-129-4567', 'youssef.e@example.com', 'youssef');

INSERT INTO Patient (PatientFName, PatientLName, DateOfBirth, Gender, Phone, Email, Username)
VALUES 
    ('John', 'Doe', '1980-05-15', 'Male', '123-456-7890', 'john.doe@example.com', 'johndoe'),
    ('Alice', 'Smith', '1982-09-22', 'Female', '987-654-3210', 'alice.smith@example.com', 'alicesmith'),
    ('Michael', 'Johnson', '1978-07-10', 'Male', '555-123-4567', 'michael.j@example.com', 'michaelj'),
    ('Emily', 'Davis', '1991-03-28', 'Female', '111-222-3333', 'emily.d@example.com', 'emilydavis'),
    ('David', 'Clark', '1985-11-19', 'Male', '999-888-7777', 'david.c@example.com', 'davidclark'),
    ('Emma', 'Lee', '1983-08-05', 'Female', '333-444-5555', 'emma.lee@example.com', 'emmalee'),
    ('James', 'Moore', '1989-12-09', 'Male', '777-666-5555', 'james.moore@example.com', 'jamesmoore'),
    ('Olivia', 'Anderson', '1987-06-17', 'Female', '222-333-4444', 'olivia.a@example.com', 'oliviaanderson'),
    ('Sophia', 'Brown', '1984-04-02', 'Female', '444-555-6666', 'sophia.b@example.com', 'sophiabrown'),
    ('Daniel', 'Martinez', '1979-01-25', 'Male', '666-777-8888', 'daniel.m@example.com', 'danielmartinez'),
    ('Liam', 'Wilson', '1988-07-18', 'Male', '123-234-3456', 'liam.w@example.com', 'liamwilson'),
    ('Ava', 'Johnson', '1986-02-12', 'Female', '345-456-5678', 'ava.j@example.com', 'avajohnson'),
    ('Oliver', 'Moore', '1981-09-29', 'Male', '567-678-7890', 'oliver.m@example.com', 'olivermoore'),
    ('Sophie', 'Thompson', '1983-11-14', 'Female', '789-890-1234', 'sophie.t@example.com', 'sophiethompson'),
    ('Mason', 'Davis', '1982-03-06', 'Male', '234-345-4567', 'mason.d@example.com', 'masondavis'),
    ('Amelia', 'Hill', '1980-08-22', 'Female', '456-567-6789', 'amelia.h@example.com', 'ameliahill'),
    ('Ethan', 'Carter', '1978-12-17', 'Male', '678-789-8901', 'ethan.c@example.com', 'ethancarter'),
    ('Olivia', 'Young', '1985-05-08', 'Female', '890-901-2345', 'olivia.y@example.com', 'oliviayoung'),
    ('Lucas', 'Baker', '1984-06-30', 'Male', '123-234-3456', 'lucas.b@example.com', 'lucasbaker'),
    ('Ava', 'Barnes', '1981-10-25', 'Female', '345-456-5678', 'ava.b@example.com', 'avabarnes'),
    ('Logan', 'Turner', '1982-08-11', 'Male', '567-678-7890', 'logan.t@example.com', 'loganturner'),
    ('Emma', 'Morgan', '1986-04-19', 'Female', '789-890-1234', 'emma.m@example.com', 'emorgan'),
    ('Owen', 'Hill', '1983-02-02', 'Male', '234-345-4567', 'owen.h@example.com', 'owenhill'),
    ('Chloe', 'Fisher', '1980-09-14', 'Female', '456-567-6789', 'chloe.f@example.com', 'chloefisher'),
    ('Alexander', 'Ward', '1981-07-05', 'Male', '678-789-8901', 'alexander.w@example.com', 'alexward'),
    ('Aria', 'Lewis', '1987-01-28', 'Female', '890-901-2345', 'aria.l@example.com', 'arialewis'),
    ('Noah', 'Cooper', '1985-06-13', 'Male', '123-234-3456', 'noah.c@example.com', 'noahcooper'),
    ('Ava', 'Bennett', '1984-12-09', 'Female', '345-456-5678', 'ava.be@example.com', 'avabennett'),
    ('Liam', 'Taylor', '1982-10-18', 'Male', '567-678-7890', 'liam.t@example.com', 'liamtaylor'),
    ('Emma', 'Ward', '1981-05-03', 'Female', '789-890-1234', 'emma.w@example.com', 'emmaward'),
    ('Mason', 'Evans', '1980-03-21', 'Male', '234-345-4567', 'mason.e@example.com', 'masonevans'),
    ('Olivia', 'Lopez', '1987-11-16', 'Female', '456-567-6789', 'olivia.l@example.com', 'olivialopez'),
    ('Noah', 'Garcia', '1983-09-10', 'Male', '678-789-8901', 'noah.g@example.com', 'noahgarcia'),
    ('Sophia', 'Perez', '1982-08-02', 'Female', '890-901-2345', 'sophia.p@example.com', 'sophiaperez'),
    ('Ethan', 'Turner', '1981-06-25', 'Male', '123-234-3456', 'ethan.t@example.com', 'ethanturner'),
    ('Aria', 'Hill', '1986-04-07', 'Female', '345-456-5678', 'aria.h@example.com', 'ariahill'),
    ('Liam', 'Foster', '1985-01-31', 'Male', '567-678-7890', 'liam.f@example.com', 'liamfoster'),
    ('Emma', 'Ramirez', '1984-10-22', 'Female', '789-890-1234', 'emma.r@example.com', 'emmaramirez'),
    ('Ava', 'Ward', '1983-07-15', 'Female', '234-345-4567', 'ava.w@example.com', 'avaward'),
    ('Mason', 'Carter', '1982-05-07', 'Male', '456-567-6789', 'mason.c@example.com', 'masoncarter'),
    ('Sophia', 'Powell', '1981-03-02', 'Female', '678-789-8901', 'sophia.po@example.com', 'sophiapowell'),
    ('Liam', 'Cooper', '1980-12-25', 'Male', '890-901-2345', 'liam.co@example.com', 'liamcooper');

    
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
            SET doctorId = FLOOR(1 + RAND() * 10);
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
