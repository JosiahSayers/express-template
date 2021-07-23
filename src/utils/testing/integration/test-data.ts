import { UserRole } from '../../../models/db/user.model';

export const TestUsers = {
    adminUser: {
        email: 'admin@test.com',
        password: 'admin-password',
        name: 'Admin User',
        role: UserRole.ADMIN
    },
    standardUser: {
        email: 'editor@test.com',
        password: 'editor-password',
        name: 'Editor User',
        role: UserRole.STANDARD
    }
};
