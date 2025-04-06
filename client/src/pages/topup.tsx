import { useState } from 'react';
import { User } from '@shared/schema';
import TopUpModal from '@/components/modals/top-up-modal';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface TopUpProps {
  user: User;
}

export default function TopUp({ user }: TopUpProps) {
  const [showTopUpModal, setShowTopUpModal] = useState(true);
  const [, setLocation] = useLocation();
  
  return (
    <div className="pb-6">
      {/* Заголовок страницы с кнопкой назад */}
      <div className="bg-white p-4 mb-4 flex items-center">
        <button
          onClick={() => setLocation('/')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Пополнить</h1>
        
        {/* Отображение баланса */}
        <div className="ml-auto text-right">
          <div className="text-lg font-semibold">{user.balance.toFixed(2)} USDT</div>
          <div className="text-xs text-gray-500">Баланс</div>
        </div>
      </div>
      
      <div className="px-4">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">ПОПОЛНЕНИЕ БАЛАНСА</h2>
          
          <p className="text-gray-600 mb-8">
            Укажите сумму пополнения и выберите способ оплаты.
          </p>
          
          <button 
            className="w-full py-3 bg-blue-500 text-white rounded-md font-medium shadow-sm"
            onClick={() => setShowTopUpModal(true)}
          >
            Открыть форму пополнения
          </button>
        </div>
      </div>
      
      {/* Modal */}
      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)} 
        userId={user.id}
      />
    </div>
  );
}