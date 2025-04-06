import { Service } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  service: Service;
  onBuy: () => void;
  userBalance: number;
  showFullDescription?: boolean;
}

export default function ServiceCard({ 
  service, 
  onBuy,
  userBalance,
  showFullDescription = false
}: ServiceCardProps) {
  const canPurchase = userBalance >= service.price && service.available;
  
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition duration-200 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg">{service.name}</h3>
            <p className={`text-sm text-gray-600 mt-1 ${showFullDescription ? '' : 'line-clamp-2'}`}>
              {service.description}
            </p>
            <div className="mt-3 flex items-center">
              <span className="font-semibold text-gray-800">{service.price.toFixed(2)} USDT</span>
              <Badge 
                variant={service.available ? "default" : "destructive"}
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${service.available ? "bg-green-500 hover:bg-green-600" : ""}`}
              >
                {service.available ? "Доступно" : "Недоступно"}
              </Badge>
            </div>
          </div>
          <span className="material-icons text-blue-600 text-2xl">{service.icon}</span>
        </div>
        
        <Button 
          onClick={onBuy}
          disabled={!canPurchase}
          variant="outline"
          className="mt-3 w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-1.5 px-4 rounded transition duration-200 font-medium"
        >
          {canPurchase 
            ? "Купить" 
            : !service.available 
              ? "Недоступно" 
              : "Недостаточно средств"
          }
        </Button>
      </CardContent>
    </Card>
  );
}
