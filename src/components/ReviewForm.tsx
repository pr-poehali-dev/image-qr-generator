import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { reviewsApi } from '@/services/reviewsApi';

interface ReviewFormProps {
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ onReviewSubmitted }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !comment) {
      alert('Пожалуйста, заполните имя и отзыв');
      return;
    }

    setIsSubmitting(true);

    try {
      // Отправляем отзыв через API
      await reviewsApi.submitReview({
        name,
        rating: parseInt(rating),
        comment
      });
      
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Метрика: отслеживание отзывов
      if (window.ym) {
        window.ym(localStorage.getItem('yandex_metrica_id'), 'reachGoal', 'review_submitted');
      }
      
      // Уведомляем родительский компонент
      onReviewSubmitted?.();
      
      // Очищаем форму через 3 секунды
      setTimeout(() => {
        setName('');
        setComment('');
        setEmail('');
        setRating('5');
        setSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Ошибка отправки отзыва:', error);
      setIsSubmitting(false);
      alert('Ошибка отправки отзыва. Попробуйте позже.');
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Check" size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold mb-2">Спасибо за отзыв!</h3>
        <p className="text-gray-600">
          Ваш отзыв отправлен на модерацию и появится на сайте после проверки.
        </p>
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
          <label className="text-sm font-medium">Email (необязательно)</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Оценка *</label>
        <Select value={rating} onValueChange={setRating}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">⭐⭐⭐⭐⭐ Отлично</SelectItem>
            <SelectItem value="4">⭐⭐⭐⭐ Хорошо</SelectItem>
            <SelectItem value="3">⭐⭐⭐ Нормально</SelectItem>
            <SelectItem value="2">⭐⭐ Плохо</SelectItem>
            <SelectItem value="1">⭐ Ужасно</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ваш отзыв *</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Расскажите о своем опыте использования сервиса..."
          rows={4}
          required
        />
      </div>

      <Alert>
        <Icon name="Info" size={16} />
        <AlertDescription className="text-sm">
          Все отзывы проходят модерацию. Мы публикуем только честные и конструктивные отзывы.
        </AlertDescription>
      </Alert>

      <Button 
        type="submit" 
        className="w-full gradient-bg"
        disabled={isSubmitting || !name || !comment}
      >
        {isSubmitting ? (
          <>
            <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
            Отправляем...
          </>
        ) : (
          <>
            <Icon name="Send" size={16} className="mr-2" />
            Отправить отзыв
          </>
        )}
      </Button>
    </form>
  );
}