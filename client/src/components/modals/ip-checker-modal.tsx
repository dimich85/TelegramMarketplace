import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { checkIpAddress, isValidIpAddress, generateIpReportDownload, IpCheckResult } from '@/lib/ipService';
import { queryClient } from '@/lib/queryClient';
import { Clipboard } from 'lucide-react';

interface IpCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  serviceId: number | null;
}

export default function IpCheckerModal({ 
  isOpen, 
  onClose,
  userId,
  serviceId
}: IpCheckerModalProps) {
  const [ipAddress, setIpAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ipCheckResult, setIpCheckResult] = useState<IpCheckResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleIpCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidIpAddress(ipAddress)) {
      toast({
        title: "Неверный формат",
        description: "Пожалуйста, введите корректный IP адрес",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await checkIpAddress(ipAddress, userId);
      setIpCheckResult(result);
      
      // Invalidate balance query to reflect the purchase
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      toast({
        title: "Проверка выполнена",
        description: "IP адрес успешно проверен",
      });
    } catch (error) {
      toast({
        title: "Ошибка проверки",
        description: error instanceof Error ? error.message : "Не удалось проверить IP адрес",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Функция валидации ввода (только цифры и точки)
  const handleIpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Заменяем все символы, кроме цифр и точек
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setIpAddress(sanitizedValue);
  };
  
  // Функция вставки из буфера обмена
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Проверяем, содержит ли текст правильный формат IP
      const ipRegex = /^[\d.]+$/;
      if (!ipRegex.test(text)) {
        toast({
          title: "Неверный формат",
          description: "Скопированный текст не содержит корректный IP адрес (только цифры и точки)",
          variant: "destructive",
        });
        return;
      }
      
      // Устанавливаем значение и фокусируемся на поле ввода
      setIpAddress(text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      toast({
        title: "Ошибка вставки",
        description: "Не удалось получить доступ к буферу обмена",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveReport = () => {
    if (!ipCheckResult) return;
    
    const downloadUrl = generateIpReportDownload(ipCheckResult);
    
    // Create an anchor element and trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `ip_report_${ipCheckResult.ipCheck.ipAddress}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object
    URL.revokeObjectURL(downloadUrl);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md fixed top-[160px] max-h-[calc(100vh-220px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Проверка IP адреса</DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <p className="text-sm text-gray-600 mb-4">
            Введите IP адрес для проверки на спам, блэклисты и определения геоданных
          </p>
          
          <form onSubmit={handleIpCheck}>
            <div className="mb-4">
              <Label htmlFor="ipAddress" className="block text-sm font-medium text-gray-700 mb-1">
                IP адрес
              </Label>
              <div className="flex">
                <Input 
                  type="text" 
                  id="ipAddress" 
                  placeholder="Например: 8.8.8.8"
                  value={ipAddress}
                  onChange={handleIpInputChange}
                  ref={inputRef}
                  required
                  className="rounded-r-none"
                />
                <Button
                  type="button"
                  onClick={handlePaste}
                  className="rounded-l-none px-3"
                  variant="outline"
                  title="Вставить из буфера обмена"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Допускаются только цифры и точки
              </p>
            </div>
            
            <Button 
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Проверка..." : "Проверить"}
            </Button>
          </form>
          
          {/* Results section */}
          {ipCheckResult && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Результаты проверки:</h4>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">IP адрес:</div>
                  <div className="font-medium">{ipCheckResult.ipCheck.ipAddress}</div>
                  
                  <div className="text-gray-600">Страна:</div>
                  <div className="font-medium">{ipCheckResult.ipCheck.country || 'Не определено'}</div>
                  
                  <div className="text-gray-600">Город:</div>
                  <div className="font-medium">{ipCheckResult.ipCheck.city || 'Не определено'}</div>
                  
                  <div className="text-gray-600">Хостинг/ISP:</div>
                  <div className="font-medium">{ipCheckResult.ipCheck.isp || 'Не определено'}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className={`material-icons mr-2 ${ipCheckResult.ipCheck.isBlacklisted ? 'text-red-500' : 'text-green-500'}`}>
                    {ipCheckResult.ipCheck.isBlacklisted ? 'error' : 'check_circle'}
                  </span>
                  <span>
                    {ipCheckResult.ipCheck.isBlacklisted ? 'Обнаружен в блэклистах' : 'Отсутствует в блэклистах'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className={`material-icons mr-2 ${ipCheckResult.ipCheck.isSpam ? 'text-red-500' : 'text-green-500'}`}>
                    {ipCheckResult.ipCheck.isSpam ? 'error' : 'check_circle'}
                  </span>
                  <span>
                    {ipCheckResult.ipCheck.isSpam ? 'Обнаружен в спам-базах' : 'Не обнаружен в спам-базах'}
                  </span>
                </div>
                {ipCheckResult.ipCheck.details?.hostname && (
                  <div className="flex items-center">
                    <span className="material-icons text-yellow-500 mr-2">info</span>
                    <span>{ipCheckResult.ipCheck.details.hostname}</span>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline"
                className="mt-4 w-full"
                onClick={handleSaveReport}
              >
                Сохранить отчет
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
