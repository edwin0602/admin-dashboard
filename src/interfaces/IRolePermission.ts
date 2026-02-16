import { Models } from "appwrite";

export interface IRolePermission extends Models.Document {
    roleId: string;
    permissionId: string;
}


