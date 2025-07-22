// Простая хеш-функция для паролей
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертируем в 32-битное число
  }
  return Math.abs(hash).toString(16);
}

// Проверка пароля с хешем
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Управление попытками входа
export class LoginAttempts {
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly LOCKOUT_DURATION = 5 * 60 * 1000; // 5 минут
  private static readonly STORAGE_KEY = 'login_attempts';
  private static readonly LOCKOUT_KEY = 'login_lockout';

  static getAttempts(): number {
    return parseInt(localStorage.getItem(this.STORAGE_KEY) || '0');
  }

  static incrementAttempts(): void {
    const current = this.getAttempts();
    localStorage.setItem(this.STORAGE_KEY, (current + 1).toString());
  }

  static resetAttempts(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LOCKOUT_KEY);
  }

  static isLocked(): boolean {
    const lockoutTime = localStorage.getItem(this.LOCKOUT_KEY);
    if (!lockoutTime) return false;
    
    const now = Date.now();
    const lockout = parseInt(lockoutTime);
    
    if (now - lockout < this.LOCKOUT_DURATION) {
      return true;
    }
    
    // Снимаем блокировку если время истекло
    this.resetAttempts();
    return false;
  }

  static lockAccount(): void {
    localStorage.setItem(this.LOCKOUT_KEY, Date.now().toString());
  }

  static getRemainingAttempts(): number {
    return Math.max(0, this.MAX_ATTEMPTS - this.getAttempts());
  }

  static getLockoutTimeRemaining(): number {
    const lockoutTime = localStorage.getItem(this.LOCKOUT_KEY);
    if (!lockoutTime) return 0;
    
    const now = Date.now();
    const lockout = parseInt(lockoutTime);
    const remaining = this.LOCKOUT_DURATION - (now - lockout);
    
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // Возвращаем минуты
  }
}