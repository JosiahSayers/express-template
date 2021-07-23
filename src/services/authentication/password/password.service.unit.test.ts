jest.mock('bcrypt-nodejs');
import bcrypt from 'bcrypt-nodejs';
import { PasswordService } from './password.service';

describe('Password Service', () => {
    const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

    describe('areEqual', () => {
        it('rejects when bcrypt.compare throws an error', async () => {
            mockedBcrypt.compare.mockImplementation((_: any, __: any, callback: any) => callback('ERROR', undefined));
            await expect(PasswordService.areEqual('', '')).rejects.toEqual('ERROR');
        });

        it('resolves with the result of bcrypt.compare', async () => {
            mockedBcrypt.compare.mockImplementation((_: any, __: any, callback: any) => callback(undefined, true));
            await expect(PasswordService.areEqual('', '')).resolves.toEqual(true);
        });
    });

    describe('hashAndSaltString', () => {
        it('uses bcrypt to generate a salt and passes that salt and string to the hash function', async () => {
            jest.spyOn(mockedBcrypt, 'hash').mockImplementation((_: any, __: any, ___: any, callback: any) => callback(null, 'HASHED STRING'));
            mockedBcrypt.genSalt.mockImplementation((_: any, callback: any) => callback(null, 'NEW SALT'));
            expect(await PasswordService.hashAndSaltString('RAW STRING')).toEqual('HASHED STRING');
            const [dataArg, saltArg] = mockedBcrypt.hash.mock.calls[0];
            expect(dataArg).toEqual('RAW STRING');
            expect(saltArg).toEqual('NEW SALT');
        });
    });
});
