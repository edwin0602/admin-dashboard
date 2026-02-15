import { Client, Users, Databases } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const apiKey = process.env.APPWRITE_API_KEY || "";

class AppwriteServerService {
    protected client = new Client();

    constructor() {
        if (!apiKey || !projectId) {
            console.error("Appwrite Server Error: Missing APPWRITE_API_KEY or NEXT_PUBLIC_APPWRITE_PROJECT_ID");
        }
        this.client
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setKey(apiKey);
    }

    get users() {
        return new Users(this.client);
    }

    get databases() {
        return new Databases(this.client);
    }
}

export const serverApi = new AppwriteServerService();
