export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export function initializeTelegramApp() {
  const tgWebApp = window.Telegram?.WebApp;
  
  if (tgWebApp) {
    tgWebApp.ready();
    tgWebApp.expand();
    
    // Set theme
    document.documentElement.classList.add(tgWebApp.colorScheme || 'light');
    
    // Add Telegram styles to root
    document.documentElement.style.setProperty(
      '--telegram-bg-color', 
      tgWebApp.backgroundColor || '#ffffff'
    );
    
    // Log WebApp launch for debugging
    console.log('Telegram WebApp initialized', {
      version: tgWebApp.version,
      platform: tgWebApp.platform,
      colorScheme: tgWebApp.colorScheme,
      viewportHeight: tgWebApp.viewportHeight,
      viewportStableHeight: tgWebApp.viewportStableHeight,
    });
  } else {
    console.warn('Telegram WebApp not available. Are you running outside of Telegram?');
  }
}

export function getTelegramUser(): TelegramUser | null {
  const tgWebApp = window.Telegram?.WebApp;
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  // Use real Telegram user if available
  if (tgWebApp && tgWebApp.initDataUnsafe && tgWebApp.initDataUnsafe.user) {
    return tgWebApp.initDataUnsafe.user;
  }
  
  // Use demo user in development mode if no Telegram user is available
  if (isDevelopment) {
    console.log('Using demo Telegram user for development');
    return {
      id: 12345678,
      first_name: 'Demo',
      last_name: 'User',
      username: 'demo_user',
      photo_url: 'https://t.me/i/userpic/320/demo_userpic.jpg'
    };
  }
  
  // In production, return null if no Telegram user is found
  return null;
}

export function closeWebApp() {
  const tgWebApp = window.Telegram?.WebApp;
  
  if (tgWebApp) {
    tgWebApp.close();
  }
}

export function showBackButton() {
  const tgWebApp = window.Telegram?.WebApp;
  
  if (tgWebApp) {
    tgWebApp.BackButton.show();
  }
}

export function hideBackButton() {
  const tgWebApp = window.Telegram?.WebApp;
  
  if (tgWebApp) {
    tgWebApp.BackButton.hide();
  }
}

export function onBackButtonClicked(callback: () => void) {
  const tgWebApp = window.Telegram?.WebApp;
  
  if (tgWebApp) {
    tgWebApp.BackButton.onClick(callback);
  }
}

// Add Telegram Web App types to Window interface
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        version: string;
        platform: string;
        colorScheme: string;
        backgroundColor: string;
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          start_param?: string;
          query_id?: string;
          auth_date?: number;
          hash?: string;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          isVisible: boolean;
        };
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          isVisible: boolean;
          text: string;
          color: string;
          textColor: string;
        };
      };
    };
  }
}
