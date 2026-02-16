import { NextResponse } from "next/server";
import { serverApi } from "@/appwrite/appwrite.server";
import { config } from "@/config/app.config";
import { Query } from "node-appwrite";

export async function GET(request: Request) {
    try {
        const auth = await serverApi.getAuthorizedUser(request);

        if (!auth) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user, userClient } = auth;

        // 1. Email Verification Check
        if (!user.emailVerification) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: "Email not verified",
                code: "EMAIL_NOT_VERIFIED"
            }, { status: 403 });
        }

        // 2. Staff Status Check (from Database)
        let staffDoc = await getStaffDoc(user.$id);

        if (!staffDoc) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: "Staff profile not found",
                code: "STAFF_NOT_FOUND"
            }, { status: 404 });
        }

        if (staffDoc.status !== "ACTIVE") {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: `Account is ${staffDoc.status}`,
                code: "ACCOUNT_BLOCKED",
                status: staffDoc.status
            }, { status: 403 });
        }

        // 3. Role Check
        let memberships = await getTeamDoc(user.$id, userClient);
        if (!memberships) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: `Account is not a member of any team`,
                code: "ACCOUNT_NOT_MEMBER",
                status: ""
            }, { status: 403 });
        }

        if (memberships.total === 0) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: `Account is not a member of any team`,
                code: "ACCOUNT_NOT_MEMBER",
                status: ""
            }, { status: 403 });
        }

        const myMembership = memberships.memberships.find(
            (m: any) => m.teamId === config.staffTeamId
        );

        if (!myMembership) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: `Account is not a member of Staff team`,
                code: "ACCOUNT_NOT_MEMBER",
                status: ""
            }, { status: 403 });
        }

        const roleId = myMembership.roles[0];

        if (!roleId) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: `Account has no role`,
                code: "ACCOUNT_NO_ROLE",
                status: ""
            }, { status: 403 });
        }

        const roleDoc = await getRoleDoc(roleId);

        if (!roleDoc) {
            serverApi.deleteAuthCookies();
            return NextResponse.json({
                error: `Role not found`,
                code: "ROLE_NOT_FOUND",
                status: ""
            }, { status: 403 });
        }

        const rolePermissions = await serverApi.databases.listDocuments(
            config.databaseId,
            config.rolePermissionsCollectionId,
            [Query.equal("roleId", [roleId]), Query.limit(100)]
        );

        const permissionIds = rolePermissions.documents.map(doc => doc.permissionId);

        let permissionsResolved: any[] = [];
        if (permissionIds.length > 0) {
            const permissionsResult = await serverApi.databases.listDocuments(
                config.databaseId,
                config.permissionsCollectionId,
                [Query.equal("$id", permissionIds), Query.limit(100)]
            );
            permissionsResolved = permissionsResult.documents;
        }

        const permissionKeys = permissionsResolved.map(p => p.key);
        const groups = Array.from(new Set(permissionsResolved.map(p => p.group)));

        return NextResponse.json({
            user: { id: user.$id, email: user.email, name: user.name },
            team: { id: config.staffTeamId, name: "Staff" },
            role: { id: roleDoc.$id, name: roleDoc.name },
            permissions: permissionKeys,
            groups: groups
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

async function getStaffDoc(userId: string) {
    try {
        const staffResult = await serverApi.databases.listDocuments(
            config.databaseId,
            config.staffCollectionId,
            [Query.equal("userId", [userId]), Query.limit(1)]
        );
        return staffResult.documents[0];
    } catch (error: any) {
        console.error("[API/AUTH/ME] Staff profile lookup failed:", error.message);
        return null;
    }
}

async function getTeamDoc(userId: string, userClient: any): Promise<any> {
    try {
        const memberships = await userClient.teams.listMemberships(
            config.staffTeamId,
            [
                Query.equal("teamId", [config.staffTeamId]),
                Query.equal("userId", [userId]),
                Query.limit(1),
            ]
        );
        return memberships;
    } catch (error: any) {
        console.error("[API/AUTH/ME] Team lookup failed:", error.message);
        return null;
    }
}

async function getRoleDoc(roleId: string) {
    try {
        const roleResult = await serverApi.databases.getDocument(
            config.databaseId,
            config.rolesCollectionId,
            roleId
        );
        return roleResult;
    } catch (error: any) {
        console.error("[API/AUTH/ME] Role profile lookup failed:", error.message);
        return null;
    }
}   
