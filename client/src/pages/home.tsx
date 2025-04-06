import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Service, Transaction } from '@shared/schema';
import AssetItem from '@/components/asset-item';
import IpCheckerModal from '@/components/modals/ip-checker-modal';
import TopUpModal from '@/components/modals/top-up-modal';
import { apiRequest } from '@/lib/queryClient';
import { EyeOff } from 'lucide-react';

interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showIpCheckerModal, setShowIpCheckerModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/transactions?userId=${user.id}`);
      return await response.json();
    },
  });

  const handleTopUp = () => {
    setShowTopUpModal(true);
  };

  const handleBuyService = (serviceId: number) => {
    // If it's the IP checking service, open the modal
    const service = services.find(s => s.id === serviceId);
    if (service && service.name.includes('IP')) {
      setSelectedServiceId(serviceId);
      setShowIpCheckerModal(true);
    } else {
      // Otherwise, proceed with direct purchase
      // This would be implemented for the VPN service
      console.log('Buy service', serviceId);
    }
  };

  return (
    <div className="pb-6">
      {/* Services section */}
      <div className="bg-white">
        <div className="px-4 py-3 text-center border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-700">УСЛУГИ</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {services.map(service => (
            <AssetItem 
              key={service.id}
              service={service}
              onSelect={() => handleBuyService(service.id)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)} 
        userId={user.id}
      />
      
      <IpCheckerModal 
        isOpen={showIpCheckerModal} 
        onClose={() => setShowIpCheckerModal(false)}
        userId={user.id}
        serviceId={selectedServiceId}
      />
    </div>
  );
}
