import { Transaction } from '@shared/schema';
import { format } from 'date-fns';
import { useLocation } from 'wouter';
import { ChevronRight } from 'lucide-react';
import ipSearchIcon from '../assets/ip_check_icon.png';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const [, navigate] = useLocation();
  const isIncome = transaction.type === 'topup';
  const formattedDate = format(new Date(transaction.createdAt), 'dd.MM.yyyy, HH:mm');
  
  const goToTransactionDetails = () => {
    navigate(`/transaction/${transaction.id}`);
  };
  
  return (
    <div 
      className="py-3 px-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
      onClick={goToTransactionDetails}
    >
      <div className="flex items-center">
        {isIncome ? (
          <span className="material-icons mr-3 text-gray-500">payment</span>
        ) : (
          <img src={ipSearchIcon} alt="IP Check" className="w-12 h-12 mr-3" />
        )}
        <div>
          <p className="font-medium">{transaction.description}</p>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`font-semibold mr-2 ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'}{transaction.amount.toFixed(2)} ₮
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}
