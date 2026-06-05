import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
    USER = 'user',
    EDITOR = 'editor',
    ADMIN = 'admin',
    SUPER_ADMIN = 'superadmin',
}

@Schema({ timestamps: true })
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true })
    firstName: string;

    @Prop()
    lastName?: string;

    @Prop()
    avatar?: string;

    @Prop()
    avatarThumbnail?: string;

    @Prop({ default: UserRole.USER, enum: UserRole })
    role: UserRole;

    @Prop({ default: false })
    isEmailVerified: boolean;

    @Prop({ default: 0 })
    loginAttempts: number;

    @Prop()
    lockedUntil?: Date;

    @Prop({ default: false })
    isPermanentlyLocked: boolean;

    @Prop({ default: 'en' })
    locale: string;

    @Prop()
    deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ deletedAt: 1 });
UserSchema.index({ role: 1 });