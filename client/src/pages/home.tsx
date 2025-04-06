import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Service, Transaction } from '@shared/schema';
import BalanceCard from '@/components/balance-card';
import ServiceCard from '@/components/service-card';
import TransactionItem from '@/components/transaction-item';
import IpCheckerModal from '@/components/modals/ip-checker-modal';
import TopUpModal from '@/components/modals/top-up-modal';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

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
    <>
      <BalanceCard 
        balance={user.balance} 
        onTopUp={handleTopUp} 
      />
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Услуги</h2>
        
        <div className="space-y-4">
          {services.map(service => (
            <ServiceCard 
              key={service.id}
              service={service}
              onBuy={() => handleBuyService(service.id)}
              userBalance={user.balance}
            />
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">История</h2>
          <Link 
            to="/transactions"
            className="text-sm text-blue-600 flex items-center"
          >
            Все <span className="material-icons text-sm ml-1">chevron_right</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
          {transactions.length > 0 ? (
            transactions.slice(0, 3).map(transaction => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="py-6 px-4 text-center">
              <p className="text-gray-500">У вас пока нет транзакций</p>
            </div>
          )}
        </div>
      </section>

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
    </>
  );
}
