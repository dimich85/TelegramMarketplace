import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Service } from '@shared/schema';
import ServiceCard from '@/components/service-card';
import IpCheckerModal from '@/components/modals/ip-checker-modal';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface ServicesProps {
  user: User;
}

export default function Services({ user }: ServicesProps) {
  const [showIpCheckerModal, setShowIpCheckerModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // При монтировании компонента инвалидируем запросы для обновления данных во всем приложении
  useEffect(() => {
    // Инвалидировать все основные запросы для обновления данных
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
    queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/services'] });
  }, [queryClient]);

  // Fetch services
  const { data: services = [], isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    // Перезагружаем данные при каждом показе компонента
    refetchOnMount: true,
    // Отключаем кеширование, чтобы всегда получать новые данные
    staleTime: 0
  });

  const handleBuyService = (serviceId: number) => {
    // If it's the IP checking service, open the modal
    const service = services.find(s => s.id === serviceId);
    if (service && service.name.includes('IP')) {
      setSelectedServiceId(serviceId);
      setShowIpCheckerModal(true);
    } else {
      // Otherwise, proceed with direct purchase
      console.log('Buy service', serviceId);
    }
  };

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
        <p className="text-red-500">Ошибка при загрузке услуг</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Заголовок страницы */}
      <div className="bg-white p-4 mb-4 flex items-center">
        <h1 className="text-xl font-bold">Услуги</h1>
        
        {/* Отображение баланса */}
        <div className="ml-auto text-right">
          <div className="text-lg font-semibold">{user.balance.toFixed(2)} ₮</div>
          <div className="text-xs text-gray-500">Баланс в USDT</div>
        </div>
      </div>
      
      <div className="px-4">
        <div className="space-y-4">
          {services.map(service => (
            <ServiceCard 
              key={service.id}
              service={service}
              onBuy={() => handleBuyService(service.id)}
              userBalance={user.balance}
              showFullDescription
            />
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Услуги временно недоступны</p>
          </div>
        )}
      </div>

      {/* IP Checker Modal */}
      <IpCheckerModal 
        isOpen={showIpCheckerModal} 
        onClose={() => setShowIpCheckerModal(false)}
        userId={user.id}
        serviceId={selectedServiceId}
      />
    </div>
  );
}
