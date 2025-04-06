import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTelegramUser } from "./lib/telegramWebApp";
import { User } from "@shared/schema";
import { apiRequest } from "./lib/queryClient";

import Home from "@/pages/home";
import Services from "@/pages/services";
import Transactions from "@/pages/transactions";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { useToast } from "@/hooks/use-toast";

import AppHeader from "@/components/layout/app-header";

function App() {
  const [, setLocation] = useLocation();
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

  return (
    <div className="max-w-lg mx-auto bg-gray-100 min-h-screen shadow-lg">
      {user && (
        <>
          <AppHeader user={user} onNavigate={(path) => setLocation(path)} />
          
          <main>
            <Switch>
              <Route path="/" component={() => <Home user={user} />} />
              <Route path="/services" component={() => <Services user={user} />} />
              <Route path="/transactions" component={() => <Transactions user={user} />} />
              <Route path="/profile" component={() => <Profile user={user} />} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
