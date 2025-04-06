import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Transaction } from '@shared/schema';
import TransactionItem from '@/components/transaction-item';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface TransactionsProps {
  user: User;
}

export default function Transactions({ user }: TransactionsProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // При монтировании компонента инвалидируем запросы для обновления данных во всем приложении
  useEffect(() => {
    // Инвалидировать все основные запросы для обновления данных
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
    queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/services'] });
  }, [queryClient]);

  // Fetch transactions
  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transactions?userId=${user.id}`);
      return await response.json();
    },
    // Перезагружаем данные при каждом показе компонента
    refetchOnMount: true,
    // Отключаем кеширование, чтобы всегда получать новые данные
    staleTime: 0
  });

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const dateKey = format(date, 'dd.MM.yyyy');
    
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    
    groupedTransactions[dateKey].push(transaction);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500">Ошибка при загрузке истории транзакций</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      
      <div className="px-4">
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
            <div key={dateKey} className="mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-2">{dateKey}</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
                {dateTransactions.map(transaction => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">У вас пока нет транзакций</p>
          </div>
        )}
        
        {/* Removed export button as per request */}
      </div>
    </div>
  );
}
