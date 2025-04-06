import { useQuery } from '@tanstack/react-query';
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

  // Fetch transactions
  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transactions?userId=${user.id}`);
      return await response.json();
    },
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
      {/* Заголовок страницы */}
      <div className="bg-white p-4 mb-4 flex items-center">
        <h1 className="text-xl font-bold">История</h1>
        
        {/* Отображение баланса */}
        <div className="ml-auto text-right">
          <div className="text-lg font-semibold">{user.balance.toFixed(2)} USDT</div>
          <div className="text-xs text-gray-500">Баланс</div>
        </div>
      </div>
      
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
        
        {/* Export Button */}
        {transactions.length > 0 && (
          <button 
            className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            onClick={() => {
              // Generate a CSV of transactions
              const headers = "ID,Тип,Сумма,Описание,Дата\n";
              const csvContent = transactions.reduce((acc, t) => {
                const date = new Date(t.createdAt).toLocaleString('ru-RU');
                const amount = t.type === 'topup' ? `+${t.amount}` : `-${t.amount}`;
                return acc + `${t.id},${t.type},${amount},${t.description},${date}\n`;
              }, headers);
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'transactions.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Экспорт истории
          </button>
        )}
      </div>
    </div>
  );
}
