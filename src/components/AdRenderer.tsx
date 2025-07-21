import React, { useEffect, useRef } from 'react';

interface AdRendererProps {
  position: string;
  className?: string;
}

export default function AdRenderer({ position, className = '' }: AdRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Загружаем размещения рекламы
    const adPlacements = JSON.parse(localStorage.getItem('ad_placements') || '{}');
    const adCode = adPlacements[position];
    
    if (adCode && containerRef.current) {
      // Очищаем контейнер
      containerRef.current.innerHTML = '';
      
      // Вставляем HTML код
      containerRef.current.innerHTML = adCode;
      
      // Выполняем встроенные скрипты
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        
        // Копируем атрибуты
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Копируем содержимое
        if (script.innerHTML) {
          newScript.innerHTML = script.innerHTML;
        }
        
        // Заменяем старый скрипт новым
        script.parentNode?.replaceChild(newScript, script);
      });
    }
  }, [position]);
  
  // Если нет рекламы для этой позиции, не показываем ничего
  const adPlacements = JSON.parse(localStorage.getItem('ad_placements') || '{}');
  if (!adPlacements[position]) {
    return null;
  }
  
  return (
    <div 
      ref={containerRef}
      className={`ad-container ad-${position} ${className}`}
      data-ad-position={position}
    />
  );
}