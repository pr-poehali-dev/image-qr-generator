import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  email?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  adminReplyDate?: string;
}

export default function AdminPanel() {
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [rejectedReviews, setRejectedReviews] = useState<Review[]>([]);
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Загружаем отзывы (только пользовательские, без демо)
  useEffect(() => {
    const loadReviews = () => {
      const pending = JSON.parse(localStorage.getItem('pending_reviews') || '[]');
      // Только пользовательские одобренные отзывы (без постоянных демо)
      const approved = JSON.parse(localStorage.getItem('approved_reviews') || '[]')
        .filter((review: Review) => !review.id.startsWith('permanent-demo'));
      const rejected = JSON.parse(localStorage.getItem('rejected_reviews') || '[]');

      setPendingReviews(pending);
      setApprovedReviews(approved);
      setRejectedReviews(rejected);
    };

    loadReviews();
    const interval = setInterval(loadReviews, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Проверка пароля админа
  const handleLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      alert('Неверный пароль!');
    }
  };

  // Проверяем сохраненную аутентификацию
  useEffect(() => {
    if (localStorage.getItem('admin_authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Одобрить отзыв
  const approveReview = (reviewId: string) => {
    const pendingList = JSON.parse(localStorage.getItem('pending_reviews') || '[]');
    const approvedList = JSON.parse(localStorage.getItem('approved_reviews') || '[]');
    
    const reviewIndex = pendingList.findIndex((r: Review) => r.id === reviewId);
    if (reviewIndex !== -1) {
      const review = { ...pendingList[reviewIndex], status: 'approved' };
      pendingList.splice(reviewIndex, 1);
      approvedList.push(review);
      
      localStorage.setItem('pending_reviews', JSON.stringify(pendingList));
      localStorage.setItem('approved_reviews', JSON.stringify(approvedList));
      
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Отклонить отзыв
  const rejectReview = (reviewId: string) => {
    const pendingList = JSON.parse(localStorage.getItem('pending_reviews') || '[]');
    const rejectedList = JSON.parse(localStorage.getItem('rejected_reviews') || '[]');
    
    const reviewIndex = pendingList.findIndex((r: Review) => r.id === reviewId);
    if (reviewIndex !== -1) {
      const review = { ...pendingList[reviewIndex], status: 'rejected' };
      pendingList.splice(reviewIndex, 1);
      rejectedList.push(review);
      
      localStorage.setItem('pending_reviews', JSON.stringify(pendingList));
      localStorage.setItem('rejected_reviews', JSON.stringify(rejectedList));
      
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Добавить ответ админа
  const addAdminReply = (reviewId: string) => {
    const reply = replyText[reviewId];
    if (!reply?.trim()) return;

    const approvedList = JSON.parse(localStorage.getItem('approved_reviews') || '[]');
    const reviewIndex = approvedList.findIndex((r: Review) => r.id === reviewId);
    
    if (reviewIndex !== -1) {
      approvedList[reviewIndex] = {
        ...approvedList[reviewIndex],
        adminReply: reply,
        adminReplyDate: new Date().toISOString()
      };
      
      localStorage.setItem('approved_reviews', JSON.stringify(approvedList));
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Удалить ответ админа
  const removeAdminReply = (reviewId: string) => {
    const approvedList = JSON.parse(localStorage.getItem('approved_reviews') || '[]');
    const reviewIndex = approvedList.findIndex((r: Review) => r.id === reviewId);
    
    if (reviewIndex !== -1) {
      delete approvedList[reviewIndex].adminReply;
      delete approvedList[reviewIndex].adminReplyDate;
      
      localStorage.setItem('approved_reviews', JSON.stringify(approvedList));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  // Компонент отзыва
  const ReviewCard = ({ review, showActions = true, showReplyForm = false }: { 
    review: Review; 
    showActions?: boolean; 
    showReplyForm?: boolean;
  }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-purple-600">
                {review.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="font-medium">{review.name}</h4>
              <div className="flex text-yellow-400">
                {[...Array(review.rating)].map((_, i) => (
                  <Icon key={i} name="Star" size={14} className="fill-current" />
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={
              review.status === 'approved' ? 'default' : 
              review.status === 'rejected' ? 'destructive' : 'secondary'
            }>
              {review.status === 'approved' ? 'Одобрен' : 
               review.status === 'rejected' ? 'Отклонен' : 'На модерации'}
            </Badge>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(review.date)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">"{review.comment}"</p>
        
        {review.email && (
          <p className="text-sm text-gray-500 mb-3">Email: {review.email}</p>
        )}

        {/* Ответ админа */}
        {review.adminReply && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon name="User" size={14} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Ответ администратора</span>
              </div>
              {showReplyForm && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAdminReply(review.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Icon name="X" size={14} />
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-700">{review.adminReply}</p>
            {review.adminReplyDate && (
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(review.adminReplyDate)}
              </p>
            )}
          </div>
        )}

        {/* Форма ответа админа */}
        {showReplyForm && !review.adminReply && (
          <div className="border-t pt-3">
            <div className="flex space-x-2">
              <Textarea
                placeholder="Написать ответ от имени администратора..."
                value={replyText[review.id] || ''}
                onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                rows={2}
                className="flex-1"
              />
              <Button
                onClick={() => addAdminReply(review.id)}
                disabled={!replyText[review.id]?.trim()}
                size="sm"
              >
                <Icon name="Send" size={14} className="mr-1" />
                Ответить
              </Button>
            </div>
          </div>
        )}

        {/* Действия для pending отзывов */}
        {showActions && review.status === 'pending' && (
          <div className="flex space-x-2 mt-4">
            <Button
              onClick={() => approveReview(review.id)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Icon name="Check" size={14} className="mr-1" />
              Одобрить
            </Button>
            <Button
              onClick={() => rejectReview(review.id)}
              size="sm"
              variant="destructive"
            >
              <Icon name="X" size={14} className="mr-1" />
              Отклонить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <Icon name="Lock" size={24} className="mx-auto mb-2" />
              Админ-панель
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Введите пароль админа"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Войти
            </Button>
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription className="text-sm">
                Для демо используйте пароль: <strong>admin123</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Админ-панель отзывов</h1>
        <Button
          variant="outline"
          onClick={() => {
            setIsAuthenticated(false);
            localStorage.removeItem('admin_authenticated');
          }}
        >
          <Icon name="LogOut" size={16} className="mr-2" />
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Icon name="Clock" size={16} />
            <span>На модерации ({pendingReviews.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <Icon name="Check" size={16} />
            <span>Одобренные ({approvedReviews.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <Icon name="X" size={16} />
            <span>Отклоненные ({rejectedReviews.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingReviews.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Clock" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Нет отзывов на модерации</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map(review => (
                <ReviewCard key={review.id} review={review} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedReviews.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Check" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Нет одобренных отзывов</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedReviews.map(review => (
                <ReviewCard key={review.id} review={review} showActions={false} showReplyForm={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedReviews.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="X" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Нет отклоненных отзывов</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rejectedReviews.map(review => (
                <ReviewCard key={review.id} review={review} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}