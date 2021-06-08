import bcrypt from 'bcrypt-nodejs';

export class PasswordService {
    static async hashAndSaltString(raw: string): Promise<string> {
        const salt = await this.generateSalt();
        return await this.hashString(raw, salt);
    }

    static async areEqual(candidate: string, hashed: string): Promise<boolean> {
        return new Promise((resolve, reject) => bcrypt.compare(candidate, hashed, (err, result) => err ? reject(err) : resolve(result)));
    }

    private static async generateSalt(): Promise<string> {
        return new Promise((resolve, reject) => bcrypt.genSalt(10, (err, salt) => err ? reject(err) : resolve(salt)));
    }

    private static async hashString(raw: string, salt: string): Promise<string> {
        return new Promise((resolve, reject) => bcrypt.hash(raw, salt, null, (err, hashed) => err ? reject(err) : resolve(hashed)));
    }
}
