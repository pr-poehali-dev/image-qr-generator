import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  email?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    // Загрузка отзывов из localStorage
    const pendingReviews = JSON.parse(localStorage.getItem('pending_reviews') || '[]');
    const approvedReviews = JSON.parse(localStorage.getItem('approved_reviews') || '[]');
    const rejectedReviews = JSON.parse(localStorage.getItem('rejected_reviews') || '[]');
    
    setReviews([...pendingReviews, ...approvedReviews, ...rejectedReviews]);
  }, []);

  const handleReviewAction = (reviewId: string, action: 'approve' | 'reject') => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Обновляем статус
    const updatedReview = { ...review, status: action === 'approve' ? 'approved' : 'rejected' as const };
    
    // Удаляем из pending
    const pendingReviews = JSON.parse(localStorage.getItem('pending_reviews') || '[]');
    const filteredPending = pendingReviews.filter((r: Review) => r.id !== reviewId);
    localStorage.setItem('pending_reviews', JSON.stringify(filteredPending));
    
    // Добавляем в соответствующую категорию
    const storageKey = action === 'approve' ? 'approved_reviews' : 'rejected_reviews';
    const existingReviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingReviews.push(updatedReview);
    localStorage.setItem(storageKey, JSON.stringify(existingReviews));
    
    // Обновляем состояние
    setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
    setSelectedReview(null);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв? Действие необратимо.')) return;
    
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Определяем из какого хранилища удалять
    let storageKey = 'pending_reviews';
    if (review.status === 'approved') storageKey = 'approved_reviews';
    if (review.status === 'rejected') storageKey = 'rejected_reviews';
    
    // Удаляем из соответствующего хранилища
    const existingReviews = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filteredReviews = existingReviews.filter((r: Review) => r.id !== reviewId);
    localStorage.setItem(storageKey, JSON.stringify(filteredReviews));
    
    // Обновляем состояние
    setReviews(reviews.filter(r => r.id !== reviewId));
    setSelectedReview(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-700 border-yellow-300">На модерации</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Одобрен</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонен</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon 
        key={i} 
        name="Star" 
        size={16} 
        className={i < rating ? "text-yellow-400 fill-current" : "text-gray-300"} 
      />
    ));
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">На модерации</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <div className="text-sm text-gray-600">Одобрено</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-gray-600">Отклонено</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Управление отзывами</CardTitle>
          <CardDescription>
            Модерируйте отзывы пользователей перед публикацией на сайте
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <Alert>
              <Icon name="MessageCircle" size={16} />
              <AlertDescription>
                Отзывов пока нет. Как только пользователи начнут оставлять отзывы, они появятся здесь.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Отзыв</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.name}</TableCell>
                    <TableCell>
                      <div className="flex">
                        {getRatingStars(review.rating)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.comment}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedReview(review)}
                            >
                              <Icon name="Eye" size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Детали отзыва</DialogTitle>
                            </DialogHeader>
                            {selectedReview && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <strong>Имя:</strong> {selectedReview.name}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {selectedReview.email || 'Не указан'}
                                  </div>
                                </div>
                                
                                <div>
                                  <strong>Рейтинг:</strong>
                                  <div className="flex mt-1">
                                    {getRatingStars(selectedReview.rating)}
                                  </div>
                                </div>
                                
                                <div>
                                  <strong>Отзыв:</strong>
                                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedReview.comment}</p>
                                </div>
                                
                                <div>
                                  <strong>Дата:</strong> {new Date(selectedReview.date).toLocaleString('ru-RU')}
                                </div>
                                
                                <div>
                                  <strong>Статус:</strong> {getStatusBadge(selectedReview.status)}
                                </div>
                                
                                <div className="flex space-x-2 pt-4 border-t">
                                  {selectedReview.status === 'pending' && (
                                    <>
                                      <Button 
                                        onClick={() => handleReviewAction(selectedReview.id, 'approve')}
                                        className="flex-1 bg-green-500 hover:bg-green-600"
                                      >
                                        <Icon name="Check" size={16} className="mr-2" />
                                        Одобрить
                                      </Button>
                                      <Button 
                                        onClick={() => handleReviewAction(selectedReview.id, 'reject')}
                                        variant="destructive"
                                        className="flex-1"
                                      >
                                        <Icon name="X" size={16} className="mr-2" />
                                        Отклонить
                                      </Button>
                                    </>
                                  )}
                                  
                                  <Button 
                                    onClick={() => handleDeleteReview(selectedReview.id)}
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                                  >
                                    <Icon name="Trash2" size={16} className="mr-2" />
                                    Удалить навсегда
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {review.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleReviewAction(review.id, 'approve')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Icon name="Check" size={14} />
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReviewAction(review.id, 'reject')}
                            >
                              <Icon name="X" size={14} />
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}