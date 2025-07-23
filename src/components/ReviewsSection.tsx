import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { reviewsApi, type Review } from '@/services/reviewsApi';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ReviewsSection() {
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка одобренных отзывов из API
  useEffect(() => {
    const loadApprovedReviews = async () => {
      try {
        setIsLoading(true);
        const reviews = await reviewsApi.getApprovedReviews();
        setApprovedReviews(reviews);
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApprovedReviews();
    
    // Обновляем отзывы каждые 30 секунд для получения новых
    const interval = setInterval(loadApprovedReviews, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Рендер звездочек рейтинга
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon 
        key={index}
        name="Star"
        size={16}
        className={index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon name="MessageSquare" size={24} />
            <span>Отзывы клиентов</span>
          </CardTitle>
          <CardDescription>Отзывы пользователей нашего сервиса</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Загрузка отзывов...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon name="MessageSquare" size={24} />
          <span>Отзывы клиентов</span>
          <Badge variant="secondary" className="ml-2">
            {approvedReviews.length}
          </Badge>
        </CardTitle>
        <CardDescription>Отзывы пользователей нашего сервиса</CardDescription>
      </CardHeader>
      <CardContent>
        {approvedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Пока нет отзывов</p>
            <p className="text-sm">Станьте первым, кто оставит отзыв!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 ">
            {approvedReviews.slice(0, 6).map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{review.name}</div>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-500 ml-1">
                          {formatDistanceToNow(new Date(review.date), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                  {review.comment}
                </p>
                
                {review.adminReply && (
                  <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon name="Shield" size={14} className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Ответ администратора</span>
                      {review.adminReplyDate && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.adminReplyDate), { 
                            addSuffix: true, 
                            locale: ru 
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-800">{review.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
            
            {approvedReviews.length > 6 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  И еще {approvedReviews.length - 6} отзывов...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}