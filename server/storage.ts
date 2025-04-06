import { 
  users, 
  services, 
  transactions, 
  ipChecks, 
  type User, 
  type InsertUser, 
  type Service, 
  type InsertService,
  type Transaction,
  type InsertTransaction,
  type IpCheck,
  type InsertIpCheck
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  
  // Services management
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  
  // Transactions management
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  
  // IP Checks management
  createIpCheck(ipCheck: InsertIpCheck): Promise<IpCheck>;
  getUserIpChecks(userId: number): Promise<IpCheck[]>;
  getIpCheck(id: number): Promise<IpCheck | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private transactions: Map<number, Transaction>;
  private ipChecks: Map<number, IpCheck>;
  private userIdCounter: number;
  private serviceIdCounter: number;
  private transactionIdCounter: number;
  private ipCheckIdCounter: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.transactions = new Map();
    this.ipChecks = new Map();
    this.userIdCounter = 1;
    this.serviceIdCounter = 1;
    this.transactionIdCounter = 1;
    this.ipCheckIdCounter = 1;
    
    // Initialize with some default services
    this.initializeDefaultServices();
    
    // Initialize demo user and test transactions
    this.initializeDemoData();
  }

  private initializeDefaultServices() {
    const ipCheckService: InsertService = {
      name: "Проверка IP адреса",
      description: "Проверка IP на спам, блэклисты и определение геоданных",
      price: 5.0,
      icon: "public",
      available: true,
    };
    
    const vpnService: InsertService = {
      name: "VPN Подписка",
      description: "1 месяц анонимного доступа в интернет с защитой данных",
      price: 20.0,
      icon: "vpn_lock",
      available: true,
    };
    
    this.createService(ipCheckService);
    this.createService(vpnService);
  }
  
  private initializeDemoData() {
    // Создаем демо пользователя, если используется демо режим
    const demoUser: InsertUser = {
      telegramId: 12345678,
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      photoUrl: null,
    };
    
    // Добавляем демо-пользователя
    this.createUser({
      telegramId: 12345678, 
      username: "demo_user",
      firstName: "Demo",
      lastName: "User",
      photoUrl: null
    }).then(user => {
      // Добавляем тестовые транзакции
      const now = new Date();
      
      // Пополнение баланса
      const topupTransaction: InsertTransaction = {
        userId: user.id,
        type: 'topup',
        amount: 50.0,
        description: 'Пополнение баланса',
        reference: 'TG12345678',
        serviceId: null,
      };
      
      // Покупка проверки IP
      const ipCheckTransaction: InsertTransaction = {
        userId: user.id,
        type: 'purchase',
        amount: 5.0,
        description: 'Проверка IP адреса',
        reference: null,
        serviceId: 1,
      };
      
      // Покупка VPN подписки
      const vpnTransaction: InsertTransaction = {
        userId: user.id,
        type: 'purchase',
        amount: 20.0,
        description: 'VPN Подписка (1 месяц)',
        reference: null,
        serviceId: 2,
      };
      
      // Добавляем транзакции с разными датами для демонстрации
      const createDelayedTransaction = (transaction: InsertTransaction, daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        this.createTransaction(transaction).then(tx => {
          // Обновляем дату транзакции на нужное значение (для демо)
          const updatedTx: Transaction = {
            ...tx,
            createdAt: date
          };
          this.transactions.set(tx.id, updatedTx);
        });
      };
      
      // Создаем транзакции с разным временем
      createDelayedTransaction(topupTransaction, 7); // Неделю назад
      createDelayedTransaction(ipCheckTransaction, 5); // 5 дней назад
      createDelayedTransaction(vpnTransaction, 2); // 2 дня назад
      
      // Обновляем баланс пользователя (50 - 5 - 20 = 25)
      this.updateUserBalance(user.id, 25.0);
      
      // Добавляем результат проверки IP
      const ipCheckResult: InsertIpCheck = {
        userId: user.id,
        ipAddress: '8.8.8.8',
        country: 'США',
        city: 'Маунтин-Вью',
        isp: 'Google LLC',
        isSpam: false,
        isBlacklisted: false,
        details: {
          hostname: 'dns.google',
          org: 'Google LLC',
          timezone: 'America/Los_Angeles'
        }
      };
      
      // Создаем проверку IP
      this.createIpCheck(ipCheckResult).then(ipCheck => {
        // Задаем дату для проверки IP (совпадает с транзакцией)
        const date = new Date();
        date.setDate(date.getDate() - 5);
        
        const updatedIpCheck: IpCheck = {
          ...ipCheck,
          createdAt: date
        };
        this.ipChecks.set(ipCheck.id, updatedIpCheck);
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    // Обрабатываем nullable поля для соответствия типам
    const user: User = { 
      ...insertUser, 
      id, 
      balance: 0, 
      createdAt,
      username: insertUser.username ?? null,
      lastName: insertUser.lastName ?? null,
      photoUrl: insertUser.photoUrl ?? null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, balance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const service: Service = { 
      ...insertService, 
      id,
      available: insertService.available ?? true
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = await this.getService(id);
    if (!service) return undefined;
    
    const updatedService: Service = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const createdAt = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt,
      serviceId: insertTransaction.serviceId ?? null,
      reference: insertTransaction.reference ?? null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  // IP Check methods
  async createIpCheck(insertIpCheck: InsertIpCheck): Promise<IpCheck> {
    const id = this.ipCheckIdCounter++;
    const createdAt = new Date();
    const ipCheck: IpCheck = { 
      ...insertIpCheck, 
      id, 
      createdAt,
      country: insertIpCheck.country ?? null,
      city: insertIpCheck.city ?? null,
      isp: insertIpCheck.isp ?? null,
      isSpam: insertIpCheck.isSpam ?? null,
      isBlacklisted: insertIpCheck.isBlacklisted ?? null,
      details: insertIpCheck.details ?? null
    };
    this.ipChecks.set(id, ipCheck);
    return ipCheck;
  }

  async getUserIpChecks(userId: number): Promise<IpCheck[]> {
    return Array.from(this.ipChecks.values())
      .filter(ipCheck => ipCheck.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getIpCheck(id: number): Promise<IpCheck | undefined> {
    return this.ipChecks.get(id);
  }
}

export const storage = new MemStorage();
