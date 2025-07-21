import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

export default function SupportTicketForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const categories = [
    { value: 'bug', label: 'Ошибка в работе' },
    { value: 'feature', label: 'Предложение улучшения' },
    { value: 'question', label: 'Вопрос по использованию' },
    { value: 'account', label: 'Проблемы с аккаунтом' },
    { value: 'other', label: 'Другое' }
  ];

  const generateTicketId = () => {
    return 'TK-' + Date.now().toString().slice(-6);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !category || !subject || !description) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setIsSubmitting(true);

    const newTicketId = generateTicketId();
    
    // Сохранение тикета в localStorage для демонстрации
    const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    const newTicket = {
      id: newTicketId,
      name,
      email,
      category,
      subject,
      description,
      priority,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    
    tickets.push(newTicket);
    localStorage.setItem('support_tickets', JSON.stringify(tickets));

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTicketId(newTicketId);
      
      // Метрика: отслеживание тикетов
      if (window.ym) {
        window.ym(localStorage.getItem('yandex_metrica_id'), 'reachGoal', 'support_ticket', {
          category
        });
      }
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Ticket" size={32} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-bold mb-2">Обращение создано!</h3>
        <p className="text-gray-600 mb-4">
          Номер вашего обращения: <strong>{ticketId}</strong>
        </p>
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          <p className="mb-2">📧 Уведомление отправлено на {email}</p>
          <p>⏱️ Ответ в течение 24 часов</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ваше имя *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите имя"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Email *</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Категория *</label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Приоритет</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Низкий</SelectItem>
              <SelectItem value="medium">🟡 Средний</SelectItem>
              <SelectItem value="high">🔴 Высокий</SelectItem>
              <SelectItem value="urgent">🚨 Критический</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Тема обращения *</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Кратко опишите проблему"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Подробное описание *</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Подробно опишите проблему или вопрос. Укажите шаги для воспроизведения ошибки, если применимо."
          rows={5}
          required
        />
      </div>

      <Alert>
        <Icon name="Info" size={16} />
        <AlertDescription className="text-sm">
          <strong>Время ответа:</strong> 
          <br />• Критические проблемы — до 2 часов
          <br />• Обычные вопросы — до 24 часов
          <br />• Предложения — до 72 часов
        </AlertDescription>
      </Alert>

      <Button 
        type="submit" 
        className="w-full gradient-bg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            Создаем обращение...
          </>
        ) : (
          <>
            <Icon name="Send" size={16} className="mr-2" />
            Отправить обращение
          </>
        )}
      </Button>
    </form>
  );
}