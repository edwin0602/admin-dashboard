import { config } from "@/config/app.config";
import {
    Account,
    Client as Appwrite,
    Databases,
    Storage,
    Teams,
} from "appwrite";

const client = new Appwrite();
client.setEndpoint(config.endpoint).setProject(config.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

export default client;


