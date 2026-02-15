import { Models } from "appwrite";

export interface IRole extends Models.Document {
    name: string;
    description: string;
    isSystem: boolean;
}
