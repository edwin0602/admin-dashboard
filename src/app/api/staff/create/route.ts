import { serverApi } from "@/appwrite/appwrite.server";
import { Permission, Role } from "node-appwrite";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        if (!serverApi || !serverApi.users) {
            console.error("Critical: serverApi is not properly initialized");
            return NextResponse.json({ error: "Server initialization error. Check console for details." }, { status: 500 });
        }

        const body = await request.json();
        const { email, fullName, phone, role, collectionId, databaseId } = body;

        if (!email || !fullName || !role || !collectionId || !databaseId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = crypto.randomUUID();
        const tempPassword = Math.random().toString(36).slice(-12) + "A1!";

        const user = await serverApi.users.create(
            userId,
            email,
            phone || undefined,
            tempPassword,
            fullName
        );

        const dataToSubmit = {
            fullName,
            email,
            phone,
            role,
            userId: user.$id,
            status: "ACTIVE"
        };

        const document = await serverApi.databases.createDocument(
            databaseId,
            collectionId,
            user.$id,
            dataToSubmit,
            [
                Permission.read(Role.users()),
                Permission.write(Role.user(user.$id)),
                Permission.update(Role.team("admin")),
                Permission.delete(Role.team("admin")),
            ]
        );

        return NextResponse.json({
            success: true,
            user,
            document
        });

    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
                code: error.code || 500
            },
            { status: error.code || 500 }
        );
    }
}
