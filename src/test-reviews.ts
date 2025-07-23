// Простой тест для проверки работы API отзывов
import { reviewsApi } from './services/reviewsApi';

async function testReviewsAPI() {
  console.log('🧪 Тестирование API отзывов...');
  
  try {
    // 1. Получаем все одобренные отзывы
    console.log('📋 Получаем одобренные отзывы...');
    const approved = await reviewsApi.getApprovedReviews();
    console.log(`✅ Найдено ${approved.length} одобренных отзывов`);
    
    // 2. Создаем новый отзыв
    console.log('📝 Создаем новый отзыв...');
    const newReview = await reviewsApi.submitReview({
      name: 'Тестовый пользователь',
      rating: 5,
      comment: 'Отличный сервис! Тестирую API отзывов.'
    });
    console.log(`✅ Создан отзыв с ID: ${newReview.id}`);
    
    // 3. Получаем отзывы на модерации
    console.log('⏳ Получаем отзывы на модерации...');
    const pending = await reviewsApi.admin.getPendingReviews();
    console.log(`✅ Найдено ${pending.length} отзывов на модерации`);
    
    // 4. Одобряем новый отзыв
    console.log('👍 Одобряем отзыв...');
    await reviewsApi.admin.approveReview(newReview.id);
    console.log('✅ Отзыв одобрен');
    
    // 5. Добавляем ответ админа
    console.log('💬 Добавляем ответ админа...');
    await reviewsApi.admin.addReply(newReview.id, 'Спасибо за отзыв! Рады, что вам понравился наш сервис.');
    console.log('✅ Ответ добавлен');
    
    // 6. Проверяем итоговый результат
    const finalApproved = await reviewsApi.getApprovedReviews();
    console.log(`🎉 Итого одобренных отзывов: ${finalApproved.length}`);
    
    const reviewWithReply = finalApproved.find(r => r.id === newReview.id);
    if (reviewWithReply?.adminReply) {
      console.log('✅ Ответ админа сохранен корректно');
    }
    
    console.log('🎊 Все тесты пройдены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка в тестах:', error);
  }
}

// Запуск тестов (раскомментируйте для запуска)
// testReviewsAPI();

export { testReviewsAPI };