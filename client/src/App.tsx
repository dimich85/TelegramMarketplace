import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTelegramUser } from "./lib/telegramWebApp";
import { User } from "@shared/schema";
import { apiRequest } from "./lib/queryClient";

import Home from "@/pages/home";
import Services from "@/pages/services";
import Transactions from "@/pages/transactions";
import TransactionDetails from "@/pages/transaction-details";
import Profile from "@/pages/profile";
import TopUp from "@/pages/topup";
import NotFound from "@/pages/not-found";
import { useToast } from "@/hooks/use-toast";

import AppHeader from "@/components/layout/app-header";
import { showBackButton, hideBackButton, onBackButtonClicked } from "./lib/telegramWebApp";

function App() {
  const [location, setLocation] = useLocation();
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const { toast } = useToast();
  const isDevelopment = import.meta.env.MODE !== 'production';

  // Get Telegram user info
  useEffect(() => {
    const user = getTelegramUser();
    if (user) {
      setTelegramUser(user);
    } else if (!isDevelopment) {
      // Only show error toast in production
      toast({
        title: "Ошибка аутентификации",
        description: "Приложение должно быть открыто из Telegram",
        variant: "destructive",
      });
    }
  }, [toast, isDevelopment]);

  // Функция для возврата на предыдущую страницу по иерархии
  const goBack = useCallback(() => {
    // Определяем текущий уровень иерархии
    // Главная страница '/' - самая высокая в иерархии
    if (location === '/') {
      return; // На главной странице некуда возвращаться
    }

    // Страницы второго уровня - те, на которые можно перейти с главной
    // Сюда относятся /services, /transactions, /profile, /topup
    const secondLevelPages = ['/services', '/transactions', '/profile', '/topup'];
    
    if (secondLevelPages.includes(location)) {
      // Со второго уровня возвращаемся на главную
      setLocation('/');
      return;
    }

    // Страницы третьего уровня - детализация транзакций
    if (location.startsWith('/transaction/')) {
      // С детализации транзакций возвращаемся на список транзакций
      setLocation('/transactions');
      return;
    }

    // Для всех остальных случаев (если такие будут) - возврат на главную
    setLocation('/');
  }, [location, setLocation]);
  
  // Setup back button handling
  useEffect(() => {
    // Show back button when not on home page
    if (location !== '/') {
      showBackButton();
      
      // Configure back button handler to go back to previous page
      onBackButtonClicked(goBack);
    } else {
      hideBackButton();
    }
    
    // Clean up
    return () => {
      hideBackButton();
    };
  }, [location, goBack]);

  // Authenticate user with server
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth'],
    queryFn: async () => {
      if (!telegramUser) return null;
      
      // In development mode, pass 'demo' as initData to trigger the demo user
      const initData = isDevelopment 
        ? 'demo' 
        : (window.Telegram?.WebApp?.initData || '');
        
      const response = await apiRequest('POST', '/api/auth', { initData });
      return await response.json();
    },
    enabled: !!telegramUser,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error || (!isLoading && !user && telegramUser)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Ошибка аутентификации</h1>
        <p className="text-center text-gray-700">
          Не удалось аутентифицировать пользователя. Пожалуйста, попробуйте еще раз.
        </p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Обновить
        </button>
      </div>
    );
  }

  // Навигационный контент в зависимости от текущего маршрута
  const renderContent = () => {
    if (!user) return null;

    return (
      <Switch>
        <Route path="/services">
          <Services user={user} />
        </Route>
        <Route path="/transactions">
          <Transactions user={user} />
        </Route>
        <Route path="/transaction/:id">
          <TransactionDetails user={user} />
        </Route>
        <Route path="/profile">
          <Profile user={user} />
        </Route>
        <Route path="/topup">
          <TopUp user={user} />
        </Route>
        <Route path="/">
          <Home user={user} />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    );
  };

  return (
    <div className={`max-w-lg mx-auto bg-gray-100 min-h-screen shadow-lg ${location !== '/' ? 'pt-[20px]' : ''}`}>
      {user && (
        <>
          {/* Показывать шапку только на главной странице */}
          {location === '/' && (
            <AppHeader user={user} onNavigate={(path) => setLocation(path)} />
          )}
          
          <main>
            {renderContent()}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
