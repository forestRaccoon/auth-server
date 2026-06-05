export default () => ({
    // Сервер
    port: parseInt(process.env.PORT, 10) || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',

    // База данных
    database: {
        mongoUri: process.env.MONGO_URI,
    },

    // JWT
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpires: process.env.ACCESS_TOKEN_EXPIRES || '15m',
        refreshExpires: process.env.REFRESH_TOKEN_EXPIRES || '7d',
    },

    // Bcrypt
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,

    // Валидация (общие параметры, также используются в кастомных валидаторах)
    validation: {
        password: {
            minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
            maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH, 10) || 50,
            requireLetter: process.env.PASSWORD_REQUIRE_LETTER !== 'false',
            requireNumber: process.env.PASSWORD_REQUIRE_NUMBER !== 'false',
            requireSpecial: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
            specialChars: process.env.PASSWORD_SPECIAL_CHARS || '!@#$%^&*',
        },
        email: {
            minLength: parseInt(process.env.EMAIL_MIN_LENGTH, 10) || 5,
            maxLength: parseInt(process.env.EMAIL_MAX_LENGTH, 10) || 100,
            requireTld: process.env.EMAIL_REQUIRE_TLD !== 'false',
        },
        fullName: {
            minLength: parseInt(process.env.FULLNAME_MIN_LENGTH, 10) || 2,
            maxLength: parseInt(process.env.FULLNAME_MAX_LENGTH, 10) || 50,
        },
        resetCode: {
            length: parseInt(process.env.RESET_CODE_LENGTH, 10) || 6,
            charset: process.env.RESET_CODE_CHARSET || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            expiresMinutes: parseInt(process.env.RESET_CODE_EXPIRES_MINUTES, 10) || 15,
        },
    },

    // Дефолтная аватарка
    defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL || 'https://www.gravatar.com/avatar/{{email_hash}}?d=mp&s=200',

    // SMTP
    smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM || 'Auth App <noreply@authapp.com>',
    },

    // Rate limiting
    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
        login: {
            limit: parseInt(process.env.THROTTLE_LOGIN_LIMIT, 10) || 5,
            ttl: parseInt(process.env.THROTTLE_LOGIN_TTL, 10) || 900,
        },
        register: {
            limit: parseInt(process.env.THROTTLE_REGISTER_LIMIT, 10) || 3,
            ttl: parseInt(process.env.THROTTLE_REGISTER_TTL, 10) || 3600,
        },
    },

    // Email verification
    emailVerification: {
        expiresMinutes: parseInt(process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES, 10) || 15,
        required: process.env.EMAIL_VERIFICATION_REQUIRED === 'true',
    },

    // CSRF
    csrfSecret: process.env.CSRF_SECRET,

    // Pagination
    pagination: {
        defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT, 10) || 20,
        maxLimit: parseInt(process.env.MAX_PAGE_LIMIT, 10) || 100,
    },

    // Login history
    loginHistory: {
        limit: parseInt(process.env.LOGIN_HISTORY_LIMIT, 10) || 10,
        notifyNewDevice: process.env.SUSPICIOUS_LOGIN_NOTIFICATION === 'true',
    },

    // Avatar
    avatar: {
        tempDir: process.env.AVATAR_UPLOAD_TEMP || './uploads/temp',
        finalDir: process.env.AVATAR_FINAL_DIR || './uploads/avatars',
        maxSizeMb: parseInt(process.env.AVATAR_MAX_SIZE_MB, 10) || 5,
        allowedMimes: process.env.AVATAR_ALLOWED_MIMES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxDimension: parseInt(process.env.AVATAR_MAX_DIMENSION, 10) || 1024,
        thumbDimension: parseInt(process.env.AVATAR_THUMB_DIMENSION, 10) || 200,
    },

    // Account lock
    accountLock: {
        tempAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS_TEMP, 10) || 5,
        permAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS_PERM, 10) || 10,
        tempLockMinutes: parseInt(process.env.TEMP_LOCK_MINUTES, 10) || 15,
    },

    // Graceful shutdown
    gracefulShutdownTimeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT_MS, 10) || 10000,

    // Default role
    defaultUserRole: process.env.DEFAULT_USER_ROLE || 'user',

    // Superadmin seed
    superAdmin: {
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
    },

    // Redis
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
    },

    // Request limits (body size)
    requestJsonLimitMb: parseInt(process.env.REQUEST_JSON_LIMIT_MB, 10) || 1,
    requestUrlencodedLimitMb: parseInt(process.env.REQUEST_URLENCODED_LIMIT_MB, 10) || 1,

    // Deletion code
    deletionCodeExpiresMinutes: parseInt(process.env.DELETION_CODE_EXPIRES_MINUTES, 10) || 15,
    softDeleteEnabled: process.env.SOFT_DELETE_ENABLED !== 'false',
});