import { account } from "./client";
import { ID } from "appwrite";

export const getAccount = async () => {
    return await account.get();
};

export const createAccount = async (email: string, fullName: string, userId: string = ID.unique(), password: string = ID.unique()) => {
    return await account.create(userId, email, password, fullName);
};

export const createSession = async (loginBody: any) => {
    return await account.createEmailSession(
        loginBody.email,
        loginBody.password
    );
};

export const deleteCurrentSession = async () => {
    return await account.deleteSession("current");
};

export const logout = deleteCurrentSession;

export const updateName = async (name: string) => {
    return await account.updateName(name);
};

export const updateEmail = async (email: string, password: string) => {
    return await account.updateEmail(email, password);
};

export const updatePhone = async (phone: string, password: string) => {
    return await account.updatePhone(phone, password);
};

export const updatePassword = async (password: string, oldPassword: string) => {
    return await account.updatePassword(password, oldPassword);
};

export const createRecovery = async (email: string) => {
    const url = `${window.location.origin}/reset-password`;
    return await account.createRecovery(email, url);
};

export const updateRecovery = async (userId: string, secret: string, password: string) => {
    return await account.updateRecovery(userId, secret, password, password);
};

export const getCurrentUserPermissions = async () => {
    const { jwt } = await account.createJWT();
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
        console.error("[AuthService] GET /api/auth/me failed:", data);
        throw new Error(data.error || `Unauthorized (${response.status})`);
    }

    return data;
};

export const login = async (data: any) => {
    try {
        await account.createEmailSession(data.email, data.password);
        return await getCurrentUserPermissions();
    } catch (error) {
        try { await account.deleteSession("current"); } catch (e) { }
        throw error;
    }
};


