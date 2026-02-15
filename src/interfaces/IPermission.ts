import { Models } from "appwrite";

export interface IPermission extends Models.Document {
    group: string;
    description: string;
}
