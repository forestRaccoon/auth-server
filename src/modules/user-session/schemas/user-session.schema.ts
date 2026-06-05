import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserSession extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    refreshTokenJti: string;

    @Prop({ required: true })
    ip: string;

    @Prop()
    userAgent?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ required: true })
    expiresAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
UserSessionSchema.index({ userId: 1, isActive: 1 });
UserSessionSchema.index({ refreshTokenJti: 1 }, { unique: true });
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });