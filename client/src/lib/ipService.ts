import { apiRequest } from "./queryClient";

export interface IpCheckResult {
  ipCheck: {
    id: number;
    userId: number;
    ipAddress: string;
    country: string;
    city: string;
    isp: string;
    isSpam: boolean;
    isBlacklisted: boolean;
    details: any;
    createdAt: string;
  };
  userBalance: number;
  transactionId: number; // ID связанной транзакции
}

/**
 * Validates if a string is a valid IP address
 * @param ip IP address to validate
 * @returns Boolean indicating if IP is valid
 */
export function isValidIpAddress(ip: string): boolean {
  // IPv4 regex pattern
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 regex pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * Validates if the input string contains only digits and dots
 * @param input The input string to validate
 * @returns Boolean indicating if the string contains only digits and dots
 */
export function isIpInputValid(input: string): boolean {
  const ipInputRegex = /^[0-9.]*$/;
  return ipInputRegex.test(input);
}

/**
 * Formats an IP address input by enforcing proper formatting
 * @param input Raw input string 
 * @returns Formatted IP address string
 */
export function formatIpInput(input: string): string {
  // Remove any characters that aren't digits or dots
  let sanitized = input.replace(/[^0-9.]/g, '');
  
  // Prevent multiple consecutive dots
  sanitized = sanitized.replace(/\.{2,}/g, '.');
  
  // Ensure only 3 dots maximum
  const parts = sanitized.split('.');
  if (parts.length > 4) {
    sanitized = parts.slice(0, 4).join('.');
  }
  
  // Make sure each octet is no more than 3 digits
  const validParts = parts.map(part => {
    if (part.length > 3) {
      return part.substring(0, 3);
    }
    return part;
  });
  
  return validParts.join('.');
}

/**
 * Checks an IP address through the server API
 * @param ipAddress The IP address to check
 * @param userId The user ID
 * @returns The IP check result data
 */
export async function checkIpAddress(ipAddress: string, userId: number): Promise<IpCheckResult> {
  const response = await apiRequest('POST', '/api/ip/check', {
    ipAddress,
    userId
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to check IP address');
  }
  
  return await response.json();
}

/**
 * Converts an IP check result to a downloadable text report
 * @param result The IP check result
 * @returns A Blob URL for downloading the report
 */
export function generateIpReportDownload(result: IpCheckResult): string {
  const { ipCheck } = result;
  
  const report = `
IP CHECK REPORT
=======================

IP Address: ${ipCheck.ipAddress}
Country: ${ipCheck.country}
City: ${ipCheck.city}
ISP/Organization: ${ipCheck.isp}
Check Date: ${new Date(ipCheck.createdAt).toLocaleString()}

SECURITY CHECKS
=======================
Blacklisted: ${ipCheck.isBlacklisted ? 'YES (RISKY)' : 'NO (CLEAN)'}
Spam reports: ${ipCheck.isSpam ? 'YES (RISKY)' : 'NO (CLEAN)'}

ADDITIONAL DETAILS
=======================
${Object.entries(ipCheck.details || {})
  .filter(([key]) => !['ip', 'country_name', 'city', 'org'].includes(key))
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Report ID: ${ipCheck.id}
Generated by CryptoWallet Telegram Mini App
  `;
  
  const blob = new Blob([report], { type: 'text/plain' });
  return URL.createObjectURL(blob);
}

/**
 * Улучшенный метод для скачивания текстового отчета на мобильных устройствах
 * @param ipCheck Данные о проверке IP адреса
 */
export function downloadIpReport(ipCheck: { ipAddress: string }, reportText: string): void {
  // Создаем элемент <a> для скачивания
  const element = document.createElement('a');
  
  // Создаем blob с содержимым файла
  const file = new Blob([reportText], {type: 'text/plain'});
  
  // Создаем URL для этого blob
  element.href = URL.createObjectURL(file);
  
  // Задаем имя файла
  element.download = `ip_report_${ipCheck.ipAddress}.txt`;
  
  // Этот элемент не будет видим на странице
  element.style.display = 'none';
  
  // Добавляем элемент на страницу
  document.body.appendChild(element);
  
  // Симулируем клик по элементу для запуска скачивания
  element.click();
  
  // Удаляем элемент со страницы
  document.body.removeChild(element);
  
  // Освобождаем URL, чтобы избежать утечки памяти
  setTimeout(() => {
    URL.revokeObjectURL(element.href);
  }, 100);
}
