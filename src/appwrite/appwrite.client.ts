import { config } from "@/config/app.config";
import {
  Account,
  Client as Appwrite,
  Databases,
  ID,
  Query,
  Storage,
} from "appwrite";

const databaseId = config.databaseId;

export class AppwriteService {
  private client = new Appwrite();
  public account: Account;
  public databases: Databases;
  public storage: Storage;

  constructor() {
    this.client.setEndpoint(config.endpoint).setProject(config.projectId);
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }

  // Auth Methods
  async getAccount() {
    return await this.account.get();
  }

  async createAccount(email: string, fullName: string, userId: string = ID.unique(), password: string = ID.unique()) {
    return await this.account.create(userId, email, password, fullName);
  }

  async createSession(loginBody: any) {
    return await this.account.createEmailSession(
      loginBody.email,
      loginBody.password
    );
  }

  async deleteCurrentSession() {
    return await this.account.deleteSession("current");
  }

  // Account Management Methods
  async updateName(name: string) {
    return await this.account.updateName(name);
  }

  async updateEmail(email: string, password: string) {
    return await this.account.updateEmail(email, password);
  }

  async updatePhone(phone: string, password: string) {
    return await this.account.updatePhone(phone, password);
  }

  async createRecovery(email: string) {
    const url = `${window.location.origin}/reset-password`;
    return await this.account.createRecovery(email, url);
  }

  async updateRecovery(userId: string, secret: string, password: string) {
    return await this.account.updateRecovery(userId, secret, password, password);
  }

  async updatePassword(password: string, oldPassword: string) {
    return await this.account.updatePassword(password, oldPassword);
  }

  // Database Methods
  async createDocument(collectionId: string, data: any, documentId: string = ID.unique(), permissions?: string[]) {
    return await this.databases.createDocument(
      databaseId,
      collectionId,
      documentId,
      data,
      permissions
    );
  }

  async getDocuments(
    collectionId: string,
    limit: number = 10,
    offset: number = 0,
    queries: string[] = []
  ) {
    return await this.databases.listDocuments(databaseId, collectionId, [
      Query.limit(limit),
      Query.offset(offset),
      ...queries,
    ]);
  }

  async getDocument(collectionId: string, documentId: string, queries?: string[]) {
    return await this.databases.getDocument(
      databaseId,
      collectionId,
      documentId,
      queries
    );
  }

  async updateDocument(collectionId: string, documentId: string, data: any) {
    return await this.databases.updateDocument(
      databaseId,
      collectionId,
      documentId,
      data
    );
  }

  async deleteDocument(collectionId: string, documentId: string) {
    return await this.databases.deleteDocument(
      databaseId,
      collectionId,
      documentId
    );
  }

  // Storage Methods
  async createFile(bucketId: string, file: any) {
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }

  async getFilePreview(bucketId: string, fileId: string) {
    return this.storage.getFileView(bucketId, fileId);
  }

  async getStaffStatus(userId: string) {
    try {
      const result = await this.databases.listDocuments(config.databaseId, "staff", [
        Query.equal("userId", [userId]),
        Query.limit(1)
      ]);

      if (result.documents.length > 0) {
        return result.documents[0].status;
      }
      return null;
    } catch (error) {
      console.error("Error fetching staff status:", error);
      return null;
    }
  }

  // Internal API Methods
  async createStaff(data: any) {
    const response = await fetch("/api/staff/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw {
        message: result.error || "Failed to create staff",
        code: result.code || response.status
      };
    }
    return result;
  }

  async updateStaff(data: any) {
    const response = await fetch("/api/staff/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      throw {
        message: result.error || "Failed to update staff",
        code: result.code || response.status
      };
    }
    return result;
  }
}

const api = new AppwriteService();
export default api;
