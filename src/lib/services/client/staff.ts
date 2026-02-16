import { databases, teams } from "./client";
import { config } from "@/config/app.config";
import { Query } from "appwrite";

export const getTeamMemberships = async (teamId: string) => {
    return await teams.listMemberships(teamId);
};

export const getStaffStatus = async (userId: string) => {
    try {
        const result = await databases.listDocuments(config.databaseId, config.staffCollectionId, [
            Query.equal("userId", [userId]),
            Query.limit(1)
        ]);

        if (result.documents.length > 0) {
            return result.documents[0].status;
        }
        return null;
    } catch (error) {
        console.error("Error fetching staff status:", error);
        return null;
    }
};

export const createStaff = async (data: any) => {
    const response = await fetch("/api/staff/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
        throw {
            message: result.error || "Failed to create staff",
            code: result.code || response.status
        };
    }
    return result;
};

export const updateStaff = async (data: any) => {
    const response = await fetch("/api/staff/update", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
        throw {
            message: result.error || "Failed to update staff",
            code: result.code || response.status
        };
    }
    return result;
};


