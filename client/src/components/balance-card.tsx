import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BalanceCardProps {
  balance: number;
  onTopUp: () => void;
}

export default function BalanceCard({ balance, onTopUp }: BalanceCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-md p-4 mb-5 border border-gray-200">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-700">Баланс аккаунта</h2>
          <span className="material-icons text-blue-600">account_balance_wallet</span>
        </div>
        
        <div className="flex items-baseline mt-2">
          <span className="text-3xl font-bold text-gray-800">{balance.toFixed(2)}</span>
          <span className="ml-1 text-xl text-gray-500">USDT</span>
        </div>
        
        <Button 
          className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition duration-200"
          onClick={onTopUp}
        >
          Пополнить баланс
        </Button>
        
        <div className="mt-3 text-xs text-gray-500 text-center">
          Powered by CryptoCloud
        </div>
      </CardContent>
    </Card>
  );
}
