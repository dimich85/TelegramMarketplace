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
    const user: User = { ...insertUser, id, balance: 0, createdAt };
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
    const service: Service = { ...insertService, id };
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
    const transaction: Transaction = { ...insertTransaction, id, createdAt };
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
    const ipCheck: IpCheck = { ...insertIpCheck, id, createdAt };
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
