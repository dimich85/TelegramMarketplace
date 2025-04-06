import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  
  // Запрос данных о транзакции
  const { data, isLoading, error } = useQuery<TransactionDetailsResponse>({
    queryKey: ['/api/transactions', transactionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transactions/${transactionId}`);
      return await response.json();
    },
    enabled: !!transactionId,
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
    
    const downloadUrl = generateIpReportDownload({ ipCheck, userBalance: user.balance });
    
    // Create an anchor element and trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `ip_report_${ipCheck.ipAddress}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object
    URL.revokeObjectURL(downloadUrl);
  };
  
  return (
    <div className="pb-6 px-4">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          className="p-0 mr-2"
          onClick={() => navigate('/transactions')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
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
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Тип операции</h3>
              <p className="font-medium">
                {isIncome ? 'Пополнение баланса' : 'Покупка услуги'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Дата и время</h3>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <p>{formattedDate}</p>
              </div>
            </div>
            
            {isIncome && transaction.reference && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Номер платежа</h3>
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-gray-500" />
                  <p>{transaction.reference}</p>
                </div>
              </div>
            )}
            
            {!isIncome && service && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Услуга</h3>
                <div className="flex items-center">
                  <span className="material-icons mr-2 text-gray-500">
                    {service.icon}
                  </span>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* IP Check Results Section */}
            {ipCheck && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Результаты проверки IP</h3>
                
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
                  {ipCheck.details?.hostname && (
                    <div className="flex items-center">
                      <span className="material-icons text-yellow-500 mr-2">info</span>
                      <span>{ipCheck.details.hostname}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={handleDownloadReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Сохранить отчет
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/transactions')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к истории
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}