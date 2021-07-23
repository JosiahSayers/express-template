import { getRepository, ILike, QueryFailedError } from 'typeorm';
import { RegisterRequestSchema } from '../../middleware/validation/requests/user/register';
import { SignInRequestSchema } from '../../middleware/validation/requests/user/sign-in';
import { RefreshToken, User } from '../../models/db';
import { UserProfile } from '../../models/db/user.model';
import { EmailNotFoundError, InvalidPasswordError, InvalidRefreshToken, UserNotFoundError } from '../../models/errors/authentication.errors';
import { JwtService } from './jwt/jwt.service';
import { PasswordService } from './password/password.service';

export class AuthenticationService {
  private static userDb = () => getRepository<User>('user');
  private static refreshDb = () => getRepository<RefreshToken>('refresh_token');

  static async register(request: RegisterRequestSchema['body']): Promise<SuccessfulAuthenticationResponse> {
    const user = new User();
    user.name = request.name;
    user.email = request.email;
    user.password = await PasswordService.hashAndSaltString(request.password);
    await this.userDb().save(user);
    const tokens = await JwtService.generateTokens(user);
    user.refreshTokens = [];
    user.refreshTokens.push(RefreshToken.generateFromToken(tokens.refreshToken));
    await this.userDb().save(user);
    return this.buildResponse(tokens, user);
  }

  static async signIn(request: SignInRequestSchema['body']): Promise<SuccessfulAuthenticationResponse> {
    const user = await this.userDb().findOne({ email: request.email }, { relations: ['refreshTokens'] });
    if (!user) throw new EmailNotFoundError();
    const validPassword = await PasswordService.areEqual(request.password, user.password);
    if (!validPassword) throw new InvalidPasswordError();
    const tokens = await JwtService.generateTokens(user);
    user.refreshTokens.push(RefreshToken.generateFromToken(tokens.refreshToken));
    await this.userDb().save(user);
    return this.buildResponse(tokens, user);
  }

  static async deleteUser(user: User): Promise<User> {
    return await this.userDb().remove(user);
  }

  static async verifyAccessTokenGetUser(accessToken: string): Promise<User> {
    const jwt = (await JwtService.verify(accessToken));
    return await this.userDb().findOne(jwt.id);
  }

  static async exchangeRefreshTokenForAccessToken(token: string): Promise<RefreshTokenResponse> {
    const refreshToken = await this.refreshDb().findOne({ token }, { relations: ['user', 'user.refreshTokens'] });

    if (refreshToken) {
      // remove existing refresh token
      const user = refreshToken.user;
      user.refreshTokens = user.refreshTokens.filter((token) => token.id !== refreshToken.id);
      await this.refreshDb().delete({ id: refreshToken.id });
      
      // generate and attach new refresh token
      const newTokens = await JwtService.generateTokens(user);
      user.refreshTokens.push(RefreshToken.generateFromToken(newTokens.refreshToken));
      await this.userDb().save(user);
      return <RefreshTokenResponse>this.buildResponse(newTokens, user, false);
    } else {
      throw new InvalidRefreshToken();
    }
  }

  static async findUsersBySearch(query: string): Promise<{ users: UserProfile[], totalMatched: number }> {
    const [users, totalMatched] = await this.userDb().findAndCount({
      where: [
        { email: ILike(`%${query}%`) },
        { name: ILike(`%${query}%`) }
      ],
      take: 10
    });
    return { users: users.map(user => user.createProfileObject({ includeRole: true })), totalMatched };
  }

  static async updateUser(id: string, updatedFields: Partial<User>): Promise<UserProfile> {
    try {
      const user = await this.userDb().findOne(id);
      if (!user) throw new UserNotFoundError();
      
      user.role = updatedFields.role;
      await this.userDb().save(user);
      return user.createProfileObject({ includeRole: true });
    } catch (e) {
      if (e instanceof QueryFailedError && e.message.includes('invalid input syntax for type uuid')) {
        throw new UserNotFoundError();
      } else {
        throw e;
      }
    }
  }

  private static buildResponse(newTokens: TokenResponse, user: User, createProfile = true): SuccessfulAuthenticationResponse | RefreshTokenResponse {
    return {
      idToken: newTokens.idToken,
      refreshToken: newTokens.refreshToken,
      user: createProfile ? user.createProfileObject({ includeRole: true }) : user
    };
  }
}

export interface SuccessfulAuthenticationResponse extends TokenResponse {
  user: UserProfile;
}

export interface RefreshTokenResponse extends TokenResponse {
  user: User;
}

export interface TokenResponse {
  idToken: string;
  refreshToken: string;
}
