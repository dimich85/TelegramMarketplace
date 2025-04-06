import { User } from '@shared/schema';
import { ShoppingBag, PlusCircle, History, UserCircle } from 'lucide-react';
import { useLocation } from 'wouter';

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
            {/* USDT Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#26A17B"/>
              <path d="M11.25 14.75V16.25H12.75V14.75H14.25V13.25H9.75V14.75H11.25ZM12 7.75C10.48 7.75 9.25 8.98 9.25 10.5H10.75C10.75 9.81 11.31 9.25 12 9.25C12.69 9.25 13.25 9.81 13.25 10.5C13.25 11.19 12.69 11.75 12 11.75V13.25C13.52 13.25 14.75 12.02 14.75 10.5C14.75 8.98 13.52 7.75 12 7.75Z" fill="#26A17B"/>
            </svg>
          </span>
        </div>
        <div className="text-sm text-gray-500">Баланс в USDT</div>
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