import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function Index() {
  const [dragActive, setDragActive] = useState(false);
  const [qrText, setQrText] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file drop logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Icon name="QrCode" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI QR Generator</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Вход</Button>
            <Button className="gradient-bg">Регистрация</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Создавайте <span className="gradient-text">умные QR-коды</span>
            <br />с помощью ИИ
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Загружайте изображения, настраивайте дизайн и получайте красивые QR-коды 
            с AI-оптимизацией за считанные секунды
          </p>
          <div className="flex items-center justify-center space-x-4 mb-12">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Icon name="Sparkles" size={16} className="mr-1" />
              AI-оптимизация
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Icon name="Zap" size={16} className="mr-1" />
              Быстрая генерация
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Icon name="Download" size={16} className="mr-1" />
              HD качество
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Generator */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Left Column - Generator */}
            <div className="space-y-8">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Upload" size={24} />
                    <span>Шаг 1: Загрузите изображение</span>
                  </CardTitle>
                  <CardDescription>
                    Перетащите файл или выберите с устройства (JPG, PNG, WEBP до 5MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Icon name="ImageUp" size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg mb-2">Перетащите изображение сюда</p>
                    <p className="text-sm text-gray-500 mb-4">или</p>
                    <Button>Выбрать файл</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Type" size={24} />
                    <span>Шаг 2: Содержимое QR</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="text">Текст</TabsTrigger>
                      <TabsTrigger value="contact">Контакт</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url">
                      <Input 
                        placeholder="https://example.com" 
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="text">
                      <Textarea 
                        placeholder="Введите ваш текст (до 250 символов)" 
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="contact">
                      <div className="space-y-4">
                        <Input placeholder="Имя" />
                        <Input placeholder="Телефон" />
                        <Input placeholder="Email" />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Palette" size={24} />
                    <span>Шаг 3: Дизайн</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span>Форма модулей</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Квадрат</Button>
                      <Button variant="outline" size="sm">Круг</Button>
                      <Button variant="outline" size="sm">Скругление</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Цвета</span>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 rounded bg-black border cursor-pointer"></div>
                      <div className="w-8 h-8 rounded gradient-bg border cursor-pointer"></div>
                      <div className="w-8 h-8 rounded bg-blue-500 border cursor-pointer"></div>
                      <div className="w-8 h-8 rounded bg-red-500 border cursor-pointer"></div>
                      <div className="w-8 h-8 rounded bg-green-500 border cursor-pointer"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Уровень коррекции</span>
                    <Slider defaultValue={[30]} max={100} step={1} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Добавить логотип</span>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Features */}
            <div className="space-y-8">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-8 text-center">
                  <div className="w-64 h-64 mx-auto mb-6 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <Icon name="QrCode" size={64} className="text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Предварительный просмотр</h3>
                  <p className="text-gray-600 mb-4">QR-код появится здесь после заполнения полей</p>
                  <Button size="lg" className="gradient-bg">
                    <Icon name="Download" size={20} className="mr-2" />
                    Скачать QR-код
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Sparkles" size={24} />
                    <span>AI-возможности</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Brain" size={20} className="mt-1 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Умная оптимизация</h4>
                      <p className="text-sm text-gray-600">Автоматическая коррекция контраста и яркости</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Shield" size={20} className="mt-1 text-green-600" />
                    <div>
                      <h4 className="font-medium">NSFW фильтр</h4>
                      <p className="text-sm text-gray-600">Проверка контента через Google Vision API</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Crop" size={20} className="mt-1 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Умная обрезка</h4>
                      <p className="text-sm text-gray-600">Автоматическое удаление фона и кроппинг</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Выберите тарифный план</h2>
            <p className="text-xl text-gray-600">Начните бесплатно или получите доступ к премиум-функциям</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Бесплатный</CardTitle>
                <CardDescription>Для персонального использования</CardDescription>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">5 QR-кодов в день</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Базовые настройки</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">PNG загрузка</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedPlan('free')}
                >
                  Начать бесплатно
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-purple-500 shadow-lg scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="gradient-bg">Популярный</Badge>
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Для профессионалов</CardDescription>
                <div className="text-3xl font-bold">$9.99<span className="text-sm font-normal">/мес</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Неограниченные QR-коды</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Динамические QR-коды</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Аналитика сканирований</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Без водяных знаков</span>
                </div>
                <Button 
                  className="w-full gradient-bg"
                  onClick={() => setSelectedPlan('pro')}
                >
                  Выбрать Pro
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Для команд и бизнеса</CardDescription>
                <div className="text-3xl font-bold">$29.99<span className="text-sm font-normal">/мес</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Все функции Pro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">White Label</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">API доступ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span className="text-sm">Кастомный домен</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedPlan('enterprise')}
                >
                  Связаться с нами
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Почему выбирают нас?</h2>
            <p className="text-xl text-gray-600">Передовые технологии для создания идеальных QR-кодов</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-bg rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse-slow">
                  <Icon name="QrCode" size={24} className="text-white" />
                </div>
                <h3 className="font-bold mb-2">Высокое качество</h3>
                <p className="text-sm text-gray-600">QR-коды в разрешении до 4K с идеальной читаемостью</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-bg rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse-slow">
                  <Icon name="Sparkles" size={24} className="text-white" />
                </div>
                <h3 className="font-bold mb-2">AI магия</h3>
                <p className="text-sm text-gray-600">Автоматическая оптимизация и улучшение изображений</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-bg rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse-slow">
                  <Icon name="BarChart3" size={24} className="text-white" />
                </div>
                <h3 className="font-bold mb-2">Аналитика</h3>
                <p className="text-sm text-gray-600">Подробная статистика сканирований и географии</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
              <CardContent className="p-6">
                <div className="w-12 h-12 gradient-bg rounded-lg mx-auto mb-4 flex items-center justify-center animate-pulse-slow">
                  <Icon name="Smartphone" size={24} className="text-white" />
                </div>
                <h3 className="font-bold mb-2">Мобильность</h3>
                <p className="text-sm text-gray-600">Полная адаптация под мобильные устройства</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Icon name="QrCode" size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold">AI QR Generator</span>
              </div>
              <p className="text-gray-400">Создавайте красивые QR-коды с помощью искусственного интеллекта</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Продукт</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Генератор</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Шаблоны</a></li>
                <li><a href="#" className="hover:text-white">Интеграции</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Документация</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Контакты</a></li>
                <li><a href="#" className="hover:text-white">Статус</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Компания</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">О нас</a></li>
                <li><a href="#" className="hover:text-white">Блог</a></li>
                <li><a href="#" className="hover:text-white">Карьера</a></li>
                <li><a href="#" className="hover:text-white">Пресса</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI QR Generator. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}