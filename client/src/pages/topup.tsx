import { useState } from 'react';
import { User } from '@shared/schema';
import TopUpModal from '@/components/modals/top-up-modal';

interface TopUpProps {
  user: User;
}

export default function TopUp({ user }: TopUpProps) {
  const [showTopUpModal, setShowTopUpModal] = useState(true);
  
  return (
    <div className="pb-6">
      <div className="bg-white p-4 text-center">
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
      
      {/* Modal */}
      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)} 
        userId={user.id}
      />
    </div>
  );
}