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

import Header from "@/components/layout/header";
import NavigationBar from "@/components/layout/navigation-bar";

function App() {
  const [, setLocation] = useLocation();
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const { toast } = useToast();

  // Get Telegram user info
  useEffect(() => {
    const user = getTelegramUser();
    if (user) {
      setTelegramUser(user);
    } else {
      toast({
        title: "Ошибка аутентификации",
        description: "Приложение должно быть открыто из Telegram",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Authenticate user with server
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth'],
    queryFn: async () => {
      if (!telegramUser) return null;
      
      const initData = window.Telegram?.WebApp?.initData || '';
      const response = await apiRequest('POST', '/api/auth', { initData });
      return await response.json();
    },
    enabled: !!telegramUser,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-telegram-light">
        <div className="animate-spin h-10 w-10 border-4 border-telegram-blue rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error || (!isLoading && !user && telegramUser)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-telegram-light p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Ошибка аутентификации</h1>
        <p className="text-center text-gray-700">
          Не удалось аутентифицировать пользователя. Пожалуйста, попробуйте еще раз.
        </p>
        <button 
          className="mt-4 px-4 py-2 bg-telegram-blue text-white rounded"
          onClick={() => window.location.reload()}
        >
          Обновить
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen shadow-lg">
      {user && (
        <>
          <Header user={user} />
          
          <main className="p-4 pb-20">
            <Switch>
              <Route path="/" component={() => <Home user={user} />} />
              <Route path="/services" component={() => <Services user={user} />} />
              <Route path="/transactions" component={() => <Transactions user={user} />} />
              <Route path="/profile" component={() => <Profile user={user} />} />
              <Route component={NotFound} />
            </Switch>
          </main>
          
          <NavigationBar onNavigate={(path) => setLocation(path)} />
        </>
      )}
    </div>
  );
}

export default App;
