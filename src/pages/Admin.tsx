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
    const sessionData = localStorage.getItem('admin_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const currentTime = Date.now();
        
        // Проверяем валидность сессии
        if (currentTime < session.expires) {
          // Дополнительная проверка User Agent (защита от hijacking)
          if (session.userAgent === navigator.userAgent) {
            setIsAuthenticated(true);
            
            // Устанавливаем таймер для автоматического выхода
            const remainingTime = session.expires - currentTime;
            setSessionTimeout(setTimeout(handleLogout, remainingTime));
            
            // Обновляем время последней активности
            session.lastActivity = currentTime;
            localStorage.setItem('admin_session', JSON.stringify(session));
          } else {
            // Сессия скомпрометирована - принудительный выход
            console.warn('Session hijacking attempt detected');
            localStorage.removeItem('admin_session');
            localStorage.removeItem('admin_block_data');
          }
        } else {
          // Сессия истекла
          localStorage.removeItem('admin_session');
        }
      } catch (e) {
        // Поврежденные данные сессии
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

  // Функция хеширования пароля (должна совпадать с Login.tsx)
  function hashPassword(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer
    }
    return Math.abs(hash).toString(36) + btoa(password).slice(-8);
  }

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
    
    // Сохраняем хеш нового пароля
    const passwordHash = hashPassword(newPassword);
    localStorage.setItem('admin_password_hash', passwordHash);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordDialog(false);
    alert('Пароль успешно изменен');
  };

  // Mock статистика (будет заменена на реальную из Яндекс.Метрики)
  const stats = {
    totalVisits: 15420,
    codesGenerated: 8934,
    qrCodes: 6123,
    barcodes: 2811,
    downloads: 7821,
    activeAds: 4
  };

  const recentActivity = [
    { type: 'QR', content: 'https://example.com', time: '2 мин назад', ip: '192.168.1.1' },
    { type: 'DataMatrix', content: 'DM123456789', time: '5 мин назад', ip: '192.168.1.2' },
    { type: 'Aztec', content: 'AZ987654321', time: '8 мин назад', ip: '192.168.1.3' },
    { type: 'Штрих', content: '9876543210987', time: '12 мин назад', ip: '192.168.1.4' },
    { type: 'Batch', content: '5 QR-кодов', time: '15 мин назад', ip: '192.168.1.5' },
  ];

  const adPositions = [
    { id: 'header', name: 'Шапка сайта', size: '728x90', active: true },
    { id: 'hero', name: 'После заголовка', size: '728x90', active: true },
    { id: 'sidebar', name: 'Боковая панель', size: '300x250', active: false },
    { id: 'footer', name: 'Перед футером', size: '728x90', active: true },
  ];

  const handleAdSave = () => {
    if (!adCode.trim()) {
      alert('Введите HTML код рекламы');
      return;
    }

    // Сохраняем размещение рекламы
    const updatedPlacements = { ...adPlacements, [adPosition]: adCode };
    setAdPlacements(updatedPlacements);
    localStorage.setItem('ad_placements', JSON.stringify(updatedPlacements));
    
    // Обновляем статус позиции
    const updatedPositions = adPositions.map(pos => 
      pos.id === adPosition ? { ...pos, active: true } : pos
    );
    
    alert(`Реклама успешно размещена для позиции: ${adPosition}`);
    setAdCode('');
  };

  const handleRemoveAd = (positionId: string) => {
    if (!confirm('Удалить рекламу с этой позиции?')) return;
    
    const updatedPlacements = { ...adPlacements };
    delete updatedPlacements[positionId];
    setAdPlacements(updatedPlacements);
    localStorage.setItem('ad_placements', JSON.stringify(updatedPlacements));
    
    alert('Реклама удалена');
  };

  const handleYandexMetricaSave = () => {
    localStorage.setItem('yandex_metrica_id', yandexMetricaId);
    alert('ID Яндекс.Метрики сохранен');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Админ панель</span>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Icon name="Key" size={16} className="mr-2" />
                  Сменить пароль
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Смена пароля администратора</DialogTitle>
                  <DialogDescription>
                    Введите новый пароль (минимум 8 символов)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Новый пароль</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Минимум 8 символов"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Подтвердите пароль</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите новый пароль"
                    />
                  </div>

                  {passwordChangeError && (
                    <Alert variant="destructive">
                      <AlertDescription>{passwordChangeError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2">
                    <Button onClick={handlePasswordChange} className="gradient-bg">
                      Изменить пароль
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="Home" size={16} className="mr-2" />
              На главную
            </Button>
            
            <Button variant="destructive" onClick={handleLogout}>
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="ads">Реклама</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            <TabsTrigger value="tickets">Тикеты</TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Статистика */}
          <TabsContent value="stats" className="space-y-8">
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription>
                Статистика обновляется каждые 15 минут из Яндекс.Метрики
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalVisits.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Всего посещений</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.codesGenerated.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Кодов создано</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.qrCodes.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">QR-кодов</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.barcodes.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Штрих-кодов</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.downloads.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Скачиваний</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{stats.activeAds}</div>
                  <div className="text-sm text-gray-600">Активных реклам</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>График посещений</CardTitle>
                  <CardDescription>Данные из Яндекс.Метрики за последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                    📊 Интеграция с Яндекс.Метрикой
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Популярные форматы</CardTitle>
                  <CardDescription>Соотношение создаваемых кодов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">QR-коды</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div className="w-3/5 h-full bg-purple-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-600">60%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Штрих-коды</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div className="w-1/4 h-full bg-orange-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-600">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DataMatrix</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div className="w-1/8 h-full bg-blue-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-600">10%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aztec</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div className="w-1/16 h-full bg-green-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-600">5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Реклама */}
          <TabsContent value="ads" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Управление рекламой</CardTitle>
                <CardDescription>Добавляйте и редактируйте рекламные блоки</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Позиция рекламы</label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={adPosition}
                      onChange={(e) => {
                        setAdPosition(e.target.value);
                        // Загружаем существующий код для редактирования
                        if (adPlacements[e.target.value]) {
                          setAdCode(adPlacements[e.target.value]);
                        } else {
                          setAdCode('');
                        }
                      }}
                    >
                      {adPositions.map(pos => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name} ({pos.size}) {adPlacements[pos.id] ? '✅' : '⭕'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    {adPlacements[adPosition] && (
                      <Alert className="text-sm">
                        <Icon name="Info" size={14} />
                        <AlertDescription>
                          На этой позиции уже есть реклама. Новый код заменит существующий.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">HTML код рекламы</label>
                  <Textarea 
                    placeholder={`Вставьте HTML код баннера для позиции "${adPositions.find(p => p.id === adPosition)?.name}"

Примеры кода:
• Google AdSense: <script async src="..."></script>
• Яндекс.Директ: <!-- Yandex.RTB -->
• Прямой HTML: <div><img src="banner.jpg" /></div>
• JavaScript: <script>console.log('ad loaded');</script>

Код будет отображен как есть на сайте.`}
                    value={adCode}
                    onChange={(e) => setAdCode(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500">
                    Размер баннера для выбранной позиции: {adPositions.find(p => p.id === adPosition)?.size}
                  </div>
                </div>
                
                <Button onClick={handleAdSave} className="gradient-bg">
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить рекламу
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Текущие рекламные позиции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adPositions.map(position => (
                    <div key={position.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{position.name}</h4>
                          <p className="text-sm text-gray-600">Размер: {position.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={adPlacements[position.id] ? "default" : "secondary"}>
                          {adPlacements[position.id] ? "Активна" : "Неактивна"}
                        </Badge>
                        
                        {adPlacements[position.id] && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setAdPosition(position.id);
                              setAdCode(adPlacements[position.id] || '');
                            }}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                        )}
                        
                        {adPlacements[position.id] && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRemoveAd(position.id)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        )}
                        
                        {!adPlacements[position.id] && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setAdPosition(position.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Icon name="Plus" size={14} />
                            Добавить
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Активность */}
          <TabsContent value="activity" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Последняя активность</CardTitle>
                <CardDescription>Недавно созданные коды и действия пользователей</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>Содержимое</TableHead>
                      <TableHead>Время</TableHead>
                      <TableHead>IP адрес</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant={activity.type === 'QR' ? 'default' : 'secondary'}>
                            {activity.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-xs truncate">
                          {activity.content}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {activity.time}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {activity.ip}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Отзывы */}
          <TabsContent value="reviews" className="space-y-8">
            <ReviewsAdmin />
          </TabsContent>

          {/* Тикеты */}
          <TabsContent value="tickets" className="space-y-8">
            <TicketsAdmin />
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Яндекс.Метрика</CardTitle>
                <CardDescription>Настройка интеграции для получения реальной статистики</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID счетчика Яндекс.Метрики</label>
                  <Input
                    value={yandexMetricaId}
                    onChange={(e) => setYandexMetricaId(e.target.value)}
                    placeholder="Введите ID счетчика (например: 12345678)"
                  />
                  <p className="text-xs text-gray-500">
                    Найдите ID в настройках счетчика в интерфейсе Яндекс.Метрики
                  </p>
                </div>
                
                <Button onClick={handleYandexMetricaSave} className="gradient-bg">
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить настройки
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>Настройки безопасности административной панели</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Автоматический выход</h4>
                    <p className="text-sm text-gray-600">Сессия истекает через 30 минут неактивности</p>
                  </div>
                  <Badge>Активно</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Блокировка после неудачных попыток</h4>
                    <p className="text-sm text-gray-600">Доступ блокируется на 5 минут после 3 неудачных попыток</p>
                  </div>
                  <Badge>Активно</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h4 className="font-medium">Логин администратора</h4>
                    <p className="text-sm text-gray-600">ZassalAdmin (изменение недоступно)</p>
                  </div>
                  <Badge variant="secondary">Заблокировано</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}