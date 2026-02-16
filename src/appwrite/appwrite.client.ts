import { config } from "@/config/app.config";
import {
  Account,
  Client as Appwrite,
  Databases,
  ID,
  Query,
  Storage,
  Teams,
} from "appwrite";

const databaseId = config.databaseId;

export class AppwriteService {
  // --- Core & Initialization ---
  private client = new Appwrite();
  public account: Account;
  public databases: Databases;
  public storage: Storage;
  public teams: Teams;
  private _cachedRoles: any = null;

  constructor() {
    this.client.setEndpoint(config.endpoint).setProject(config.projectId);
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.teams = new Teams(this.client);
  }

  // --- Auth & Session ---
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

  async getTeamMemberships(teamId: string) {
    return await this.teams.listMemberships(teamId);
  }

  // --- Account Management ---
  async updateName(name: string) {
    return await this.account.updateName(name);
  }

  async updateEmail(email: string, password: string) {
    return await this.account.updateEmail(email, password);
  }

  async updatePhone(phone: string, password: string) {
    return await this.account.updatePhone(phone, password);
  }

  async updatePassword(password: string, oldPassword: string) {
    return await this.account.updatePassword(password, oldPassword);
  }

  async createRecovery(email: string) {
    const url = `${window.location.origin}/reset-password`;
    return await this.account.createRecovery(email, url);
  }

  async updateRecovery(userId: string, secret: string, password: string) {
    return await this.account.updateRecovery(userId, secret, password, password);
  }

  // --- Generic Database Operations ---
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

  // --- Roles & Permissions (with Caching) ---
  async getRoles(forceRefresh: boolean = false) {
    if (this._cachedRoles && !forceRefresh) {
      return this._cachedRoles;
    }
    const roles = await this.databases.listDocuments(databaseId, config.rolesCollectionId, [
      Query.orderAsc("name")
    ]);
    this._cachedRoles = roles;
    return roles;
  }

  clearRolesCache() {
    this._cachedRoles = null;
  }

  async getPermissions() {
    return await this.databases.listDocuments(databaseId, config.permissionsCollectionId, [
      Query.orderAsc("group"),
      Query.limit(100)
    ]);
  }

  async getRolePermissionsByRole(roleId: string) {
    return await this.databases.listDocuments(databaseId, config.rolePermissionsCollectionId, [
      Query.equal("roleId", [roleId]),
      Query.limit(100)
    ]);
  }

  async addRolePermission(roleId: string, permissionId: string) {
    return await this.createDocument(config.rolePermissionsCollectionId, {
      roleId,
      permissionId
    });
  }

  async deleteRolePermission(documentId: string) {
    return await this.deleteDocument(config.rolePermissionsCollectionId, documentId);
  }

  // --- Staff Module ---
  async getStaffStatus(userId: string) {
    try {
      const result = await this.databases.listDocuments(config.databaseId, config.staffCollectionId, [
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

  // --- Storage ---
  async createFile(bucketId: string, file: any) {
    return await this.storage.createFile(bucketId, ID.unique(), file);
  }

  getFilePreview(bucketId: string, fileId: string) {
    return this.storage.getFileView(bucketId, fileId).toString();
  }

  // --- Permission System ---
  async login(data: any) {
    try {
      await this.account.createEmailSession(data.email, data.password);
      return await this.getCurrentUserPermissions();
    } catch (error) {
      try { await this.account.deleteSession("current"); } catch (e) { }
      throw error;
    }
  }

  async getCurrentUserPermissions() {
    const { jwt } = await this.account.createJWT();
    const response = await fetch("/api/auth/me", {
      headers: {
        "Authorization": `Bearer ${jwt}`
      }
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("NON JSON RESPONSE:", text);
      throw new Error(`Expected JSON but received ${contentType}`);
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("[AppwriteService] GET /api/auth/me failed:", data);
      throw new Error(data.error || `Unauthorized (${response.status})`);
    }

    return data;
  }

}

const api = new AppwriteService();
export default api;
