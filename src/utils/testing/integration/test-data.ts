import { getRepository } from 'typeorm';
import { User, UserRole } from '../../../models/db/user.model';
import { AuthenticationService } from '../../../services/authentication/authentication.service';

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

export const createUsersForTests = async (): Promise<void> => {
    const repo = getRepository<User>('user');

    for (const user of Object.values(TestUsers)) {
        await AuthenticationService.register({
            name: user.name,
            email: user.email,
            password: user.password
        });
        const userEntity = await repo.findOne({ email: user.email });
        userEntity.role = user.role;
        await repo.save(userEntity);
    }

    console.log('ADDED TEST USERS!');
};
