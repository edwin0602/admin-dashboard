import { Client, Users, Databases, Account, Teams } from "node-appwrite";
import { cookies } from "next/headers";

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

    // Helper to create a session-based client for authenticated API requests
    createSessionClient(session: string) {
        const sessionClient = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setSession(session);

        return {
            get account() { return new Account(sessionClient); },
            get teams() { return new Teams(sessionClient); }
        };
    }

    // Helper to create a client using a JWT from the frontend
    createJWTClient(jwt: string) {
        const jwtClient = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId)
            .setJWT(jwt);

        return {
            get account() { return new Account(jwtClient); },
            get teams() { return new Teams(jwtClient); }
        };
    }

    async getAuthorizedUser(request: Request) {
        const cookieStore = cookies();
        const authHeader = request.headers.get("Authorization");
        const sessionName = `a_session_${projectId}`;
        const sessionValue = cookieStore.get(sessionName)?.value;

        let userClient;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const jwt = authHeader.split(" ")[1];
            userClient = this.createJWTClient(jwt);
        } else if (sessionValue) {
            userClient = this.createSessionClient(sessionValue);
        }

        if (!userClient) return null;

        try {
            const user = await userClient.account.get();
            return { user, userClient };
        } catch (error) {
            return null;
        }
    }

    async createEmailSession(email: string, password: string) {
        const client = new Client()
            .setEndpoint(endpoint)
            .setProject(projectId);
        const account = new Account(client);
        return await account.createEmailPasswordSession(email, password);
    }

    deleteAuthCookies() {
        const cookieStore = cookies();
        const sessionName = `a_session_${projectId}`;
        const legacySessionName = `${sessionName}_legacy`;

        cookieStore.delete(sessionName);
        cookieStore.delete(legacySessionName);
    }

    get account() {
        return new Account(this.client);
    }

    get users() {
        return new Users(this.client);
    }

    get teams() {
        return new Teams(this.client);
    }

    get databases() {
        return new Databases(this.client);
    }
}

export const serverApi = new AppwriteServerService();
