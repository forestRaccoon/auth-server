import * as dotenv from 'dotenv';
dotenv.config();

export const validationConstants = {
    password: {
        minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
        maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '50', 10),
        requireLetter: process.env.PASSWORD_REQUIRE_LETTER !== 'false',
        requireNumber: process.env.PASSWORD_REQUIRE_NUMBER !== 'false',
        requireSpecial: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
        specialChars: process.env.PASSWORD_SPECIAL_CHARS || '!@#$%^&*',
    },
    email: {
        minLength: parseInt(process.env.EMAIL_MIN_LENGTH || '5', 10),
        maxLength: parseInt(process.env.EMAIL_MAX_LENGTH || '100', 10),
        requireTld: process.env.EMAIL_REQUIRE_TLD !== 'false',
    },
    fullName: {
        minLength: parseInt(process.env.FULLNAME_MIN_LENGTH || '2', 10),
        maxLength: parseInt(process.env.FULLNAME_MAX_LENGTH || '50', 10),
    },
    resetCode: {
        length: parseInt(process.env.RESET_CODE_LENGTH || '6', 10),
        charset: process.env.RESET_CODE_CHARSET || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        expiresMinutes: parseInt(process.env.RESET_CODE_EXPIRES_MINUTES || '15', 10),
    },
    avatar: {
        maxSizeMb: parseInt(process.env.AVATAR_MAX_SIZE_MB || '5', 10),
        allowedMimes: process.env.AVATAR_ALLOWED_MIMES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },
};

// Вспомогательные функции для Swagger
export const getPasswordDescription = () => {
    const p = validationConstants.password;
    let desc = `Password must be ${p.minLength}-${p.maxLength} characters`;
    if (p.requireLetter) desc += ', contain at least one letter';
    if (p.requireNumber) desc += ', contain at least one number';
    if (p.requireSpecial) desc += `, contain at least one special character (${p.specialChars})`;
    return desc + '.';
};

export const getEmailDescription = () => {
    const e = validationConstants.email;
    return `Email must be ${e.minLength}-${e.maxLength} characters and valid format.`;
};

export const getNameDescription = () => {
    const n = validationConstants.fullName;
    return `Name must be ${n.minLength}-${n.maxLength} characters.`;
};

export const getCodeDescription = () => {
    const c = validationConstants.resetCode;
    return `Code must be ${c.length} alphanumeric characters (${c.charset}).`;
};

export const getAvatarDescription = () => {
    const a = validationConstants.avatar;
    const mimes = a.allowedMimes.join(', ');
    return `Avatar must be a valid URL (supported formats: ${mimes}, max size: ${a.maxSizeMb} MB).`;
};

export const getObjectIdDescription = () => 'MongoDB ObjectId (24-character hex string)';
export const getRoleDescription = () => 'New role for the user (requires admin rights)';