import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Transaction, User, Service, IpCheck } from '@shared/schema';
import { ArrowLeft, Calendar, CreditCard, Info, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { generateIpReportDownload, downloadIpReport } from '@/lib/ipService';
import ipSearchIcon from '../assets/ip_check_icon.png';
import phoneIcon from '../assets/phone_check_icon.png';
import topupIcon from '../assets/topup_icon.png';

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
  const [isReportOpen, setIsReportOpen] = useState(false);
  
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
    
    // Подготавливаем данные для отчета
    const ipCheckForReport = {
      ipCheck: {
        ...ipCheck,
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
    
    // Генерируем текст отчета
    const reportText = `
IP CHECK REPORT
=======================

IP Address: ${ipCheck.ipAddress}
Country: ${ipCheck.country || 'Unknown'}
City: ${ipCheck.city || 'Unknown'}
ISP/Organization: ${ipCheck.isp || 'Unknown'}
Check Date: ${format(new Date(transaction.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}

SECURITY CHECKS
=======================
Blacklisted: ${ipCheck.isBlacklisted ? 'YES (RISKY)' : 'NO (CLEAN)'}
Spam reports: ${ipCheck.isSpam ? 'YES (RISKY)' : 'NO (CLEAN)'}

ADDITIONAL DETAILS
=======================
${ipCheck.details && typeof ipCheck.details === 'object' 
  ? Object.entries(ipCheck.details)
    .filter(([key]) => !['ip', 'country_name', 'city', 'org'].includes(key))
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  : 'No additional details'}

Transaction ID: ${transactionId}
Report ID: ${ipCheck.id}
Generated by CryptoWallet Telegram Mini App
`;

    // Используем улучшенную функцию скачивания для всех устройств
    downloadIpReport(ipCheck, reportText);
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
              {isIncome ? (
                <img src={topupIcon} alt="Top Up" className="w-14 h-14 mr-3" />
              ) : transaction.description.includes('IP') ? (
                <img src={ipSearchIcon} alt="IP Check" className="w-14 h-14 mr-3" />
              ) : transaction.description.includes('телефон') ? (
                <img src={phoneIcon} alt="Phone Check" className="w-14 h-14 mr-3" />
              ) : (
                <span className="material-icons mr-3 text-gray-500 text-2xl">shopping_cart</span>
              )}
              <div>
                <h2 className="text-lg font-medium">{transaction.description}</h2>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                {isIncome ? '+' : '-'}{transaction.amount.toFixed(2)} ₮
              </div>
            </div>
          </div>
          
          {/* Разделительная линия после стоимости */}
          <div className="mt-4 border-b border-gray-200"></div>
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
            <Collapsible
              open={isReportOpen}
              onOpenChange={setIsReportOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline"
                  className="w-full flex justify-between"
                >
                  <div className="flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    <span>Подробный отчет</span>
                  </div>
                  {isReportOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 p-4 border rounded-md bg-gray-50 text-sm">
                <pre className="whitespace-pre-wrap">
                {`IP CHECK REPORT
=======================

IP Address: ${ipCheck.ipAddress}
Country: ${ipCheck.country || 'Unknown'}
City: ${ipCheck.city || 'Unknown'}
ISP/Organization: ${ipCheck.isp || 'Unknown'}
Check Date: ${format(new Date(transaction.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}

SECURITY CHECKS
=======================
Blacklisted: ${ipCheck.isBlacklisted ? 'YES (RISKY)' : 'NO (CLEAN)'}
Spam reports: ${ipCheck.isSpam ? 'YES (RISKY)' : 'NO (CLEAN)'}

ADDITIONAL DETAILS
=======================
${ipCheck.details && typeof ipCheck.details === 'object' 
  ? Object.entries(ipCheck.details)
    .filter(([key]) => !['ip', 'country_name', 'city', 'org'].includes(key))
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
  : 'No additional details'}

Transaction ID: ${transactionId}
Report ID: ${ipCheck.id}
Generated by CryptoWallet Telegram Mini App`}
                </pre>
                <Button 
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={handleDownloadReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Скачать отчет
                </Button>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}