// Mock API для отзывов - эмуляция реальной базы данных
export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  adminReplyDate?: string;
}

// Эмуляция базы данных в памяти
class ReviewsDatabase {
  private reviews: Review[] = [
    // Постоянные демо-отзывы в "базе данных"
    {
      id: 'db-demo-1',
      name: 'Анна Смирнова',
      rating: 5,
      comment: 'Отличный сервис! Быстро сгенерировал QR-коды для нашего ресторана. Все клиенты теперь легко сканируют меню.',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'approved'
    },
    {
      id: 'db-demo-2', 
      name: 'Михаил К.',
      rating: 4,
      comment: 'Удобно и функционально. Особенно понравилась возможность создания штрих-кодов разных форматов.',
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'approved'
    },
    {
      id: 'db-demo-3',
      name: 'Елена Васильева', 
      rating: 5,
      comment: 'Прекрасный инструмент для работы! Создала коды для всех товаров в магазине за полчаса.',
      date: new Date(Date.now() - 259200000).toISOString(),
      status: 'approved'
    },
    {
      id: 'db-demo-4',
      name: 'Дмитрий П.',
      rating: 5,
      comment: 'Потрясающий генератор! Использую для своего интернет-магазина. Клиенты очень довольны.',
      date: new Date(Date.now() - 345600000).toISOString(),
      status: 'approved',
      adminReply: 'Спасибо за отзыв! Мы рады, что наш сервис помогает вашему бизнесу!',
      adminReplyDate: new Date(Date.now() - 340000000).toISOString()
    },
    {
      id: 'db-demo-5',
      name: 'Ольга Ковалева',
      rating: 4,
      comment: 'Очень удобно и функционально. Особенно нравятся возможности настройки дизайна.',
      date: new Date(Date.now() - 432000000).toISOString(),
      status: 'approved'
    },
    {
      id: 'db-demo-6',
      name: 'Александр Н.',
      rating: 5,
      comment: 'Лучший генератор QR-кодов, которым я пользовался! Много форматов и отличное качество.',
      date: new Date(Date.now() - 518400000).toISOString(),
      status: 'approved'
    },
    {
      id: 'db-demo-7',
      name: 'Мария С.',
      rating: 5,
      comment: 'Пользуюсь уже месяц - очень довольна! Интуитивно понятный интерфейс.',
      date: new Date(Date.now() - 604800000).toISOString(),
      status: 'approved'
    }
  ];

  // Эмуляция задержки сервера
  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Получить все одобренные отзывы
  async getApprovedReviews(): Promise<Review[]> {
    await this.delay();
    return this.reviews
      .filter(review => review.status === 'approved')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Получить отзывы на модерации
  async getPendingReviews(): Promise<Review[]> {
    await this.delay();
    return this.reviews
      .filter(review => review.status === 'pending')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Получить отклоненные отзывы
  async getRejectedReviews(): Promise<Review[]> {
    await this.delay();
    return this.reviews
      .filter(review => review.status === 'rejected')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Добавить новый отзыв
  async createReview(reviewData: Omit<Review, 'id' | 'date' | 'status'>): Promise<Review> {
    await this.delay();
    
    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      status: 'pending' // Новые отзывы требуют модерации
    };

    this.reviews.push(newReview);
    return newReview;
  }

  // Одобрить отзыв
  async approveReview(reviewId: string): Promise<Review | null> {
    await this.delay();
    
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return null;
    
    review.status = 'approved';
    return review;
  }

  // Отклонить отзыв
  async rejectReview(reviewId: string): Promise<Review | null> {
    await this.delay();
    
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return null;
    
    review.status = 'rejected';
    return review;
  }

  // Добавить ответ администратора
  async addAdminReply(reviewId: string, reply: string): Promise<Review | null> {
    await this.delay();
    
    const review = this.reviews.find(r => r.id === reviewId);
    if (!review) return null;
    
    review.adminReply = reply;
    review.adminReplyDate = new Date().toISOString();
    return review;
  }

  // Удалить отзыв
  async deleteReview(reviewId: string): Promise<boolean> {
    await this.delay();
    
    const index = this.reviews.findIndex(r => r.id === reviewId);
    if (index === -1) return false;
    
    this.reviews.splice(index, 1);
    return true;
  }
}

// Singleton экземпляр базы данных
const db = new ReviewsDatabase();

// Публичное API для работы с отзывами
export const reviewsApi = {
  // Получить одобренные отзывы (для публичного отображения)
  getApprovedReviews: () => db.getApprovedReviews(),
  
  // Отправить новый отзыв
  submitReview: (reviewData: Omit<Review, 'id' | 'date' | 'status'>) => 
    db.createReview(reviewData),
  
  // Админские функции
  admin: {
    getPendingReviews: () => db.getPendingReviews(),
    getApprovedReviews: () => db.getApprovedReviews(), // Добавляем для админки
    getRejectedReviews: () => db.getRejectedReviews(),
    approveReview: (reviewId: string) => db.approveReview(reviewId),
    rejectReview: (reviewId: string) => db.rejectReview(reviewId),
    addReply: (reviewId: string, reply: string) => db.addAdminReply(reviewId, reply),
    deleteReview: (reviewId: string) => db.deleteReview(reviewId)
  }
};

// Экспорт типов для использования в компонентах
export type { Review };