import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('');
  const [expectedTwoFa, setExpectedTwoFa] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState<number | null>(null);
  
  const ADMIN_USERNAME = 'ZassalAdmin';
  const STORED_PASSWORD_HASH = localStorage.getItem('admin_password_hash');
  const ADMIN_PASSWORD_HASH = STORED_PASSWORD_HASH || hashPassword('SecureAdmin2024!');
  const MAX_ATTEMPTS = 3;
  const BLOCK_TIME = 300000; // 5 минут
  const SESSION_TIMEOUT = 3600000; // 1 час

  // Простое хеширование пароля (в продакшене использовать bcrypt)
  function hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer
    }
    return Math.abs(hash).toString(36) + btoa(password).slice(-8);
  }

  // Генерация 2FA кода
  function generateTwoFaCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Проверка сессии
  useEffect(() => {
    if (!STORED_PASSWORD_HASH) {
      localStorage.setItem('admin_password_hash', ADMIN_PASSWORD_HASH);
    }
    
    // Проверяем блокировку по IP/времени
    const blockData = localStorage.getItem('admin_block_data');
    if (blockData) {
      const { timestamp, attempts: savedAttempts } = JSON.parse(blockData);
      const timeDiff = Date.now() - timestamp;
      
      if (timeDiff < BLOCK_TIME && savedAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        setAttempts(savedAttempts);
        
        const remaining = Math.ceil((BLOCK_TIME - timeDiff) / 60000);
        setError(`Доступ заблокирован. Осталось: ${remaining} мин.`);
        
        setTimeout(() => {
          setIsBlocked(false);
          setAttempts(0);
          localStorage.removeItem('admin_block_data');
        }, BLOCK_TIME - timeDiff);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBlocked) {
      setError('Доступ временно заблокирован. Попробуйте позже.');
      return;
    }

    // Первый этап - проверка логина и пароля
    if (!twoFaEnabled) {
      const passwordHash = hashPassword(password);
      
      if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
        // Включаем двухфакторную аутентификацию
        const code = generateTwoFaCode();
        setExpectedTwoFa(code);
        setTwoFaEnabled(true);
        
        // В реальной системе код отправляется на email/SMS
        console.log('2FA код:', code); // ДЛЯ ДЕМО ЦЕЛЕЙ
        alert(`Ваш код двухфакторной аутентификации: ${code}\n\nВ реальной системе он будет отправлен на ваш email/телефон.`);
        
        setError('');
      } else {
        handleFailedAttempt();
      }
    } else {
      // Второй этап - проверка 2FA кода
      if (twoFaCode === expectedTwoFa) {
        // Успешный вход
        setAttempts(0);
        localStorage.removeItem('admin_block_data');
        
        // Создание защищенной сессии
        const sessionData = {
          timestamp: Date.now(),
          expires: Date.now() + SESSION_TIMEOUT,
          userAgent: navigator.userAgent,
          ip: 'localhost' // В реальной системе получать из бэкенда
        };
        
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
        
        // Автоматический выход через час
        setTimeout(() => {
          localStorage.removeItem('admin_session');
          window.location.reload();
        }, SESSION_TIMEOUT);
        
        onLogin();
      } else {
        setError('Неверный код двухфакторной аутентификации');
        setTwoFaCode('');
      }
    }
    
    if (!twoFaEnabled) {
      setPassword('');
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Сохраняем данные о попытках
    const blockData = {
      timestamp: Date.now(),
      attempts: newAttempts
    };
    localStorage.setItem('admin_block_data', JSON.stringify(blockData));
    
    if (newAttempts >= MAX_ATTEMPTS) {
      setIsBlocked(true);
      setError(`Превышено количество попыток входа. Доступ заблокирован на 5 минут.`);
      
      // Разблокировка через 5 минут
      setTimeout(() => {
        setIsBlocked(false);
        setAttempts(0);
        localStorage.removeItem('admin_block_data');
      }, BLOCK_TIME);
    } else {
      setError(`Неверные данные. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`);
    }
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Логин</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                disabled={isBlocked}
                required
              />
            </div>
            
            {!twoFaEnabled ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Пароль</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  disabled={isBlocked}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Код двухфакторной аутентификации</label>
                <Input
                  type="text"
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  placeholder="Введите 6-значный код"
                  maxLength={6}
                  disabled={isBlocked}
                  required
                />
                <p className="text-xs text-gray-500">
                  <Icon name="Info" size={12} className="inline mr-1" />
                  Код отправлен на ваш email/телефон
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <Icon name="AlertCircle" size={16} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-bg"
              disabled={isBlocked || !username || (!twoFaEnabled && !password) || (twoFaEnabled && !twoFaCode)}
            >
              <Icon name={twoFaEnabled ? "Shield" : "LogIn"} size={16} className="mr-2" />
              {twoFaEnabled ? 'Подтвердить код' : 'Войти в систему'}
            </Button>
            
            {twoFaEnabled && (
              <Button 
                type="button" 
                variant="outline"
                className="w-full"
                onClick={() => {
                  setTwoFaEnabled(false);
                  setTwoFaCode('');
                  setExpectedTwoFa('');
                }}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Вернуться к вводу пароля
              </Button>
            )}
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
        </CardContent>
      </Card>
    </div>
  );
}