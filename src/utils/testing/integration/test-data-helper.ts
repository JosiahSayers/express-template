import { Connection, createConnection, getRepository, Repository } from 'typeorm';
import { User } from '../../../models/db';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { retry } from '../../utility-functions';
import { TestEnvironment } from '../test-environment';
import { TestUsers } from './test-data';

let connection: Connection;

export class TestDataHelper {
    static async sharedSetup(): Promise<void> {
        TestEnvironment.loadEnvFile();
        await retry(async () => connection = await createConnection(TestEnvironment.dbConfig));
        await this.clearDb();
        await this.createUsersForTests();
    }

    static async sharedTeardown(): Promise<void> {
        await this.clearDb();
        await connection.close();
    }

    static async createUsersForTests(): Promise<void> {
        for (const user of Object.values(TestUsers)) {
            await AuthenticationService.register({
                name: user.name,
                email: user.email,
                password: user.password
            });
            const userEntity = await this.usersRepo.findOne({ email: user.email });
            userEntity.role = user.role;
            await this.usersRepo.save(userEntity);
        }
    }

    static get usersRepo(): Repository<User> {
        return getRepository<User>('user');
    }

    static async clearDb(): Promise<void> {
        const allTestUsers = await this.usersRepo.find();
        for (const testUser of allTestUsers) {
            await this.usersRepo.delete({ id: testUser.id });
        }
    }
}
