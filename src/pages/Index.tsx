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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
// @ts-ignore
import bwip from 'bwip-js';

export default function Index() {
  const [codeText, setCodeText] = useState('');
  const [codeType, setCodeType] = useState<'qr' | 'barcode' | 'datamatrix' | 'aztec'>('qr');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrSize, setQrSize] = useState([256]);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [qrStyle, setQrStyle] = useState('square');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [generatedCodeUrl, setGeneratedCodeUrl] = useState<string | null>(null);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchCodes, setBatchCodes] = useState<string[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Яндекс.Метрика
  useEffect(() => {
    const metricaId = localStorage.getItem('yandex_metrica_id');
    if (metricaId) {
      // Инициализация Яндекс.Метрики
      const script = document.createElement('script');
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        
        ym(${metricaId}, "init", {
          clickmap:true,
          trackLinks:true,
          accurateTrackBounce:true
        });
      `;
      document.head.appendChild(script);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateCode = async () => {
    if (!codeText) {
      setGeneratedCodeUrl(null);
      return;
    }

    try {
      let codeDataUrl = '';
      
      switch (codeType) {
        case 'qr':
          codeDataUrl = await QRCode.toDataURL(codeText, {
            width: qrSize[0],
            margin: 2,
            color: {
              dark: qrColor,
              light: qrBgColor,
            },
            errorCorrectionLevel: errorCorrection as any,
          });
          break;
          
        case 'barcode':
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
            codeDataUrl = canvasRef.current.toDataURL();
          }
          break;
          
        case 'datamatrix':
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = qrSize[0];
            canvas.height = qrSize[0];
            
            try {
              await bwip.toCanvas(canvas, {
                bcid: 'datamatrix',
                text: codeText,
                scale: 3,
                includetext: true,
                backgroundcolor: qrBgColor.replace('#', ''),
                color: qrColor.replace('#', ''),
              });
              codeDataUrl = canvas.toDataURL();
            } catch (err) {
              console.error('DataMatrix error:', err);
            }
          }
          break;
          
        case 'aztec':
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = qrSize[0];
            canvas.height = qrSize[0];
            
            try {
              await bwip.toCanvas(canvas, {
                bcid: 'azteccode',
                text: codeText,
                scale: 3,
                includetext: true,
                backgroundcolor: qrBgColor.replace('#', ''),
                color: qrColor.replace('#', ''),
              });
              codeDataUrl = canvas.toDataURL();
            } catch (err) {
              console.error('Aztec error:', err);
            }
          }
          break;
      }
      
      setGeneratedCodeUrl(codeDataUrl);
      
      // Метрика: отслеживание генерации кода
      if (window.ym) {
        window.ym(localStorage.getItem('yandex_metrica_id'), 'reachGoal', 'code_generated', {
          type: codeType,
          format: barcodeFormat
        });
      }
      
    } catch (error) {
      console.error('Ошибка генерации кода:', error);
      setGeneratedCodeUrl(null);
    }
  };

  const downloadCode = () => {
    if (!generatedCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${codeType}-code.png`;
    link.href = generatedCodeUrl;
    link.click();
    
    // Метрика: отслеживание скачиваний
    if (window.ym) {
      window.ym(localStorage.getItem('yandex_metrica_id'), 'reachGoal', 'code_downloaded');
    }
  };

  const generateBatchCodes = async () => {
    const lines = batchText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;

    setIsGeneratingBatch(true);
    setBatchProgress(0);
    const codes: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      try {
        let codeDataUrl = '';
        const text = lines[i].trim();
        
        if (codeType === 'qr') {
          codeDataUrl = await QRCode.toDataURL(text, {
            width: qrSize[0],
            margin: 2,
            color: {
              dark: qrColor,
              light: qrBgColor,
            },
            errorCorrectionLevel: errorCorrection as any,
          });
        } else if (codeType === 'barcode' && canvasRef.current) {
          JsBarcode(canvasRef.current, text, {
            format: barcodeFormat,
            width: 2,
            height: 100,
            displayValue: true,
            fontSize: 16,
            textColor: qrColor,
            lineColor: qrColor,
            background: qrBgColor,
          });
          codeDataUrl = canvasRef.current.toDataURL();
        }
        
        codes.push(codeDataUrl);
        setBatchProgress(Math.round(((i + 1) / lines.length) * 100));
        
        // Небольшая задержка для UI
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Ошибка генерации кода ${i + 1}:`, error);
      }
    }

    setBatchCodes(codes);
    setIsGeneratingBatch(false);
  };

  const downloadBatchCodes = () => {
    batchCodes.forEach((codeUrl, index) => {
      const link = document.createElement('a');
      link.download = `${codeType}-code-${index + 1}.png`;
      link.href = codeUrl;
      link.click();
    });
  };

  // Auto-generate code when parameters change
  useEffect(() => {
    if (codeText) {
      const timeout = setTimeout(generateCode, 500);
      return () => clearTimeout(timeout);
    } else {
      setGeneratedCodeUrl(null);
    }
  }, [codeText, codeType, qrColor, qrBgColor, qrSize, errorCorrection, barcodeFormat, qrStyle]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Icon name="QrCode" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI Code Generator Pro</span>
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
            Генератор <span className="gradient-text">любых кодов</span>
            <br />с AI-технологиями
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            QR-коды, штрих-коды, DataMatrix, Aztec. Расширенные настройки дизайна, 
            batch-генерация и множество уникальных возможностей
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
              <Icon name="Sparkles" size={16} className="mr-1" />
              AI-технологии
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              <Icon name="Package" size={16} className="mr-1" />
              Batch-генерация
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
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Settings" size={24} />
                    <span>Выбор типа кода</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                      variant={codeType === 'qr' ? "default" : "outline"}
                      className={`h-16 flex flex-col ${codeType === 'qr' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('qr')}
                    >
                      <Icon name="QrCode" size={20} />
                      <span className="text-xs mt-1">QR-код</span>
                    </Button>
                    <Button 
                      variant={codeType === 'barcode' ? "default" : "outline"}
                      className={`h-16 flex flex-col ${codeType === 'barcode' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('barcode')}
                    >
                      <Icon name="Barcode" size={20} />
                      <span className="text-xs mt-1">Штрих-код</span>
                    </Button>
                    <Button 
                      variant={codeType === 'datamatrix' ? "default" : "outline"}
                      className={`h-16 flex flex-col ${codeType === 'datamatrix' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('datamatrix')}
                    >
                      <Icon name="Grid3X3" size={20} />
                      <span className="text-xs mt-1">DataMatrix</span>
                    </Button>
                    <Button 
                      variant={codeType === 'aztec' ? "default" : "outline"}
                      className={`h-16 flex flex-col ${codeType === 'aztec' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('aztec')}
                    >
                      <Icon name="Target" size={20} />
                      <span className="text-xs mt-1">Aztec</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="Type" size={24} />
                      <span>Содержимое кода</span>
                    </div>
                    <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Icon name="Package" size={16} className="mr-2" />
                          Batch-генерация
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Массовая генерация кодов</DialogTitle>
                          <DialogDescription>
                            Введите каждый текст с новой строки для создания множества кодов
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder={`Пример:\nhttps://site1.com\nhttps://site2.com\n123456789\nТекст для QR`}
                            value={batchText}
                            onChange={(e) => setBatchText(e.target.value)}
                            rows={8}
                          />
                          
                          {isGeneratingBatch && (
                            <div className="space-y-2">
                              <Progress value={batchProgress} />
                              <p className="text-sm text-center">{batchProgress}% завершено</p>
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <Button 
                              onClick={generateBatchCodes} 
                              disabled={!batchText.trim() || isGeneratingBatch}
                              className="gradient-bg flex-1"
                            >
                              <Icon name="Play" size={16} className="mr-2" />
                              {isGeneratingBatch ? 'Генерируем...' : 'Создать коды'}
                            </Button>
                            
                            {batchCodes.length > 0 && (
                              <Button onClick={downloadBatchCodes} variant="outline">
                                <Icon name="Download" size={16} className="mr-2" />
                                Скачать ({batchCodes.length})
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="text">Текст</TabsTrigger>
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="contact">Контакт</TabsTrigger>
                      <TabsTrigger value="wifi">WiFi</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <Textarea 
                        placeholder={`Введите текст для ${codeType === 'qr' ? 'QR-кода' : codeType === 'barcode' ? 'штрих-кода' : codeType}`}
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
                    <TabsContent value="contact">
                      <div className="space-y-3">
                        <Input placeholder="Имя" onChange={(e) => {
                          // Простой vCard генератор
                          setCodeText(`BEGIN:VCARD\nVERSION:3.0\nFN:${e.target.value}\nEND:VCARD`);
                        }} />
                      </div>
                    </TabsContent>
                    <TabsContent value="wifi">
                      <div className="space-y-3">
                        <Input placeholder="Название WiFi" onChange={(e) => {
                          setCodeText(`WIFI:T:WPA;S:${e.target.value};P:password;H:;;`);
                        }} />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Advanced Design Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Palette" size={24} />
                    <span>Продвинутые настройки дизайна</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Colors */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Цвет кода</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <Input 
                            value={qrColor} 
                            onChange={(e) => setQrColor(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        {/* Предустановленные цвета */}
                        <div className="flex space-x-1">
                          {['#000000', '#FF0000', '#0000FF', '#008000', '#800080'].map(color => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                              onClick={() => setQrColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Цвет фона</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <Input 
                            value={qrBgColor} 
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div className="flex space-x-1">
                          {['#FFFFFF', '#F0F0F0', '#FFFF99', '#FFE4E1', '#E0E0FF'].map(color => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color }}
                              onClick={() => setQrBgColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {codeType === 'qr' && (
                    <>
                      {/* QR Style */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Стиль модулей</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'square', name: 'Квадраты', icon: 'Square' },
                            { id: 'circle', name: 'Круги', icon: 'Circle' },
                            { id: 'rounded', name: 'Скругленные', icon: 'SquareRounded' }
                          ].map(style => (
                            <Button
                              key={style.id}
                              size="sm"
                              variant={qrStyle === style.id ? "default" : "outline"}
                              onClick={() => setQrStyle(style.id)}
                              className="flex flex-col h-16"
                            >
                              <Icon name={style.icon as any} size={16} />
                              <span className="text-xs mt-1">{style.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Логотип в центре</span>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Icon name="Upload" size={16} className="mr-2" />
                            Загрузить логотип
                          </Button>
                          {logoPreview && (
                            <div className="flex items-center space-x-2">
                              <img src={logoPreview} alt="Logo" className="w-8 h-8 rounded" />
                              <Button size="sm" variant="ghost" onClick={() => {
                                setLogoFile(null);
                                setLogoPreview(null);
                              }}>
                                <Icon name="X" size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>

                      {/* Size & Error Correction */}
                      <div className="grid grid-cols-2 gap-4">
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
                          <span className="text-sm font-medium">Коррекция ошибок</span>
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
                      </div>
                    </>
                  )}

                  {codeType === 'barcode' && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Формат штрих-кода</span>
                      <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CODE128">CODE128 (универсальный)</SelectItem>
                          <SelectItem value="EAN13">EAN13 (товары)</SelectItem>
                          <SelectItem value="EAN8">EAN8 (компактный)</SelectItem>
                          <SelectItem value="UPC">UPC (США/Канада)</SelectItem>
                          <SelectItem value="CODE39">CODE39 (алфавит)</SelectItem>
                          <SelectItem value="ITF14">ITF14 (логистика)</SelectItem>
                          <SelectItem value="MSI">MSI (склады)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(codeType === 'datamatrix' || codeType === 'aztec') && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Размер: {qrSize[0]}px</span>
                      <Slider 
                        value={qrSize} 
                        onValueChange={setQrSize}
                        min={128}
                        max={512} 
                        step={32}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-8">
              
              {/* Preview Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-8 text-center">
                  <div className="w-80 h-80 mx-auto mb-6 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                    {generatedCodeUrl ? (
                      <img 
                        src={generatedCodeUrl} 
                        alt={`Generated ${codeType}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <Icon name={codeType === 'qr' ? "QrCode" : codeType === 'barcode' ? "Barcode" : "Grid3X3"} size={64} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {generatedCodeUrl ? `${codeType.toUpperCase()} готов!` : 'Предварительный просмотр'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {generatedCodeUrl ? 'Скачайте код в высоком качестве' : 'Код появится здесь после ввода данных'}
                  </p>
                  <div className="space-y-2">
                    <Button 
                      size="lg" 
                      className="gradient-bg w-full"
                      onClick={downloadCode}
                      disabled={!generatedCodeUrl}
                    >
                      <Icon name="Download" size={20} className="mr-2" />
                      Скачать {codeType.toUpperCase()}
                    </Button>
                    {generatedCodeUrl && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={generateCode}
                      >
                        <Icon name="RefreshCw" size={16} className="mr-2" />
                        Перегенерировать
                      </Button>
                    )}
                  </div>
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

              {/* Enhanced Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Sparkles" size={24} />
                    <span>Уникальные возможности</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Package" size={20} className="mt-1 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Batch-генерация</h4>
                      <p className="text-sm text-gray-600">Создание сотен кодов одновременно</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Palette" size={20} className="mt-1 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Продвинутый дизайн</h4>
                      <p className="text-sm text-gray-600">Логотипы, градиенты, формы модулей</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Grid3X3" size={20} className="mt-1 text-green-600" />
                    <div>
                      <h4 className="font-medium">Множество форматов</h4>
                      <p className="text-sm text-gray-600">QR, штрих-коды, DataMatrix, Aztec</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Icon name="Zap" size={20} className="mt-1 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Мгновенная генерация</h4>
                      <p className="text-sm text-gray-600">Коды создаются в реальном времени</p>
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
                <span className="text-xl font-bold">AI Code Generator Pro</span>
              </div>
              <p className="text-gray-400">Профессиональный генератор кодов с AI-технологиями</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Поддерживаемые форматы</h4>
              <ul className="space-y-2 text-gray-400">
                <li>QR-коды (все типы + логотипы)</li>
                <li>Штрих-коды (7+ форматов)</li>
                <li>DataMatrix (2D коды)</li>
                <li>Aztec Code (компактные)</li>
                <li>Batch-генерация до 1000 кодов</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Возможности</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Продвинутый дизайн</li>
                <li>Множество стилей</li>
                <li>Высокое разрешение до 1024px</li>
                <li>100% бесплатно и без регистрации</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Code Generator Pro. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Hidden canvas for code generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Яндекс.Метрика noscript */}
      <noscript>
        <div>
          <img 
            src={`https://mc.yandex.ru/watch/${localStorage.getItem('yandex_metrica_id')}`} 
            style={{ position: 'absolute', left: '-9999px' }} 
            alt="" 
          />
        </div>
      </noscript>
    </div>
  );
}

// Типы для Яндекс.Метрики
declare global {
  interface Window {
    ym: any;
  }
}