import { useState } from 'react';
import { useLocation } from 'wouter';

interface NavigationBarProps {
  onNavigate: (path: string) => void;
}

export default function NavigationBar({ onNavigate }: NavigationBarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: 'Главная', icon: 'home' },
    { path: '/services', label: 'Услуги', icon: 'grid_view' },
    { path: '/transactions', label: 'История', icon: 'receipt_long' },
    { path: '/profile', label: 'Профиль', icon: 'person' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 shadow-lg max-w-lg mx-auto">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button 
            key={item.path}
            className={`flex flex-col items-center ${location === item.path ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => onNavigate(item.path)}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
