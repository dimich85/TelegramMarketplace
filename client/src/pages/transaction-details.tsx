import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Transaction, User, Service, IpCheck } from '@shared/schema';
import { ArrowLeft, Calendar, CreditCard, Info, Download } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { generateIpReportDownload } from '@/lib/ipService';

interface TransactionDetailsProps {
  user: User;
}

interface TransactionDetailsResponse {
  transaction: Transaction;
  service: Service | null;
  ipCheck: IpCheck | null;
}

export default function TransactionDetails({ user }: TransactionDetailsProps) {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/transaction/:id');
  const transactionId = params?.id;
  const queryClient = useQueryClient();
  
  // При монтировании компонента инвалидируем запросы для обновления данных во всем приложении
  useEffect(() => {
    // Инвалидировать все основные запросы для обновления данных
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
    queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/services'] });
  }, [queryClient]);
  
  // Запрос данных о транзакции
  const { data, isLoading, error } = useQuery<TransactionDetailsResponse>({
    queryKey: ['/api/transactions', transactionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transactions/${transactionId}`);
      return await response.json();
    },
    enabled: !!transactionId,
    // Перезагружаем данные при каждом показе компонента
    refetchOnMount: true,
    // Отключаем кеширование, чтобы всегда получать новые данные
    staleTime: 0
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500">Ошибка при загрузке деталей транзакции</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/transactions')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться к истории
        </Button>
      </div>
    );
  }
  
  const { transaction, service, ipCheck } = data;
  const isIncome = transaction.type === 'topup';
  const formattedDate = format(new Date(transaction.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru });
  
  const handleDownloadReport = () => {
    if (!ipCheck) return;
    
    // Преобразуем формат ipCheck для соответствия IpCheckResult
    const ipCheckForReport = {
      ipCheck: {
        ...ipCheck,
        // Преобразуем поля, чтобы они соответствовали ожидаемым типам в IpCheckResult
        country: ipCheck.country || '',
        city: ipCheck.city || '',
        isp: ipCheck.isp || '',
        isSpam: ipCheck.isSpam === null ? false : ipCheck.isSpam,
        isBlacklisted: ipCheck.isBlacklisted === null ? false : ipCheck.isBlacklisted,
        details: ipCheck.details || {},
        createdAt: typeof ipCheck.createdAt === 'string' ? ipCheck.createdAt : ipCheck.createdAt.toISOString()
      },
      userBalance: user.balance,
      transactionId: parseInt(transactionId || '0', 10)
    };
    
    const downloadUrl = generateIpReportDownload(ipCheckForReport);
    
    // Проверка если это мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Для мобильных устройств открываем файл в новом окне
      window.open(downloadUrl, '_blank');
      
      // Очистим URL-объект через некоторое время
      setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 5000);
    } else {
      // Для десктопа используем стандартное скачивание
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `ip_report_${ipCheck.ipAddress}.txt`;
      a.target = '_blank'; // Добавляем target="_blank" для открытия в новом окне
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Очистим URL-объект
      URL.revokeObjectURL(downloadUrl);
    }
  };
  
  return (
    <div className="pb-6 px-4">
      <div className="mb-4 text-center">
        <h1 className="text-xl font-semibold">Детали транзакции</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="material-icons mr-3 text-gray-500 text-2xl">
                {isIncome ? 'payment' : 'receipt_long'}
              </span>
              <div>
                <h2 className="text-lg font-medium">{transaction.description}</h2>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
            <div>
              <Badge variant={isIncome ? 'default' : 'outline'} className={isIncome ? 'bg-green-500 hover:bg-green-600' : 'text-red-500 border-red-500'}>
                {isIncome ? '+' : '-'}{transaction.amount.toFixed(2)} ₮
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* IP Check Results Section */}
            {ipCheck && (
              <div>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">IP адрес:</div>
                    <div className="font-medium">{ipCheck.ipAddress}</div>
                    
                    <div className="text-gray-600">Страна:</div>
                    <div className="font-medium">{ipCheck.country || 'Не определено'}</div>
                    
                    <div className="text-gray-600">Город:</div>
                    <div className="font-medium">{ipCheck.city || 'Не определено'}</div>
                    
                    <div className="text-gray-600">Хостинг/ISP:</div>
                    <div className="font-medium">{ipCheck.isp || 'Не определено'}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className={`material-icons mr-2 ${ipCheck.isBlacklisted ? 'text-red-500' : 'text-green-500'}`}>
                      {ipCheck.isBlacklisted ? 'error' : 'check_circle'}
                    </span>
                    <span>
                      {ipCheck.isBlacklisted ? 'Обнаружен в блэклистах' : 'Отсутствует в блэклистах'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`material-icons mr-2 ${ipCheck.isSpam ? 'text-red-500' : 'text-green-500'}`}>
                      {ipCheck.isSpam ? 'error' : 'check_circle'}
                    </span>
                    <span>
                      {ipCheck.isSpam ? 'Обнаружен в спам-базах' : 'Не обнаружен в спам-базах'}
                    </span>
                  </div>
                  {(() => {
                    if (ipCheck.details && 
                       typeof ipCheck.details === 'object' && 
                       ipCheck.details !== null) {
                      const details = ipCheck.details as Record<string, unknown>;
                      if ('hostname' in details && typeof details.hostname === 'string') {
                        return (
                          <div className="flex items-center">
                            <span className="material-icons text-yellow-500 mr-2">info</span>
                            <span>{details.hostname}</span>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          {ipCheck && (
            <Button 
              variant="outline"
              className="w-full"
              onClick={handleDownloadReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Сохранить подробный отчет
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}