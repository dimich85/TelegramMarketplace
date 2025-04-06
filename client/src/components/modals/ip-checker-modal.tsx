import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { 
  checkIpAddress, 
  isValidIpAddress, 
  generateIpReportDownload, 
  IpCheckResult,
  formatIpInput
} from '@/lib/ipService';
import { queryClient } from '@/lib/queryClient';
import { Clipboard, Download } from 'lucide-react';

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
  const [, navigate] = useLocation();
  
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
      
      // Получаем transactionId из результата
      const transactionId = result.transactionId;
      
      // Закрываем модальное окно и перенаправляем на страницу с деталями транзакции
      onClose();
      
      // Проверяем, что транзакция действительно существует, и только потом перенаправляем
      // с ожиданием для уверенности, что данные созданы на сервере
      const checkAndNavigate = async () => {
        try {
          // Даем серверу время создать и сохранить транзакцию
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Пробуем получить транзакцию
          const response = await fetch(`/api/transactions/${transactionId}`);
          if (response.ok) {
            // Транзакция создана, можно перенаправлять
            navigate(`/transaction/${transactionId}`);
          } else {
            // Если не получилось, пробуем еще раз через секунду
            setTimeout(checkAndNavigate, 1000);
          }
        } catch (err) {
          // В случае ошибки тоже пробуем еще раз
          setTimeout(checkAndNavigate, 1000);
        }
      };
      
      checkAndNavigate();
      
      // Показываем уведомление об успешной транзакции
      toast({
        title: "✓ Выполнено",
        description: "IP адрес успешно проверен",
        variant: "default",
        duration: 2000, // 2 секунды
        className: "bg-green-50 border-green-200 text-green-800", // Салатовый фон
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
  
  // Функция валидации и форматирования ввода IP
  const handleIpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Используем новую функцию форматирования из ipService
    const formattedValue = formatIpInput(value);
    setIpAddress(formattedValue);
  };
  
  // Функция для помощи при вставке IP на мобильных устройствах
  const handlePaste = () => {
    try {
      // На мобильных устройствах невозможно программно получить доступ к буферу обмена
      // Поэтому предлагаем пользователю удобный способ вставки вручную
      
      // Фокусируемся на поле ввода
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Проверка если это мобильное устройство
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Для мобильных устройств просто показываем подсказку
        toast({
          title: "Вставьте IP адрес",
          description: "Нажмите и удерживайте поле ввода, затем выберите 'Вставить'",
          variant: "default",
        });
      } else {
        // Для десктопа используем Clipboard API
        navigator.clipboard.readText().then(text => {
          if (text) {
            // Форматируем текст
            const formattedText = formatIpInput(text);
            // Устанавливаем отформатированное значение
            setIpAddress(formattedText);
          }
        }).catch(error => {
          console.error("Clipboard error:", error);
          
          toast({
            title: "Не удалось вставить",
            description: "Пожалуйста, вставьте IP адрес вручную",
            variant: "destructive",
          });
        });
      }
    } catch (error) {
      console.error("Paste error:", error);
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
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Input 
                    type="text" 
                    id="ipAddress" 
                    placeholder="Например: 8.8.8.8"
                    value={ipAddress}
                    onChange={handleIpInputChange}
                    ref={inputRef}
                    required
                    className="rounded"
                    pattern="[0-9.]+"
                    inputMode="numeric"
                    onKeyPress={(e) => {
                      // Разрешаем только цифры и точку
                      const char = String.fromCharCode(e.charCode);
                      if (!/[0-9.]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handlePaste}
                    className="min-w-[44px] px-3"
                    variant="outline"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
                

              </div>
              <p className="text-xs text-gray-500 mt-1">
                Формат: IPv4 (например, 192.168.1.1)
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
                <Download className="w-4 h-4 mr-2" />
                Сохранить подробный отчет
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
