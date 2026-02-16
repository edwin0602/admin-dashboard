import { databases } from "./client";
import { config } from "@/config/app.config";
import { ID, Query } from "appwrite";

const databaseId = config.databaseId;

export const createDocument = async (collectionId: string, data: any, documentId: string = ID.unique(), permissions?: string[]) => {
    return await databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
    );
};

export const getDocuments = async (
    collectionId: string,
    limit: number = 10,
    offset: number = 0,
    queries: string[] = []
) => {
    return await databases.listDocuments(databaseId, collectionId, [
        Query.limit(limit),
        Query.offset(offset),
        ...queries,
    ]);
};

export const getDocument = async (collectionId: string, documentId: string, queries?: string[]) => {
    return await databases.getDocument(
        databaseId,
        collectionId,
        documentId,
        queries
    );
};

export const updateDocument = async (collectionId: string, documentId: string, data: any) => {
    return await databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data
    );
};

export const deleteDocument = async (collectionId: string, documentId: string) => {
    return await databases.deleteDocument(
        databaseId,
        collectionId,
        documentId
    );
};
