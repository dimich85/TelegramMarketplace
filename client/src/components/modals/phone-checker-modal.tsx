import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight } from "lucide-react";
import phoneCheckIcon from "../../assets/phone_check_icon.png";

interface PhoneCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  serviceId: number | null;
}

// Интерфейс результата проверки телефона
interface PhoneCheckResult {
  phoneCheck: {
    id: number;
    userId: number;
    phoneNumber: string;
    country: string;
    operator: string;
    isActive: boolean;
    isSpam: boolean;
    isVirtual: boolean;
    fraudScore: number;
    details: any;
    createdAt: string;
  };
  userBalance: number;
  transactionId: number;
}

/**
 * Проверяет, является ли ввод корректным телефонным номером
 * @param input Строка ввода
 * @returns Булево значение валидности формата телефона
 */
function isPhoneInputValid(input: string): boolean {
  // Разрешаем только цифры, "+", "-", пробелы и скобки
  return /^[\d\s\-\+\(\)]*$/.test(input);
}

/**
 * Форматирует ввод номера телефона, удаляя недопустимые символы
 * @param input Строка ввода
 * @returns Отформатированная строка
 */
function formatPhoneInput(input: string): string {
  // Удаляем все, кроме цифр, "+", "-", пробелов и скобок
  return input.replace(/[^\d\s\-\+\(\)]/g, '');
}

/**
 * Генерирует текстовый отчет для скачивания
 * @param result Результат проверки телефона
 * @returns Текст отчета
 */
function generatePhoneReportText(result: PhoneCheckResult): string {
  const { phoneCheck } = result;
  const timestamp = new Date(phoneCheck.createdAt).toLocaleString();
  
  return `ОТЧЕТ О ПРОВЕРКЕ НОМЕРА ТЕЛЕФОНА
========================================
Номер: ${phoneCheck.phoneNumber}
Дата проверки: ${timestamp}
ID транзакции: ${result.transactionId}
========================================

ОСНОВНАЯ ИНФОРМАЦИЯ:
• Страна: ${phoneCheck.country || 'Не определена'}
• Оператор: ${phoneCheck.operator || 'Не определен'}
• Активен: ${phoneCheck.isActive ? 'Да' : 'Нет'}
• Виртуальный номер: ${phoneCheck.isVirtual ? 'Да' : 'Нет'}
• Спам/Мошенничество: ${phoneCheck.isSpam ? 'Да' : 'Нет'}
• Риск мошенничества: ${phoneCheck.fraudScore}/100

========================================

Отчет сгенерирован: ${new Date().toLocaleString()}
(c) CryptoCloud IP Check Service`;
}

/**
 * Скачивает отчет о проверке телефона
 * @param phoneCheck Данные о проверке телефона
 * @param reportText Текст отчета
 */
