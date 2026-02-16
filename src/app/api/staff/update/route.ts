import { serverApi } from "@/lib/services/server/appwrite.server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
    try {
        if (!serverApi || !serverApi.users) {
            console.error("Critical: serverApi is not properly initialized");
            return NextResponse.json({ error: "Server initialization error. Check console for details." }, { status: 500 });
        }

        const body = await request.json();
        const { userId, documentId, databaseId, collectionId, status, fullName, phone, role } = body;

        if (!userId || !documentId || !databaseId || !collectionId) {
            return NextResponse.json(
                { error: "Missing required identification fields (userId, documentId, etc.)" },
                { status: 400 }
            );
        }

        // 1. Update User Status in Appwrite Auth System (Server-side)
        // Map internal status to Appwrite block status
        if (status) {
            const isBlocked = status === "BANNED" || status === "INACTIVE";
            await serverApi.users.updateStatus(userId, !isBlocked);
        }

        // 2. Update Document in Staff Collection
        const updateData: any = {};
        if (fullName) updateData.fullName = fullName;
        if (phone !== undefined) updateData.phone = phone;
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        const document = await serverApi.databases.updateDocument(
            databaseId,
            collectionId,
            documentId,
            updateData
        );

        return NextResponse.json({
            success: true,
            document
        });

    } catch (error: any) {
        console.error("API Update Error:", error);
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
                code: error.code || 500
            },
            { status: error.code || 500 }
        );
    }
}


