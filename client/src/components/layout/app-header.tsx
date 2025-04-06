import { User } from '@shared/schema';
import { Trophy, Settings, ArrowUpCircle, RefreshCcw, Search, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

interface AppHeaderProps {
  user: User;
  onNavigate: (path: string) => void;
}

export default function AppHeader({ user, onNavigate }: AppHeaderProps) {
  const [location] = useLocation();
  
  return (
    <header className="bg-gray-100 px-4 pt-2 pb-4">
      {/* App title and menu */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <button 
            className="text-gray-500 mr-2 text-sm" 
            onClick={() => window.history.back()}
          >
            Закрыть
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold">CryptoWallet</h1>
            <p className="text-xs text-gray-500">мини-приложение</p>
          </div>
        </div>
        <button className="text-gray-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      {/* Balance display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-1">
          <span className="text-3xl font-semibold">{user.balance.toFixed(2)}</span>
          <span className="ml-1 text-gray-500 flex items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C7.582 3 4 6.582 4 11c0 4.418 3.582 8 8 8s8-3.582 8-8c0-4.418-3.582-8-8-8zm0 2c3.314 0 6 2.686 6 6 0 3.314-2.686 6-6 6-3.314 0-6-2.686-6-6 0-3.314 2.686-6 6-6z" fill="currentColor"/>
              <path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 2c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z" fill="currentColor"/>
            </svg>
          </span>
        </div>
        <div className="text-sm text-gray-500">Общий баланс в USDT</div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/')}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white">
            <ArrowUpCircle size={24} />
          </div>
          <span className="text-xs text-blue-500">Пополнить</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/profile')}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white">
            <RefreshCcw size={24} />
          </div>
          <span className="text-xs text-blue-500">Вывести</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/services')}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white">
            <ExternalLink size={24} />
          </div>
          <span className="text-xs text-blue-500">Обмен</span>
        </button>
        
        <button 
          className="flex flex-col items-center"
          onClick={() => onNavigate('/transactions')}
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 mb-1 flex items-center justify-center text-white">
            <Search size={24} />
          </div>
          <span className="text-xs text-blue-500">Биржа</span>
        </button>
      </div>
    </header>
  );
}