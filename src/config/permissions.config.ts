/**
 * Centralized Permission Configuration
 * Maps permission keys to their respective slugs (which are also the Appwrite Document IDs).
 */

export const PERMISSIONS = {
    // System Configuration Group
    CONFIG: {
        READ: "CONFIG_READ",
        WRITE: "CONFIG_WRITE",
    },

    // RBAC Management Group
    ROLES: {
        MANAGE: "ROLES_MANAGE",
    },

    // User Organization Group
    USERS: {
        INVITE: "USERS_INVITE",
    },

    // Staff Management Group
    STAFF: {
        READ: "STAFF_READ",
        INVITE: "STAFF_INVITE",
        UPDATE: "STAFF_UPDATE",
        DELETE: "STAFF_DELETE",
        ASSIGN_ROLES: "STAFF_ASSIGN_ROLES",
    },

    // Keno Operations Group
    KENO: {
        VENUES_CREATE: "KENO_VENUES_CREATE",
        VENUES_READ: "KENO_VENUES_READ",
        VENUES_UPDATE: "KENO_VENUES_UPDATE",
        TICKETS_CREATE: "KENO_TICKETS_CREATE",
        TICKETS_VOID: "KENO_TICKETS_VOID",
        TICKETS_PAY: "KENO_TICKETS_PAY",
        REPORTS_VIEW: "KENO_REPORTS_VIEW",
    }
} as const;

// Helper type to get a union of all permission keys
export type PermissionKey =
    | typeof PERMISSIONS.CONFIG[keyof typeof PERMISSIONS.CONFIG]
    | typeof PERMISSIONS.ROLES[keyof typeof PERMISSIONS.ROLES]
    | typeof PERMISSIONS.USERS[keyof typeof PERMISSIONS.USERS]
    | typeof PERMISSIONS.STAFF[keyof typeof PERMISSIONS.STAFF]
    | typeof PERMISSIONS.KENO[keyof typeof PERMISSIONS.KENO];
