import { User, IpCheck } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { closeWebApp } from "@/lib/telegramWebApp";
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Fetch user's IP checks history
  const { data: ipChecks = [] } = useQuery<IpCheck[]>({
    queryKey: ['/api/ip/history'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/ip/history?userId=${user.id}`);
        return await response.json();
      } catch (error) {
        // Return empty array if endpoint is not implemented yet
        return [];
      }
    },
  });

  const handleLogout = () => {
    // Clear cache and close app
    queryClient.clear();
    toast({
      title: "Выход из приложения",
      description: "Вы успешно вышли из приложения",
    });
    setTimeout(() => {
      closeWebApp();
    }, 1500);
  };

  return (
    <div className="pb-6">
      {/* Заголовок страницы */}
      <div className="bg-white p-4 mb-4 flex items-center">
        <h1 className="text-xl font-bold">Профиль</h1>
        
        {/* Отображение баланса */}
        <div className="ml-auto text-right">
          <div className="text-lg font-semibold">{user.balance.toFixed(2)} USDT</div>
          <div className="text-xs text-gray-500">Баланс</div>
        </div>
      </div>
      
      <div className="px-4 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-4">
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user.firstName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-blue-500">{user.firstName.charAt(0)}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                {user.username && <p className="text-gray-500">@{user.username}</p>}
              </div>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">ID пользователя:</div>
                <div>{user.id}</div>
                
                <div className="text-gray-500">Telegram ID:</div>
                <div>{user.telegramId}</div>
                
                <div className="text-gray-500">Текущий баланс:</div>
                <div className="font-semibold">{user.balance.toFixed(2)} USDT</div>
                
                <div className="text-gray-500">Регистрация:</div>
                <div>{format(new Date(user.createdAt), 'dd.MM.yyyy')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {ipChecks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>История проверок IP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ipChecks.map((check: IpCheck) => (
                  <div key={check.id} className="border rounded-md p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{check.ipAddress}</span>
                      <span className="text-gray-500">
                        {format(new Date(check.createdAt), 'dd.MM.yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-700">
                      {check.country}, {check.city}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLogout}
          >
            Выйти из приложения
          </Button>
          
          <p className="mt-4 text-xs text-center text-gray-500">
            CryptoWallet Mini App v1.0.0<br />
            Powered by CryptoCloud
          </p>
        </div>
      </div>
    </div>
  );
}
