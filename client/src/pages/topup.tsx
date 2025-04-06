import { useState } from 'react';
import { User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createInvoice, openPaymentUrl } from '@/lib/cryptocloud';

interface TopUpProps {
  user: User;
}

export default function TopUp({ user }: TopUpProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleAmountChange = (value: string) => {
    // Only allow numeric values with up to 2 decimal places
    const regex = /^\d+(\.\d{0,2})?$/;
    if (value === '' || regex.test(value)) {
      setAmount(value);
    }
  };
  
  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue < 10) {
      toast({
        title: "Неверная сумма",
        description: "Минимальная сумма пополнения: 10 USDT",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const invoice = await createInvoice(amountValue, user.id);
      
      if (invoice.success) {
        // Open the payment URL
        openPaymentUrl(invoice.pay_url);
        
        toast({
          title: "Счет создан",
          description: "Пожалуйста, завершите оплату в открывшемся окне",
        });
      } else {
        throw new Error("Failed to create invoice");
      }
    } catch (error) {
      toast({
        title: "Ошибка создания счета",
        description: error instanceof Error ? error.message : "Не удалось создать счет на оплату",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="pb-6">
      {/* Отображение баланса */}
      <div className="bg-white p-4 mb-4 flex justify-end">
        <div className="text-right">
          <div className="text-lg font-semibold">{user.balance.toFixed(2)} USDT</div>
          <div className="text-xs text-gray-500">Баланс</div>
        </div>
      </div>
      
      <div className="px-4">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-center mb-5">Пополнение баланса</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Сумма (USDT)
              </Label>
              <Input 
                type="text" 
                id="amount" 
                placeholder="Например: 50"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Минимальная сумма пополнения: 10 USDT</p>
            </div>
            
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Быстрый выбор:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  className="py-2"
                  onClick={() => handleQuickAmount('25')}
                >
                  25 USDT
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="py-2"
                  onClick={() => handleQuickAmount('50')}
                >
                  50 USDT
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="py-2"
                  onClick={() => handleQuickAmount('100')}
                >
                  100 USDT
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Создание счета..." : "Перейти к оплате"}
            </Button>
            
            <div className="mt-3 text-xs text-center text-gray-500">
              Оплата происходит через сервис CryptoCloud.<br />
              Средства зачисляются моментально.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}