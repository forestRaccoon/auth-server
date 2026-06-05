import * as crypto from 'crypto';

/**
 * Генерирует случайный 6-значный alphanumeric код
 */
export function generateRandomCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Хеширует строку с помощью sha256
 */
export function hashString(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Проверяет, является ли объект валидным MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Задержка (promise sleep)
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Безопасное парсинг JSON
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
    try {
        return JSON.parse(json);
    } catch {
        return defaultValue;
    }
}

/**
 * Обрезка строки до максимальной длины с многоточием
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Очистка объекта от undefined полей
 */
export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            result[key] = obj[key];
        }
    }
    return result;
}