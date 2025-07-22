import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { hashPassword, verifyPassword, LoginAttempts } from '@/utils/security';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  
  const ADMIN_USERNAME = 'ZassalAdmin';
  
  // Инициализация безопасного пароля при первом запуске
  useEffect(() => {
    const storedPassword = localStorage.getItem('admin_password_hash');
    if (!storedPassword) {
      // Устанавливаем пароль по умолчанию с хешированием
      const defaultPassword = 'SecureAdmin2024!';
      const hashedPassword = hashPassword(defaultPassword);
      localStorage.setItem('admin_password_hash', hashedPassword);
    }
  }, []);

  // Проверка блокировки при загрузке и обновление таймера
  useEffect(() => {
    const checkLockStatus = () => {
      const locked = LoginAttempts.isLocked();
      setIsLocked(locked);
      setRemainingAttempts(LoginAttempts.getRemainingAttempts());
      
      if (locked) {
        setRemainingTime(LoginAttempts.getLockoutTimeRemaining());
      }
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Проверка блокировки
    if (LoginAttempts.isLocked()) {
      setError(`Аккаунт заблокирован на ${LoginAttempts.getLockoutTimeRemaining()} мин.`);
      return;
    }

    const storedPasswordHash = localStorage.getItem('admin_password_hash') || '';

    // Проверка логина и пароля
    if (username === ADMIN_USERNAME && verifyPassword(password, storedPasswordHash)) {
      // Успешный вход - сбрасываем попытки
      LoginAttempts.resetAttempts();
      localStorage.setItem('admin_session', Date.now().toString());
      onLogin();
    } else {
      // Неудачная попытка - увеличиваем счетчик
      LoginAttempts.incrementAttempts();
      const attempts = LoginAttempts.getRemainingAttempts();
      setRemainingAttempts(attempts);

      if (attempts <= 0) {
        // Блокируем аккаунт
        LoginAttempts.lockAccount();
        setIsLocked(true);
        setError('Превышено количество попыток входа. Аккаунт заблокирован на 5 минут.');
      } else {
        setError(`Неверные данные для входа. Осталось попыток: ${attempts}`);
      }
    }
    
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 gradient-bg rounded-full mx-auto mb-4 flex items-center justify-center">
            <Icon name="Shield" size={32} className="text-white" />
          </div>
          <CardTitle>Админ панель</CardTitle>
          <CardDescription>Введите данные для доступа к административной панели</CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <Icon name="Lock" size={16} />
                <AlertDescription>
                  Аккаунт заблокирован на {remainingTime} мин. из-за превышения попыток входа
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/'}
                  className="text-sm"
                >
                  <Icon name="ArrowLeft" size={14} className="mr-1" />
                  Вернуться на главную
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Логин</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите логин"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Пароль</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <Icon name="AlertCircle" size={16} />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {remainingAttempts < 3 && remainingAttempts > 0 && (
                  <Alert>
                    <Icon name="AlertTriangle" size={16} />
                    <AlertDescription>
                      Внимание: у вас осталось {remainingAttempts} попыток входа
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full gradient-bg"
                  disabled={!username || !password}
                >
                  <Icon name="LogIn" size={16} className="mr-2" />
                  Войти в систему
                </Button>
              </form>
              
              <div className="mt-6 pt-4 border-t text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/'}
                  className="text-sm"
                >
                  <Icon name="ArrowLeft" size={14} className="mr-1" />
                  Вернуться на главную
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}