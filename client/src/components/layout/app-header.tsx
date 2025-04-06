import { User } from '@shared/schema';
import { ShoppingBag, PlusCircle, History, UserCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import tetherIcon from '@assets/icons8-tether-48.png';

interface AppHeaderProps {
  user: User;
  onNavigate: (path: string) => void;
}

export default function AppHeader({ user, onNavigate }: AppHeaderProps) {
  const [location] = useLocation();
  
  return (
    <header className="bg-gray-100 px-4 pb-4 pt-6">
      {/* Balance display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-1">
          <span className="text-3xl font-semibold">{user.balance.toFixed(2)}</span>
          <span className="ml-1 text-gray-700 flex items-center">
            {/* Tether symbol */}
            <span className="text-2xl font-semibold">₮</span>
          </span>
        </div>
        <div className="text-sm text-gray-500">Баланс в ₮</div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/')}
        >
          <div className="w-14 h-14 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white shadow-md">
            <ShoppingBag size={28} strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-blue-500">Услуги</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/topup')}
        >
          <div className="w-14 h-14 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white shadow-md">
            <PlusCircle size={28} strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-blue-500">Пополнить</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/transactions')}
        >
          <div className="w-14 h-14 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white shadow-md">
            <History size={28} strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-blue-500">История</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/profile')}
        >
          <div className="w-14 h-14 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white shadow-md">
            <UserCircle size={28} strokeWidth={2} />
          </div>
          <span className="text-xs font-bold text-blue-500">Профиль</span>
        </button>
      </div>
    </header>
  );
}