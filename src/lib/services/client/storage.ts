import { storage } from "./client";
import { ID } from "appwrite";

export const createFile = async (bucketId: string, file: any) => {
    return await storage.createFile(bucketId, ID.unique(), file);
};

export const getFilePreview = (bucketId: string, fileId: string) => {
    return storage.getFileView(bucketId, fileId).toString();
};


