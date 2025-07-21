import React, { useState } from 'react';
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
  
  const ADMIN_USERNAME = 'ZassalAdmin';
  const ADMIN_PASSWORD = localStorage.getItem('admin_password') || '12345678';
  const MAX_ATTEMPTS = 3;
  const BLOCK_TIME = 300000; // 5 минут

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBlocked) {
      setError('Доступ временно заблокирован. Попробуйте позже.');
      return;
    }

    // Проверка логина и пароля
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Сброс попыток при успешном входе
      setAttempts(0);
      localStorage.setItem('admin_session', Date.now().toString());
      onLogin();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        setError(`Превышено количество попыток входа. Доступ заблокирован на 5 минут.`);
        
        // Разблокировка через 5 минут
        setTimeout(() => {
          setIsBlocked(false);
          setAttempts(0);
        }, BLOCK_TIME);
      } else {
        setError(`Неверные данные. Осталось попыток: ${MAX_ATTEMPTS - newAttempts}`);
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

            {error && (
              <Alert variant="destructive">
                <Icon name="AlertCircle" size={16} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-bg"
              disabled={isBlocked || !username || !password}
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
        </CardContent>
      </Card>
    </div>
  );
}