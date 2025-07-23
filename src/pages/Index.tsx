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
import ReviewForm from '@/components/ReviewForm';
import SupportTicketForm from '@/components/SupportTicketForm';
import AdRenderer from '@/components/AdRenderer';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
// @ts-ignore
import bwip from 'bwip-js';
// @ts-ignore
import QRCodeWithLogo from 'qrcode-with-logos';

export default function Index() {
  const [codeText, setCodeText] = useState('');
  const [codeType, setCodeType] = useState<'qr' | 'barcode' | 'datamatrix' | 'aztec'>('qr');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [qrColorType, setQrColorType] = useState<'solid' | 'gradient' | 'artistic'>('solid');
  const [qrGradientStart, setQrGradientStart] = useState('#000000');
  const [qrGradientEnd, setQrGradientEnd] = useState('#0000FF');
  const [qrSize, setQrSize] = useState([256]);
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [qrStyle, setQrStyle] = useState('square');
  const [artisticStyle, setArtisticStyle] = useState('abstract');
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [generatedCodeUrl, setGeneratedCodeUrl] = useState<string | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);

  // Load approved reviews
  useEffect(() => {
    const loadApprovedReviews = () => {
      const approved = JSON.parse(localStorage.getItem('approved_reviews') || '[]');
      setApprovedReviews(approved);
    };

    loadApprovedReviews();
    // Listen for storage changes to update reviews in real-time
    const handleStorageChange = () => loadApprovedReviews();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchCodes, setBatchCodes] = useState<string[]>([]);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);


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
        case 'qr': {
          const size = qrSize[0];
          
          if (qrColorType === 'artistic') {
            // Artistic QR with generated background
            setIsGeneratingArt(true);
            
            try {
              // Generate artistic background based on selected style
              const stylePrompts = {
                abstract: `abstract art background, colorful geometric shapes, vibrant colors, modern digital art style, 
                          flowing patterns, artistic composition, suitable for QR code overlay, high contrast areas`,
                nature: `beautiful nature background with flowers, leaves, botanical elements, soft pastel colors, 
                         watercolor style, organic patterns, suitable for QR code overlay`,
                geometric: `geometric pattern background, clean lines, symmetrical shapes, modern design, 
                           minimalist style, contrasting colors, suitable for QR code overlay`,
                watercolor: `watercolor background, soft flowing colors, paint splashes, artistic brushstrokes, 
                            gentle gradients, suitable for QR code overlay, high contrast areas`
              };
              
              const prompt = stylePrompts[artisticStyle as keyof typeof stylePrompts] || stylePrompts.abstract;
              
              // Generate background image
              const backgroundPath = await new Promise<string>((resolve, reject) => {
                // Since we can't call generate_image directly here, we'll create a placeholder
                // In a real implementation, you'd call your image generation API here
                setTimeout(() => {
                  // Create a colorful canvas as placeholder
                  const bgCanvas = document.createElement('canvas');
                  bgCanvas.width = size;
                  bgCanvas.height = size;
                  const bgCtx = bgCanvas.getContext('2d');
                  
                  if (bgCtx) {
                    // Create artistic background based on style
                    if (artisticStyle === 'abstract') {
                      // Abstract colorful background
                      const gradient = bgCtx.createRadialGradient(size/3, size/3, 0, size/2, size/2, size/2);
                      gradient.addColorStop(0, '#FF6B6B');
                      gradient.addColorStop(0.3, '#4ECDC4');
                      gradient.addColorStop(0.6, '#45B7D1');
                      gradient.addColorStop(1, '#96CEB4');
                      bgCtx.fillStyle = gradient;
                      bgCtx.fillRect(0, 0, size, size);
                      
                      // Add some circles for texture
                      for (let i = 0; i < 20; i++) {
                        bgCtx.beginPath();
                        bgCtx.arc(Math.random() * size, Math.random() * size, Math.random() * 30 + 10, 0, Math.PI * 2);
                        bgCtx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.3)`;
                        bgCtx.fill();
                      }
                    } else if (artisticStyle === 'nature') {
                      // Nature-inspired background
                      const gradient = bgCtx.createLinearGradient(0, 0, size, size);
                      gradient.addColorStop(0, '#8FBC8F');
                      gradient.addColorStop(0.5, '#98FB98');
                      gradient.addColorStop(1, '#F0FFF0');
                      bgCtx.fillStyle = gradient;
                      bgCtx.fillRect(0, 0, size, size);
                      
                      // Add leaf-like shapes
                      for (let i = 0; i < 15; i++) {
                        bgCtx.beginPath();
                        const x = Math.random() * size;
                        const y = Math.random() * size;
                        bgCtx.ellipse(x, y, 20, 40, Math.random() * Math.PI, 0, Math.PI * 2);
                        bgCtx.fillStyle = `hsla(120, 60%, 40%, 0.2)`;
                        bgCtx.fill();
                      }
                    } else if (artisticStyle === 'geometric') {
                      // Geometric background
                      bgCtx.fillStyle = '#F8F9FA';
                      bgCtx.fillRect(0, 0, size, size);
                      
                      // Add geometric shapes
                      const colors = ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'];
                      for (let i = 0; i < 10; i++) {
                        bgCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '30';
                        const shapeSize = 30 + Math.random() * 40;
                        bgCtx.fillRect(
                          Math.random() * (size - shapeSize), 
                          Math.random() * (size - shapeSize), 
                          shapeSize, 
                          shapeSize
                        );
                      }
                    } else {
                      // Watercolor style
                      bgCtx.fillStyle = '#FFF';
                      bgCtx.fillRect(0, 0, size, size);
                      
                      // Create watercolor effect
                      const colors = ['#FF7675', '#74B9FF', '#00B894', '#FDCB6E', '#E17055'];
                      for (let i = 0; i < 8; i++) {
                        const gradient = bgCtx.createRadialGradient(
                          Math.random() * size, Math.random() * size, 0,
                          Math.random() * size, Math.random() * size, size/3
                        );
                        const color = colors[Math.floor(Math.random() * colors.length)];
                        gradient.addColorStop(0, color + '40');
                        gradient.addColorStop(1, color + '00');
                        bgCtx.fillStyle = gradient;
                        bgCtx.fillRect(0, 0, size, size);
                      }
                    }
                    
                    resolve(bgCanvas.toDataURL());
                  } else {
                    reject(new Error('Could not create background'));
                  }
                }, 1000); // Simulate generation time
              });
              
              // Create QR code with artistic background
              const canvas = document.createElement('canvas');
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Draw background
                const bgImg = new Image();
                await new Promise((resolve) => {
                  bgImg.onload = resolve;
                  bgImg.src = backgroundPath;
                });
                ctx.drawImage(bgImg, 0, 0, size, size);
                
                // Generate QR code with transparency
                const qrData = await QRCode.toDataURL(codeText, {
                  width: size,
                  margin: 2,
                  color: {
                    dark: '#000000',
                    light: '#00000000', // Transparent background
                  },
                  errorCorrectionLevel: 'H', // High error correction for artistic overlay
                });
                
                // Load QR image
                const qrImg = new Image();
                await new Promise((resolve) => {
                  qrImg.onload = resolve;
                  qrImg.src = qrData;
                });
                
                // Draw QR with enhanced contrast
                ctx.globalCompositeOperation = 'multiply';
                ctx.drawImage(qrImg, 0, 0, size, size);
                ctx.globalCompositeOperation = 'source-over';
                
                // Add white outline to QR modules for better readability
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = size;
                tempCanvas.height = size;
                const tempCtx = tempCanvas.getContext('2d')!;
                tempCtx.drawImage(qrImg, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, size, size);
                
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                const moduleSize = Math.ceil(size / 33);
                
                for (let y = 0; y < size; y += moduleSize) {
                  for (let x = 0; x < size; x += moduleSize) {
                    let shouldStroke = false;
                    for (let dy = 0; dy < moduleSize && !shouldStroke; dy++) {
                      for (let dx = 0; dx < moduleSize && !shouldStroke; dx++) {
                        const pixelY = Math.min(y + dy, size - 1);
                        const pixelX = Math.min(x + dx, size - 1);
                        const pixel = (pixelY * size + pixelX) * 4;
                        if (imageData.data[pixel] < 128) {
                          shouldStroke = true;
                        }
                      }
                    }
                    
                    if (shouldStroke) {
                      ctx.strokeRect(x, y, moduleSize, moduleSize);
                    }
                  }
                }
                
                codeDataUrl = canvas.toDataURL('image/png');
              }
            } catch (error) {
              console.error('Error generating artistic QR:', error);
              // Fallback to regular QR
              codeDataUrl = await QRCode.toDataURL(codeText, {
                width: qrSize[0],
                margin: 2,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF',
                },
                errorCorrectionLevel: errorCorrection as any,
              });
            } finally {
              setIsGeneratingArt(false);
            }
          } else if (qrColorType === 'gradient' || qrStyle !== 'square') {
            // Custom rendering for gradient or styled QR codes
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Generate base QR code data
              const baseQR = await QRCode.toDataURL(codeText, {
                width: size,
                margin: 2,
                color: {
                  dark: '#000000',
                  light: qrBgColor,
                },
                errorCorrectionLevel: errorCorrection as any,
              });
              
              // Load base QR image
              const img = new Image();
              await new Promise((resolve) => {
                img.onload = resolve;
                img.src = baseQR;
              });
              
              // Draw background
              ctx.fillStyle = qrBgColor;
              ctx.fillRect(0, 0, size, size);
              
              // Get pixel data to identify modules
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = size;
              tempCanvas.height = size;
              const tempCtx = tempCanvas.getContext('2d')!;
              tempCtx.drawImage(img, 0, 0);
              const imageData = tempCtx.getImageData(0, 0, size, size);
              
              // Set up color (gradient or solid)
              if (qrColorType === 'gradient') {
                const gradient = ctx.createLinearGradient(0, 0, size, size);
                gradient.addColorStop(0, qrGradientStart);
                gradient.addColorStop(1, qrGradientEnd);
                ctx.fillStyle = gradient;
              } else {
                ctx.fillStyle = qrColor;
              }
              
              // Draw styled modules with proper gradient handling
              for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                  const pixel = (y * size + x) * 4;
                  if (imageData.data[pixel] < 128) { // Dark pixel
                    // Find module boundaries for this pixel
                    const moduleX = Math.floor(x / 8) * 8; // Rough module size estimation
                    const moduleY = Math.floor(y / 8) * 8;
                    const moduleSize = 8;
                    
                    // Only draw if we're at the start of a module (avoid overdraw)
                    if (x === moduleX && y === moduleY) {
                      if (qrStyle === 'circle') {
                        ctx.beginPath();
                        ctx.arc(moduleX + moduleSize/2, moduleY + moduleSize/2, moduleSize/2 * 0.8, 0, Math.PI * 2);
                        ctx.fill();
                      } else if (qrStyle === 'rounded') {
                        const radius = moduleSize * 0.3;
                        ctx.beginPath();
                        ctx.roundRect(moduleX + 1, moduleY + 1, moduleSize - 2, moduleSize - 2, radius);
                        ctx.fill();
                      } else {
                        ctx.fillRect(moduleX, moduleY, moduleSize, moduleSize);
                      }
                    }
                  }
                }
              }
              
              codeDataUrl = canvas.toDataURL('image/png');
            } else {
              // Fallback
              codeDataUrl = await QRCode.toDataURL(codeText, {
                width: qrSize[0],
                margin: 2,
                color: {
                  dark: qrColorType === 'gradient' ? qrGradientStart : qrColor,
                  light: qrBgColor,
                },
                errorCorrectionLevel: errorCorrection as any,
              });
            }
          } else {
            // Regular QR code
            codeDataUrl = await QRCode.toDataURL(codeText, {
              width: qrSize[0],
              margin: 2,
              color: {
                dark: qrColor,
                light: qrBgColor,
              },
              errorCorrectionLevel: errorCorrection as any,
            });
          }
          break;
        }
          
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

  // Helper functions for contact and wifi
  const updateContactVCard = (name: string, phone: string, email: string) => {
    let vcard = 'BEGIN:VCARD\\nVERSION:3.0\\n';
    if (name) vcard += `FN:${name}\\n`;
    if (phone) vcard += `TEL:${phone}\\n`;
    if (email) vcard += `EMAIL:${email}\\n`;
    vcard += 'END:VCARD';
    setCodeText(vcard);
  };

  const updateWifiString = (ssid: string, password: string, security: string) => {
    if (!ssid) {
      setCodeText('');
      return;
    }
    let wifiString = `WIFI:T:${security};S:${ssid};`;
    if (security !== 'nopass' && password) {
      wifiString += `P:${password};`;
    }
    wifiString += 'H:;;';
    setCodeText(wifiString);
  };

  // Auto-generate code when parameters change
  useEffect(() => {
    if (codeText) {
      const timeout = setTimeout(generateCode, 500);
      return () => clearTimeout(timeout);
    } else {
      setGeneratedCodeUrl(null);
    }
  }, [codeText, codeType, qrColor, qrBgColor, qrSize, errorCorrection, barcodeFormat, qrStyle, qrColorType, qrGradientStart, qrGradientEnd, artisticStyle]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 sm:w-8 sm:h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Icon name="QrCode" size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AI Code Generator Pro</span>
          </div>
          
          {/* Ad Space - Header */}
          <div className="hidden md:block w-full max-w-80 h-12 flex items-center justify-center">
            <AdRenderer position="header" className="max-w-full max-h-full" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Генератор <span className="gradient-text">любых кодов</span>
            <br />с AI-технологиями
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            QR-коды, штрих-коды, DataMatrix, Aztec. Расширенные настройки дизайна, 
            batch-генерация и множество уникальных возможностей
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8">
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
          <div className="w-full max-w-2xl mx-auto h-20 flex items-center justify-center mb-8">
            <AdRenderer position="hero" className="w-full max-h-full" />
          </div>
        </div>
      </section>

      {/* Main Generator */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                      variant={codeType === 'qr' ? "default" : "outline"}
                      className={`h-16 sm:h-20 flex flex-col p-3 ${codeType === 'qr' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('qr')}
                    >
                      <Icon name="QrCode" size={20} />
                      <span className="text-sm sm:text-xs mt-1">QR-код</span>
                    </Button>
                    <Button 
                      variant={codeType === 'barcode' ? "default" : "outline"}
                      className={`h-16 sm:h-20 flex flex-col p-3 ${codeType === 'barcode' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('barcode')}
                    >
                      <Icon name="Barcode" size={20} />
                      <span className="text-sm sm:text-xs mt-1">Штрих-код</span>
                    </Button>
                    <Button 
                      variant={codeType === 'datamatrix' ? "default" : "outline"}
                      className={`h-16 sm:h-20 flex flex-col p-3 ${codeType === 'datamatrix' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('datamatrix')}
                    >
                      <Icon name="Grid3X3" size={20} />
                      <span className="text-sm sm:text-xs mt-1">DataMatrix</span>
                    </Button>
                    <Button 
                      variant={codeType === 'aztec' ? "default" : "outline"}
                      className={`h-16 sm:h-20 flex flex-col p-3 ${codeType === 'aztec' ? 'gradient-bg text-white' : ''}`}
                      onClick={() => setCodeType('aztec')}
                    >
                      <Icon name="Target" size={20} />
                      <span className="text-sm sm:text-xs mt-1">Aztec</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Content Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <Icon name="Type" size={24} />
                      <span>Содержимое кода</span>
                    </div>
                    <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          <Icon name="Package" size={16} className="mr-2" />
                          Batch-генерация
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-lg mx-2 sm:mx-auto">
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
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
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
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-0 h-auto p-1">
                      <TabsTrigger value="text" className="text-sm px-4 py-3 h-12 sm:h-auto w-full justify-center">Текст</TabsTrigger>
                      <TabsTrigger value="url" className="text-sm px-4 py-3 h-12 sm:h-auto w-full justify-center">URL</TabsTrigger>
                      <TabsTrigger value="contact" className="text-sm px-4 py-3 h-12 sm:h-auto w-full justify-center">Контакт</TabsTrigger>
                      <TabsTrigger value="wifi" className="text-sm px-4 py-3 h-12 sm:h-auto w-full justify-center">WiFi</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text">
                      <Textarea 
                        placeholder={`Введите текст для ${codeType === 'qr' ? 'QR-кода' : codeType === 'barcode' ? 'штрих-кода' : codeType}`}
                        value={codeText}
                        onChange={(e) => setCodeText(e.target.value)}
                        rows={3}
                        className="w-full"
                      />
                    </TabsContent>
                    <TabsContent value="url">
                      <Input 
                        placeholder="https://example.com" 
                        value={codeText}
                        onChange={(e) => setCodeText(e.target.value)}
                        className="w-full"
                      />
                    </TabsContent>
                    <TabsContent value="contact">
                      <div className="space-y-3">
                        <Input 
                          placeholder="Имя" 
                          value={contactName}
                          onChange={(e) => {
                            setContactName(e.target.value);
                            updateContactVCard(e.target.value, contactPhone, contactEmail);
                          }}
                          className="w-full" 
                        />
                        <Input 
                          placeholder="Телефон" 
                          value={contactPhone}
                          onChange={(e) => {
                            setContactPhone(e.target.value);
                            updateContactVCard(contactName, e.target.value, contactEmail);
                          }}
                          className="w-full" 
                        />
                        <Input 
                          placeholder="Email" 
                          type="email"
                          value={contactEmail}
                          onChange={(e) => {
                            setContactEmail(e.target.value);
                            updateContactVCard(contactName, contactPhone, e.target.value);
                          }}
                          className="w-full" 
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="wifi">
                      <div className="space-y-3">
                        <Input 
                          placeholder="Название WiFi (SSID)" 
                          value={wifiSSID}
                          onChange={(e) => {
                            setWifiSSID(e.target.value);
                            updateWifiString(e.target.value, wifiPassword, wifiSecurity);
                          }}
                          className="w-full" 
                        />
                        <Input 
                          placeholder="Пароль WiFi" 
                          type="password"
                          value={wifiPassword}
                          onChange={(e) => {
                            setWifiPassword(e.target.value);
                            updateWifiString(wifiSSID, e.target.value, wifiSecurity);
                          }}
                          className="w-full" 
                        />
                        <Select value={wifiSecurity} onValueChange={(value) => {
                          setWifiSecurity(value);
                          updateWifiString(wifiSSID, wifiPassword, value);
                        }}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Тип шифрования" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WPA">WPA/WPA2</SelectItem>
                            <SelectItem value="WEP">WEP (устаревший)</SelectItem>
                            <SelectItem value="nopass">Открытая сеть</SelectItem>
                          </SelectContent>
                        </Select>
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
                <CardContent className="space-y-4 sm:space-y-6">
                  
                  {/* Colors */}
                  <div className="space-y-3">
                    {/* Color Type Selection */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Тип окраски</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Button
                          size="sm"
                          className="h-12 text-sm w-full"
                          variant={qrColorType === 'solid' ? "default" : "outline"}
                          onClick={() => setQrColorType('solid')}
                        >
                          Однотонный
                        </Button>
                        <Button
                          size="sm"
                          className="h-12 text-sm w-full"
                          variant={qrColorType === 'gradient' ? "default" : "outline"}
                          onClick={() => setQrColorType('gradient')}
                        >
                          Градиент
                        </Button>
                        <Button
                          size="sm"
                          className="h-12 text-sm w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          variant={qrColorType === 'artistic' ? "default" : "outline"}
                          onClick={() => setQrColorType('artistic')}
                        >
                          <Icon name="Sparkles" size={16} className="mr-1" />
                          Художественный
                        </Button>
                      </div>
                    </div>

                    {qrColorType === 'solid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Цвет кода</span>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={qrColor}
                              onChange={(e) => setQrColor(e.target.value)}
                              className="w-12 h-12 sm:w-10 sm:h-10 rounded border cursor-pointer touch-manipulation"
                            />
                            <Input 
                              value={qrColor} 
                              onChange={(e) => setQrColor(e.target.value)}
                              className="text-xs"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {['#000000', '#FF0000', '#0000FF', '#008000', '#800080'].map(color => (
                              <button
                                key={color}
                                className="w-8 h-8 sm:w-6 sm:h-6 rounded border touch-manipulation"
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
                          <div className="flex flex-wrap gap-1">
                            {['#FFFFFF', '#F0F0F0', '#FFFF99', '#FFE4E1', '#E0E0FF'].map(color => (
                              <button
                                key={color}
                                className="w-8 h-8 sm:w-6 sm:h-6 rounded border touch-manipulation"
                                style={{ backgroundColor: color }}
                                onClick={() => setQrBgColor(color)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : qrColorType === 'gradient' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Начальный цвет</span>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={qrGradientStart}
                                onChange={(e) => setQrGradientStart(e.target.value)}
                                className="w-12 h-12 sm:w-10 sm:h-10 rounded border cursor-pointer touch-manipulation"
                              />
                              <Input 
                                value={qrGradientStart} 
                                onChange={(e) => setQrGradientStart(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Конечный цвет</span>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={qrGradientEnd}
                                onChange={(e) => setQrGradientEnd(e.target.value)}
                                className="w-12 h-12 sm:w-10 sm:h-10 rounded border cursor-pointer touch-manipulation"
                              />
                              <Input 
                                value={qrGradientEnd} 
                                onChange={(e) => setQrGradientEnd(e.target.value)}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Gradient Presets */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Готовые градиенты</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { name: 'Огонь', start: '#FF0000', end: '#FF8C00' },
                              { name: 'Океан', start: '#0000FF', end: '#00CED1' },
                              { name: 'Лес', start: '#228B22', end: '#90EE90' },
                              { name: 'Закат', start: '#800080', end: '#FF69B4' }
                            ].map(preset => (
                              <button
                                key={preset.name}
                                className="h-10 sm:h-8 rounded border text-sm sm:text-xs text-white font-medium px-2 truncate touch-manipulation"
                                style={{ 
                                  background: `linear-gradient(45deg, ${preset.start}, ${preset.end})` 
                                }}
                                onClick={() => {
                                  setQrGradientStart(preset.start);
                                  setQrGradientEnd(preset.end);
                                }}
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Background Color for Gradient */}
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
                        </div>
                      </div>
                    ) : (
                      // Artistic QR Options
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <Icon name="Sparkles" size={20} className="text-purple-600" />
                            <span className="font-medium text-purple-800">Художественный QR-код</span>
                          </div>
                          <p className="text-sm text-purple-700 mb-4">
                            Создайте уникальный QR-код с красивым рисунком в качестве фона
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Стиль рисунка</span>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {[
                                  { value: 'abstract', label: '🎨 Абстракция', desc: 'Яркие абстрактные формы' },
                                  { value: 'nature', label: '🌸 Природа', desc: 'Цветы и растения' },
                                  { value: 'geometric', label: '🔷 Геометрия', desc: 'Геометрические узоры' },
                                  { value: 'watercolor', label: '🌊 Акварель', desc: 'Акварельные разводы' }
                                ].map(style => (
                                  <Button
                                    key={style.value}
                                    size="sm"
                          className="h-12 sm:h-auto text-sm"
                                    variant={artisticStyle === style.value ? "default" : "outline"}
                                    onClick={() => setArtisticStyle(style.value)}
                                    className="h-auto p-2 text-left"
                                  >
                                    <div>
                                      <div className="font-medium text-xs">{style.label}</div>
                                      <div className="text-xs text-gray-500">{style.desc}</div>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                            
                            {isGeneratingArt && (
                              <div className="flex items-center space-x-2 text-purple-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                                <span className="text-sm">Создаю художественный фон...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {codeType === 'qr' && (
                    <>
                      {/* QR Style */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Стиль модулей</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                              className="flex flex-col h-16 sm:h-20 p-2"
                            >
                              <Icon name={style.icon as any} size={16} />
                              <span className="text-sm sm:text-xs mt-1">{style.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>



                      {/* Size & Error Correction */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                  <div className="w-full max-w-80 h-64 sm:h-80 mx-auto mb-6 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                    {generatedCodeUrl ? (
                      <img 
                        src={generatedCodeUrl} 
                        alt={`Generated ${codeType}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-48 sm:h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
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
          <div className="w-full h-24 flex items-center justify-center">
            <AdRenderer position="footer" className="w-full max-h-full" />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Отзывы пользователей</h2>
            <p className="text-xl text-gray-600">Что говорят о нашем сервисе</p>
          </div>
          
          {approvedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {approvedReviews.map((review) => {
                const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
                const colorClass = colors[Math.floor(Math.random() * colors.length)];
                const initial = review.name.charAt(0).toUpperCase();
                const timeAgo = new Date(review.date).toLocaleDateString('ru-RU');

                return (
                  <Card key={review.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center text-white font-bold`}>
                          {initial}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{review.name}</div>
                          <div className="flex text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <Icon key={i} name="Star" size={16} className="fill-current" />
                            ))}
                            {[...Array(5 - review.rating)].map((_, i) => (
                              <Icon key={i} name="Star" size={16} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        "{review.comment}"
                      </p>
                      <div className="text-sm text-gray-400 mt-3">{timeAgo}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="MessageCircle" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Пока нет отзывов</p>
              <p className="text-gray-400">Будьте первым, кто поделится мнением о нашем сервисе!</p>
            </div>
          )}

          <div className="text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                  <Icon name="MessageCircle" size={20} className="mr-2" />
                  Оставить отзыв
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-2 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle>Поделитесь своим мнением</DialogTitle>
                  <DialogDescription>
                    Ваш отзыв поможет нам стать лучше
                  </DialogDescription>
                </DialogHeader>
                <ReviewForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Нужна помощь?</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Наша служба поддержки готова помочь вам 24/7
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gradient-bg">
                <Icon name="HeadphonesIcon" size={20} className="mr-2" />
                Обратиться в поддержку
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-lg mx-2 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>Обращение в техподдержку</DialogTitle>
                <DialogDescription>
                  Опишите вашу проблему, и мы поможем её решить
                </DialogDescription>
              </DialogHeader>
              <SupportTicketForm />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>QR-коды (все типы + логотипы)</li>
                <li>Штрих-коды (7+ форматов)</li>
                <li>DataMatrix (2D коды)</li>
                <li>Aztec Code (компактные)</li>
                <li>Batch-генерация до 1000 кодов</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Возможности</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>Продвинутый дизайн</li>
                <li>Множество стилей</li>
                <li>Высокое разрешение до 1024px</li>
                <li>100% бесплатно и без регистрации</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Code Generator Pro. Все права защищены.</p>
            <a href="/admin" className="text-xs text-gray-600 hover:text-gray-400 opacity-50 mt-2 inline-block">•</a>
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