function downloadPhoneReport(phoneCheck: { phoneNumber: string }, reportText: string): void {
  // Создаем элемент для скачивания
  const element = document.createElement("a");
  const file = new Blob([reportText], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `phone_check_${phoneCheck.phoneNumber.replace(/\D/g, '')}_${Date.now()}.txt`;
  document.body.appendChild(element);
  element.click();
  
  // Очищаем ресурсы
  setTimeout(() => {
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  }, 100);
}

export default function PhoneCheckerModal({ 
  isOpen, 
  onClose, 
  userId,
  serviceId
}: PhoneCheckerModalProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<PhoneCheckResult | null>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Обработчик изменения ввода номера телефона
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (isPhoneInputValid(input)) {
      setPhoneNumber(input);
    }
  };

  // Очистка формы
  const resetForm = () => {
    setPhoneNumber('');
    setCheckResult(null);
  };

  // Обработчик закрытия модального окна
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Обработчик вставки из буфера обмена
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const formattedPhone = formatPhoneInput(text);
      if (formattedPhone) {
        setPhoneNumber(formattedPhone);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Ошибка доступа к буферу обмена",
        description: "Не удалось получить доступ к буферу обмена. Вставьте номер вручную.",
      });
    }
  }, [toast]);

  // Функция проверки номера телефона через API
  const checkPhoneNumber = async () => {
    if (!phoneNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите номер телефона для проверки",
      });
      return;
    }

    try {
      setIsChecking(true);

      // Вызов реального API для проверки номера телефона
      const response = await fetch('/api/phone/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          userId: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при проверке номера');
      }

      const data = await response.json();
      const { phoneCheck, userBalance, transactionId } = data;
      
      // Закрываем модальное окно
      handleClose();
      
      // Показываем уведомление об успехе
      toast({
        title: "Проверка выполнена",
        description: "Номер телефона успешно проверен 🎉",
      });
      
      // Переходим на страницу деталей транзакции
      navigate(`/transaction/${transactionId}`);
      
    } catch (error) {
      console.error('Ошибка при проверке номера телефона:', error);
      toast({
        variant: "destructive",
        title: "Ошибка проверки",
        description: error instanceof Error ? error.message : "Не удалось проверить номер телефона. Попробуйте позже."
      });
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] fixed top-[230px] max-h-[calc(100vh-290px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={phoneCheckIcon} alt="Phone Check" className="w-12 h-12" />
            Проверка номера телефона
          </DialogTitle>
        </DialogHeader>
        
        {!checkResult ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Проверка виртуального и резидентного номера телефона на спам и мошенничество.
                Отчет формируется на основе запроса к популярным системам защиты от мошенничества. Это позволяет предотвратить блокировку по номеру телефона при работе с популярными онлайн-сервисами.
              </p>
              <Label htmlFor="phone-number">Введите номер телефона:</Label>
              <div className="flex space-x-2">
                <Input
                  id="phone-number"
                  ref={inputRef}
                  placeholder=""
                  value={phoneNumber}
                  onChange={handlePhoneInputChange}
                  className="flex-1"
                  inputMode="tel"
                  onKeyPress={(e) => {
                    // Разрешаем только цифры и точку
                    const char = String.fromCharCode(e.charCode);
                    if (!/[0-9+]/.test(char)) {
                      e.preventDefault();
                    }
                  }}
                />
                <Button variant="outline" onClick={handlePaste} type="button">
                  <Icons.paste className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Формат: с кодом страны (например, +48123456789)
              </p>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                onClick={checkPhoneNumber} 
                disabled={isChecking || !phoneNumber.trim()}
                className="w-full"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>Проверить</>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Номер телефона</h3>
                <Badge>{checkResult.phoneCheck.phoneNumber}</Badge>
              </div>
              
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Страна:</span>
                  <span className="text-sm font-medium">{checkResult.phoneCheck.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Оператор:</span>
                  <span className="text-sm font-medium">{checkResult.phoneCheck.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Активен:</span>
                  <span className="text-sm font-medium">
                    {checkResult.phoneCheck.isActive ? 'Да' : 'Нет'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Виртуальный номер:</span>
                  <span className="text-sm font-medium">
                    {checkResult.phoneCheck.isVirtual ? 'Да' : 'Нет'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Спам/Мошенничество:</span>
                  <span className="text-sm font-medium">
                    {checkResult.phoneCheck.isSpam ? 'Да' : 'Нет'}
                  </span>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="mt-2">
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">Риск мошенничества:</span>
                  <span 
                    className={`text-sm font-semibold ${
                      checkResult.phoneCheck.fraudScore < 30 
                        ? 'text-green-500' 
                        : checkResult.phoneCheck.fraudScore < 70 
                          ? 'text-amber-500' 
                          : 'text-red-500'
                    }`}
                  >
                    {checkResult.phoneCheck.fraudScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      checkResult.phoneCheck.fraudScore < 30 
                        ? 'bg-green-500' 
                        : checkResult.phoneCheck.fraudScore < 70 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                    }`} 
                    style={{ width: `${checkResult.phoneCheck.fraudScore}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  const reportText = generatePhoneReportText(checkResult);
                  downloadPhoneReport(
                    { phoneNumber: checkResult.phoneCheck.phoneNumber }, 
                    reportText
                  );
                }}
              >
                <Icons.download className="mr-2 h-4 w-4" />
                Скачать отчет
              </Button>
              
              <Button 
                onClick={() => {
                  handleClose();
                  if (checkResult.transactionId) {
                    navigate(`/transaction/${checkResult.transactionId}`);
                  }
                }}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                Детали транзакции
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}