import { databases } from "./client";
import { config } from "@/config/app.config";
import { Query } from "appwrite";
import { createDocument, deleteDocument } from "./database";

const databaseId = config.databaseId;
let _cachedRoles: any = null;

export const getRoles = async (forceRefresh: boolean = false) => {
    if (_cachedRoles && !forceRefresh) {
        return _cachedRoles;
    }
    const roles = await databases.listDocuments(databaseId, config.rolesCollectionId, [
        Query.orderAsc("name")
    ]);
    _cachedRoles = roles;
    return roles;
};

export const clearRolesCache = () => {
    _cachedRoles = null;
};

export const getPermissions = async () => {
    return await databases.listDocuments(databaseId, config.permissionsCollectionId, [
        Query.orderAsc("group"),
        Query.limit(100)
    ]);
};

export const getRolePermissionsByRole = async (roleId: string) => {
    return await databases.listDocuments(databaseId, config.rolePermissionsCollectionId, [
        Query.equal("roleId", [roleId]),
        Query.limit(100)
    ]);
};

export const addRolePermission = async (roleId: string, permissionId: string) => {
    return await createDocument(config.rolePermissionsCollectionId, {
        roleId,
        permissionId
    });
};

export const deleteRolePermission = async (documentId: string) => {
    return await deleteDocument(config.rolePermissionsCollectionId, documentId);
};
