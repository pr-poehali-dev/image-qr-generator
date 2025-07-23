import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import ReviewsAdmin from '@/components/ReviewsAdmin';
import TicketsAdmin from '@/components/TicketsAdmin';
import Login from './Login';
import { hashPassword } from '@/utils/security';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [adCode, setAdCode] = useState('');
  const [adPosition, setAdPosition] = useState('header');
  const [adPlacements, setAdPlacements] = useState<{[key: string]: string}>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [yandexMetricaId, setYandexMetricaId] = useState(localStorage.getItem('yandex_metrica_id') || '');

  const SESSION_DURATION = 1800000; // 30 минут

  // Проверка сессии при загрузке
  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session) {
      const sessionTime = parseInt(session);
      const currentTime = Date.now();
      
      if (currentTime - sessionTime < SESSION_DURATION) {
        setIsAuthenticated(true);
        // Устанавливаем таймер для автоматического выхода
        const remainingTime = SESSION_DURATION - (currentTime - sessionTime);
        setSessionTimeout(setTimeout(handleLogout, remainingTime));
      } else {
        localStorage.removeItem('admin_session');
      }
    }

    // Загружаем размещения рекламы
    const savedPlacements = JSON.parse(localStorage.getItem('ad_placements') || '{}');
    setAdPlacements(savedPlacements);

    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    
    // Устанавливаем таймер для автоматического выхода
    const timeout = setTimeout(handleLogout, SESSION_DURATION);
    setSessionTimeout(timeout);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    setSessionTimeout(null);
  };

  const handlePasswordChange = () => {
    setPasswordChangeError('');
    
    if (!newPassword || newPassword.length < 8) {
      setPasswordChangeError('Пароль должен содержать минимум 8 символов');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Пароли не совпадают');
      return;
    }
    
    const hashedPassword = hashPassword(newPassword);
    localStorage.setItem('admin_password_hash', hashedPassword);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordDialog(false);
    alert('Пароль успешно изменен');
  };

  // Mock статистика (будет заменена на реальную из Яндекс.Метрики)
  const stats = {
    totalVisits: 15420,
    codesGenerated: 8934,
    averageSessionTime: '3:24',
    conversionRate: 12.4,
    topCodeType: 'QR-код',
    dailyActive: 342
  };

  const handleSaveAdPlacement = () => {
    if (!adCode.trim() || !adPosition) return;

    const updatedPlacements = {
      ...adPlacements,
      [adPosition]: adCode.trim()
    };

    setAdPlacements(updatedPlacements);
    localStorage.setItem('ad_placements', JSON.stringify(updatedPlacements));
    
    // Принудительно обновляем рекламные блоки
    window.dispatchEvent(new CustomEvent('ad-placement-updated'));
    
    setAdCode('');
    alert('Реклама успешно добавлена!');
  };

  const handleRemoveAdPlacement = (position: string) => {
    const updatedPlacements = { ...adPlacements };
    delete updatedPlacements[position];
    
    setAdPlacements(updatedPlacements);
    localStorage.setItem('ad_placements', JSON.stringify(updatedPlacements));
    
    window.dispatchEvent(new CustomEvent('ad-placement-updated'));
    alert('Реклама удалена!');
  };

  const handleSaveYandexMetrica = () => {
    localStorage.setItem('yandex_metrica_id', yandexMetricaId);
    alert('ID Яндекс.Метрики сохранен! Перезагрузите страницу для применения изменений.');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Icon name="Settings" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Админ Панель</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Icon name="User" size={14} className="mr-1" />
              ZassalAdmin
            </Badge>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            <TabsTrigger value="tickets">Тикеты</TabsTrigger>
            <TabsTrigger value="ads">Реклама</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего посещений</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVisits.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% за месяц</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Кодов создано</CardTitle>
                  <Icon name="QrCode" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.codesGenerated.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% за неделю</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активных сегодня</CardTitle>
                  <Icon name="Activity" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.dailyActive}</div>
                  <p className="text-xs text-muted-foreground">+5% от вчера</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Яндекс.Метрика</CardTitle>
                <CardDescription>
                  Настройка аналитики для отслеживания действий пользователей
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Введите ID счетчика Яндекс.Метрики"
                    value={yandexMetricaId}
                    onChange={(e) => setYandexMetricaId(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveYandexMetrica}>
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                </div>
                {yandexMetricaId && (
                  <Alert>
                    <Icon name="Info" size={16} />
                    <AlertDescription>
                      Текущий ID: {yandexMetricaId}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsAdmin />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketsAdmin />
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление рекламными блоками</CardTitle>
                <CardDescription>
                  Добавляйте HTML/JS код для показа рекламы в различных позициях сайта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Позиция</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={adPosition} 
                      onChange={(e) => setAdPosition(e.target.value)}
                    >
                      <option value="header">Шапка сайта</option>
                      <option value="hero">После заголовка</option>
                      <option value="sidebar">Боковая панель</option>
                      <option value="footer">Перед подвалом</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">HTML/JS код рекламы</label>
                    <Textarea
                      placeholder="Вставьте код рекламного блока (например, от Google AdSense, Яндекс.Директ и т.д.)"
                      value={adCode}
                      onChange={(e) => setAdCode(e.target.value)}
                      rows={6}
                    />
                  </div>
                  
                  <Button onClick={handleSaveAdPlacement} disabled={!adCode.trim()}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить рекламный блок
                  </Button>
                </div>
              </CardContent>
            </Card>

            {Object.keys(adPlacements).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Активные рекламные блоки</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Позиция</TableHead>
                        <TableHead>Код (превью)</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(adPlacements).map(([position, code]) => (
                        <TableRow key={position}>
                          <TableCell className="font-medium">
                            {position === 'header' && 'Шапка сайта'}
                            {position === 'hero' && 'После заголовка'}
                            {position === 'sidebar' && 'Боковая панель'}
                            {position === 'footer' && 'Перед подвалом'}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 p-1 rounded">
                              {code.length > 50 ? code.substring(0, 50) + '...' : code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveAdPlacement(position)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>Управление паролем администратора</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon name="Lock" size={16} className="mr-2" />
                      Изменить пароль
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Изменение пароля администратора</DialogTitle>
                      <DialogDescription>
                        Введите новый пароль для входа в админ панель
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder="Новый пароль (мин. 8 символов)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="Подтвердите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      {passwordChangeError && (
                        <Alert variant="destructive">
                          <AlertDescription>{passwordChangeError}</AlertDescription>
                        </Alert>
                      )}
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handlePasswordChange}
                          disabled={!newPassword || !confirmPassword}
                        >
                          Сохранить
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowPasswordDialog(false);
                            setNewPassword('');
                            setConfirmPassword('');
                            setPasswordChangeError('');
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}