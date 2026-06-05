import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserSeedService implements OnModuleInit {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private config: ConfigService,
    ) {}

    async onModuleInit() {
        await this.createSuperAdmin();
    }

    private async createSuperAdmin() {
        const superAdminEmail = this.config.get('superAdmin.email');
        const superAdminPassword = this.config.get('superAdmin.password');
        if (!superAdminEmail || !superAdminPassword) {
            console.warn('SUPER_ADMIN_EMAIL or PASSWORD not set, skipping superadmin creation');
            return;
        }

        const existing = await this.userModel.findOne({ role: UserRole.SUPER_ADMIN });
        if (existing) {
            console.log('Superadmin already exists');
            return;
        }

        const saltRounds = this.config.get('bcryptSaltRounds');
        const passwordHash = await bcrypt.hash(superAdminPassword, saltRounds);
        const superAdmin = new this.userModel({
            email: superAdminEmail,
            passwordHash,
            firstName: 'Super',
            lastName: 'Admin',
            role: UserRole.SUPER_ADMIN,
            isEmailVerified: true,
            locale: 'en',
        });
        await superAdmin.save();
        console.log('Superadmin created successfully');
    }
}