import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { getRepository, MoreThan } from 'typeorm';
import { SigningKey, User } from '../../../models/db';
import { SigningKeyType } from '../../../models/db/signing-key.model';
import { TokenResponse } from '../authentication.service';

let cachedKeys: { [kid: string]: string } = {};
let cachedRefreshKey: string;

export class JwtService {
    private static db = () => getRepository<SigningKey>('signing_key');

    static async startSigningKeyUpdate(): Promise<void> {
        await this.updateSigningKeys();
        setTimeout(() => this.updateSigningKeys(), 5 * 60 * 1000);
    }

    static async generateTokens(user: User): Promise<TokenResponse> {
        const idToken = await this.signAccessToken(user.createProfileObject());
        const refreshToken = await this.signRefreshToken({ id: user.id });
        return { idToken, refreshToken };
    }

    static async verify(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.getPublicKey, { algorithms: ['RS256'] }, (err, decodedToken) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decodedToken);
                }
            });
        });
    }

    private static async updateSigningKeys(): Promise<void> {
        const keys = await this.getCurrentKeys() ?? [];
        let refreshKey = await this.db().findOne({ type: SigningKeyType.REFRESH });

        if (keys.length === 0 ||
            keys[0].createdAt.getTime() < new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).getTime()) {
            const newKey = await SigningKey.generateNew();
            await this.db().save(newKey);
        }

        if (!refreshKey) {
            refreshKey = await SigningKey.generateNew();
            refreshKey.type = SigningKeyType.REFRESH;
            await this.db().save(refreshKey);
        }
        cachedRefreshKey = refreshKey.privateKey;
    }

    private static async getCurrentKeys(): Promise<SigningKey[]> {
        const accessKeys = await this.db().find({ 
            where: { 
                createdAt: MoreThan(new Date(new Date().getTime() - (48 * 60 * 60 * 1000))),
                type: SigningKeyType.ACCESS
            },
            order: { createdAt: 'DESC' }
        });
        cachedKeys = {};
        accessKeys.forEach((key) => cachedKeys[key.id] = key.publicKey);
        return accessKeys;
    }

    private static async getPublicKey(header: any, callback: any): Promise<void> {
        if (cachedKeys[header.kid]) {
            callback(null, cachedKeys[header.kid]);
            return;
        }

        await JwtService.getCurrentKeys();

        if (cachedKeys[header.kid]) {
            callback(null, cachedKeys[header.kid]);
        } else {
            throw new JsonWebTokenError('kid not found');
        }
    }

    private static async signAccessToken(data: any): Promise<string> {
        const currentKey = (await this.getCurrentKeys())[0];
        return new Promise(async (resolve, reject) => jwt.sign(
            data,
            currentKey.privateKey,
            { algorithm: 'RS256', keyid: currentKey.id },
            (err, encoded) => err ? reject(err) : resolve(encoded))
        );
    }

    private static async signRefreshToken(data: any): Promise<string> {
        return new Promise(async (resolve, reject) => jwt.sign(
            data,
            cachedRefreshKey || (await this.getCurrentKeys())[0].privateKey,
            { algorithm: 'RS256' },
            (err, encoded) => err ? reject(err) : resolve(encoded))
        );
    }
}
