import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export default function Index() {
  const [codeText, setCodeText] = useState('');
  const [isQRCode, setIsQRCode] = useState(true);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrSize, setQrSize] = useState([256]);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [generatedCodeUrl, setGeneratedCodeUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCode = async () => {
    if (!codeText) {
      setGeneratedCodeUrl(null);
      return;
    }

    try {
      if (isQRCode) {
        // Generate QR Code
        const qrDataUrl = await QRCode.toDataURL(codeText, {
          width: qrSize[0],
          margin: 2,
          color: {
            dark: qrColor,
            light: qrBgColor,
          },
          errorCorrectionLevel: errorCorrection as any,
        });
        setGeneratedCodeUrl(qrDataUrl);
      } else {
        // Generate Barcode
        if (canvasRef.current) {
          JsBarcode(canvasRef.current, codeText, {
            format: barcodeFormat,
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 16,
            textColor: qrColor,
            lineColor: qrColor,
            background: qrBgColor,
          });
          const barcodeDataUrl = canvasRef.current.toDataURL();
          setGeneratedCodeUrl(barcodeDataUrl);
        }
      }
    } catch (error) {
      console.error('Ошибка генерации кода:', error);
      setGeneratedCodeUrl(null);
    }
  };

  const downloadCode = () => {
    if (!generatedCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${isQRCode ? 'qr-code' : 'barcode'}.png`;
    link.href = generatedCodeUrl;
    link.click();
  };

  // Auto-generate code when parameters change
  useEffect(() => {
    if (codeText) {
      const timeout = setTimeout(generateCode, 500);
      return () => clearTimeout(timeout);
    } else {
      setGeneratedCodeUrl(null);
    }
  }, [codeText, isQRCode, qrColor, qrBgColor, qrSize, errorCorrection, barcodeFormat]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Icon name="QrCode" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI Code Generator</span>
          </div>
          
          {/* Ad Space - Header */}
          <div className="hidden md:block w-80 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-sm text-gray-500">
            📢 Рекламное место 728x90
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Генератор <span className="gradient-text">QR-кодов</span>
            <br />и штрих-кодов
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Создавайте QR-коды и штрих-коды бесплатно. Настраивайте дизайн, 
            выбирайте формат и скачивайте в высоком качестве
          </p>
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Icon name="Check" size={16} className="mr-1" />
              100% Бесплатно
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Icon name="Zap" size={16} className="mr-1" />
              Без регистрации
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Icon name="Download" size={16} className="mr-1" />
              HD качество
            </Badge>
          </div>

          {/* Ad Space - Below Hero */}
          <div className="w-full max-w-2xl mx-auto h-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-sm text-gray-500 mb-8">
            📢 Рекламное место 728x90
          </div>
        </div>
      </section>

      {/* Main Generator */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Left Column - Generator Controls */}
            <div className="space-y-8">
              
              {/* Code Type Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Icon name="Settings" size={24} />
                      <span>Тип кода</span>
                    </span>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                      <Button 
                        size="sm" 
                        variant={isQRCode ? "default" : "ghost"}
                        className={`rounded-full px-4 ${isQRCode ? 'gradient-bg text-white' : ''}`}
                        onClick={() => setIsQRCode(true)}
                      >
                        QR-код
                      </Button>
                      <Button 
                        size="sm" 
                        variant={!isQRCode ? "default" : "ghost"}
                        className={`rounded-full px-4 ${!isQRCode ? 'gradient-bg text-white' : ''}`}
                        onClick={() => setIsQRCode(false)}
                      >
                        Штрих-код
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Content Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Type" size={24} />
                    <span>Содержимое {isQRCode ? 'QR-кода' : 'штрих-кода'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="text">Текст</TabsTrigger>
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="number">Номер</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <Textarea 
                        placeholder={isQRCode ? "Введите текст для QR-кода" : "Введите текст для штрих-кода"}
                        value={codeText}
                        onChange={(e) => setCodeText(e.target.value)}
                        rows={3}
                      />
                    </TabsContent>
                    <TabsContent value="url">
                      <Input 
                        placeholder="https://example.com" 
                        value={codeText}
                        onChange={(e) => setCodeText(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="number">
                      <Input 
                        placeholder={isQRCode ? "Введите номер" : "1234567890123"}
                        value={codeText}
                        onChange={(e) => setCodeText(e.target.value)}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Design Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Palette" size={24} />
                    <span>Настройки дизайна</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Colors */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Цвет кода</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <Input 
                          value={qrColor} 
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-24 text-xs"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Цвет фона</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={qrBgColor}
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <Input 
                          value={qrBgColor} 
                          onChange={(e) => setQrBgColor(e.target.value)}
                          className="w-24 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {isQRCode ? (
                    <>
                      {/* QR Code specific settings */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Размер: {qrSize[0]}px</span>
                        <Slider 
                          value={qrSize} 
                          onValueChange={setQrSize}
                          min={128}
                          max={1024} 
                          step={32}
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium">Уровень коррекции ошибок</span>
                        <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Низкий (7%)</SelectItem>
                            <SelectItem value="M">Средний (15%)</SelectItem>
                            <SelectItem value="Q">Высокий (25%)</SelectItem>
                            <SelectItem value="H">Максимальный (30%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Barcode specific settings */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Формат штрих-кода</span>
                        <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CODE128">CODE128</SelectItem>
                            <SelectItem value="EAN13">EAN13</SelectItem>
                            <SelectItem value="EAN8">EAN8</SelectItem>
                            <SelectItem value="UPC">UPC</SelectItem>
                            <SelectItem value="CODE39">CODE39</SelectItem>
                            <SelectItem value="ITF14">ITF14</SelectItem>
                            <SelectItem value="MSI">MSI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-8">
              
              {/* Preview Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-8 text-center">
                  <div className="w-64 h-64 mx-auto mb-6 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                    {generatedCodeUrl ? (
                      <img 
                        src={generatedCodeUrl} 
                        alt={`Generated ${isQRCode ? 'QR Code' : 'Barcode'}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <Icon name={isQRCode ? "QrCode" : "Barcode"} size={64} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {generatedCodeUrl ? `${isQRCode ? 'QR-код' : 'Штрих-код'} готов!` : 'Предварительный просмотр'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {generatedCodeUrl ? 'Скачайте код в высоком качестве' : `${isQRCode ? 'QR-код' : 'Штрих-код'} появится здесь после ввода данных`}
                  </p>
                  <Button 
                    size="lg" 
                    className="gradient-bg w-full"
                    onClick={downloadCode}
                    disabled={!generatedCodeUrl}
                  >
                    <Icon name="Download" size={20} className="mr-2" />
                    Скачать {isQRCode ? 'QR-код' : 'штрих-код'}
                  </Button>
                </CardContent>
              </Card>

              {/* Ad Space - Sidebar */}
              <Card>
                <CardContent className="p-6">
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-sm text-gray-500">
                    📢 Рекламное место 300x250
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Sparkles" size={24} />
                    <span>Возможности сервиса</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Zap" size={20} className="mt-1 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Быстрая генерация</h4>
                      <p className="text-sm text-gray-600">Коды создаются мгновенно в реальном времени</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Palette" size={20} className="mt-1 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Гибкие настройки</h4>
                      <p className="text-sm text-gray-600">Настройка цветов, размера и формата</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Download" size={20} className="mt-1 text-green-600" />
                    <div>
                      <h4 className="font-medium">Высокое качество</h4>
                      <p className="text-sm text-gray-600">Скачивание в PNG формате до 1024px</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Space - Before Footer */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-sm text-gray-500">
            📢 Рекламное место 728x90
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <Icon name="QrCode" size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold">AI Code Generator</span>
              </div>
              <p className="text-gray-400">Бесплатный генератор QR-кодов и штрих-кодов</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Форматы</h4>
              <ul className="space-y-2 text-gray-400">
                <li>QR-коды (все типы)</li>
                <li>CODE128, EAN13, EAN8</li>
                <li>UPC, CODE39, ITF14</li>
                <li>Экспорт в PNG</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">О сервисе</h4>
              <ul className="space-y-2 text-gray-400">
                <li>100% бесплатно</li>
                <li>Без регистрации</li>
                <li>Высокое качество</li>
                <li><a href="/admin" className="hover:text-white">Админ панель</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Code Generator. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Hidden canvas for barcode generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}