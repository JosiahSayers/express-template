import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '.';

export enum UserRole {
    ADMIN = 'admin',
    STANDARD = 'standard',
    DELETED = 'deleted'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STANDARD
    })
    role: UserRole

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: false })
    name: string;

    @OneToMany(() => RefreshToken, (token: RefreshToken) => token.user, { cascade: ['insert', 'update', 'remove'], onDelete: 'CASCADE' })
    refreshTokens: RefreshToken[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    createProfileObject(options: CreateProfileOptions = {}): UserProfile {
        return {
            id: this.id,
            name: this.name,
            role: options.includeRole ? this.role : undefined,
            email: this.email
        };
    }
}

export interface CreateProfileOptions {
    includeRole?: boolean;
}

export interface UserProfile {
    id: string;
    role?: UserRole;
    name: string;
    email: string;
}
