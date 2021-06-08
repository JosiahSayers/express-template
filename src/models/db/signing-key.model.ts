import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { generateKeyPair } from 'crypto';

export enum SigningKeyType {
    ACCESS = 'access',
    REFRESH = 'refresh'
}

@Entity()
export class SigningKey {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    publicKey: string;

    @Column()
    privateKey: string;

    @Column({
        type: 'enum',
        enum: SigningKeyType,
        default: SigningKeyType.ACCESS
    })
    type: SigningKeyType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    expiredAt: Date;

    static async generateNew(): Promise<SigningKey> {   
        const keys = await this.generateNewKeyPair();
        const signingKey = new SigningKey();
        signingKey.publicKey = keys.publicKey;
        signingKey.privateKey = keys.privateKey;
        return signingKey;
    }

    private static async generateNewKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
        return new Promise<{ publicKey: string; privateKey: string; }>((resolve, reject) => {
            generateKeyPair('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem'
                }
            }, (err, publicKey, privateKey) =>
                err ? reject(err) : resolve({ publicKey, privateKey }));
        });
    }
}
