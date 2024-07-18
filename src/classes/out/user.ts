export enum Role {
    'Doctor' = 'Doctor',
    'Patient' = 'Patient',
    'Admin' = 'Admin'
}

export class User {
    Username: string;
    HashedPassword: string;
    Salt: string;
    Role: Role;
}
