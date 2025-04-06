import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Service } from '@shared/schema';
import ServiceCard from '@/components/service-card';
import IpCheckerModal from '@/components/modals/ip-checker-modal';

interface ServicesProps {
  user: User;
}

export default function Services({ user }: ServicesProps) {
  const [showIpCheckerModal, setShowIpCheckerModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // Fetch services
  const { data: services = [], isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
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
    <>
      <h1 className="text-2xl font-bold mb-6">Доступные услуги</h1>
      
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

      {/* IP Checker Modal */}
      <IpCheckerModal 
        isOpen={showIpCheckerModal} 
        onClose={() => setShowIpCheckerModal(false)}
        userId={user.id}
        serviceId={selectedServiceId}
      />
    </>
  );
}
