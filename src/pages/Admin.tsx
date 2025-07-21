import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

export default function Admin() {
  const [adCode, setAdCode] = useState('');
  const [adPosition, setAdPosition] = useState('header');
  
  // Mock статистика
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
    { type: 'Штрих', content: '1234567890123', time: '5 мин назад', ip: '192.168.1.2' },
    { type: 'QR', content: 'Текст сообщения', time: '8 мин назад', ip: '192.168.1.3' },
    { type: 'Штрих', content: '9876543210987', time: '12 мин назад', ip: '192.168.1.4' },
    { type: 'QR', content: 'https://test.com', time: '15 мин назад', ip: '192.168.1.5' },
  ];

  const adPositions = [
    { id: 'header', name: 'Шапка сайта', size: '728x90', active: true },
    { id: 'hero', name: 'После заголовка', size: '728x90', active: true },
    { id: 'sidebar', name: 'Боковая панель', size: '300x250', active: false },
    { id: 'footer', name: 'Перед футером', size: '728x90', active: true },
  ];

  const handleAdSave = () => {
    alert(`Реклама сохранена для позиции: ${adPosition}`);
    setAdCode('');
  };

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
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            На главную
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="ads">Реклама</TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
          </TabsList>

          {/* Статистика */}
          <TabsContent value="stats" className="space-y-8">
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
                  <CardDescription>Посещения за последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500">
                    📊 Здесь будет график посещений
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
                          <div className="w-3/4 h-full bg-purple-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-600">68%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Штрих-коды</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded">
                          <div className="w-1/3 h-full bg-orange-500 rounded"></div>
                        </div>
                        <span className="text-sm text-gray-600">32%</span>
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
                      onChange={(e) => setAdPosition(e.target.value)}
                    >
                      {adPositions.map(pos => (
                        <option key={pos.id} value={pos.id}>
                          {pos.name} ({pos.size})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">HTML код рекламы</label>
                  <Textarea 
                    placeholder="Вставьте HTML код баннера (Google AdSense, Яндекс.Директ и др.)"
                    value={adCode}
                    onChange={(e) => setAdCode(e.target.value)}
                    rows={8}
                  />
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
                        <Badge variant={position.active ? "default" : "secondary"}>
                          {position.active ? "Активна" : "Неактивна"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icon name="Trash2" size={14} />
                        </Button>
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
                            {activity.type === 'QR' ? 'QR-код' : 'Штрих-код'}
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

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Топ контента</CardTitle>
                  <CardDescription>Наиболее популярные типы контента</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">URL ссылки</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Номера товаров</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Текстовые сообщения</span>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Прочее</span>
                      <span className="text-sm font-medium">9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>География пользователей</CardTitle>
                  <CardDescription>Откуда приходят пользователи</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">🇷🇺 Россия</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">🇺🇦 Украина</span>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">🇰🇿 Казахстан</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">🇧🇾 Беларусь</span>
                      <span className="text-sm font-medium">6%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Другие</span>
                      <span className="text-sm font-medium">7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}