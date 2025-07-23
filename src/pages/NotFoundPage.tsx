import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-24 h-24 gradient-bg rounded-full mx-auto mb-6 flex items-center justify-center">
            <Icon name="FileQuestion" size={48} className="text-white" />
          </div>
          <CardTitle className="text-6xl font-bold gradient-text mb-2">404</CardTitle>
          <CardDescription className="text-lg">
            Упс! Страница не найдена
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Возможно, страница была удалена или вы перешли по неверной ссылке.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full gradient-bg"
              size="lg"
            >
              <Icon name="Home" size={20} className="mr-2" />
              Вернуться на главную
            </Button>
            
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">
              Популярные разделы:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/")}
                className="text-xs"
              >
                <Icon name="QrCode" size={14} className="mr-1" />
                Генератор кодов
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;