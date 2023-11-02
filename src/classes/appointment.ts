export class Appointment {
    AppointmentId: string;
    PatientId: string;
    DoctorId: string;
    DoctorFName?: string;
    DoctorLName?: string;
    AppointmentSlotId: string;
    AppointmentStartTime?: string;
    AppointmentEndTime?: string;
    Notes: string;
}