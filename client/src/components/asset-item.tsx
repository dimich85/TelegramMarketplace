import React from 'react';
import { Service } from '@shared/schema';
import { Wifi } from 'lucide-react';
import ipSearchIcon from '../assets/ip_search_icon.png';

interface AssetItemProps {
  service: Service;
  onSelect: () => void;
}

export default function AssetItem({ service, onSelect }: AssetItemProps) {
  // Определить иконку в зависимости от типа услуги
  const getIcon = () => {
    if (service.name === 'Проверка IP адреса') {
      return (
        <img src={ipSearchIcon} alt="IP Check" className="w-12 h-12" />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
        <Wifi size={20} color="white" />
      </div>
    );
  };

  return (
    <div 
      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center">
        {getIcon()}
        <div className="ml-3">
          <h3 className="font-medium">{service.name}</h3>
          <div className="text-sm text-gray-500">
            {service.price.toFixed(2)} USDT
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-base font-medium">1 шт.</div>
        <div className="text-sm text-gray-400">0₽</div>
      </div>
    </div>
  );
}