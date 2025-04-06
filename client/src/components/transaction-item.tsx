import { Transaction } from '@shared/schema';
import { format } from 'date-fns';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncome = transaction.type === 'topup';
  const formattedDate = format(new Date(transaction.createdAt), 'dd.MM.yyyy, HH:mm');
  
  return (
    <div className="py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <span className="material-icons mr-3 text-gray-500">
          {isIncome ? 'payment' : 'receipt_long'}
        </span>
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
      <span className={`font-semibold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{transaction.amount.toFixed(2)} USDT
      </span>
    </div>
  );
}
