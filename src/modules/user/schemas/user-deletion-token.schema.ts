import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserDeletionToken extends Document {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true })
    codeHash: string;

    @Prop({ required: true, index: { expires: 0 } })
    expiresAt: Date;
}

export const UserDeletionTokenSchema = SchemaFactory.createForClass(UserDeletionToken);
UserDeletionTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });