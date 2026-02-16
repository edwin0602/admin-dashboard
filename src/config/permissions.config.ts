/**
 * Centralized Permission Configuration
 * Maps permission group keys (slugs) to their respective Appwrite Document IDs.
 */

export const PERMISSIONS = {
    // Staff Management Group
    STAFF: {
        READ: "69923c27000129ac29f2",          // STAFF_READ
        INVITE: "69923c37001a11500426",        // STAFF_INVITE
        UPDATE: "69923c4100385732593ff",        // STAFF_UPDATE
        DELETE: "69923c600038bdc2fe14",        // STAFF_DELETE
        ASSIGN_ROLES: "69923c71003809dec59c",  // STAFF_ASSIGN_ROLES
    },

    // User Organization Group
    USERS: {
        INVITE: "6992286b00039ee443ce",        // USERS_INVITE
    },

    // RBAC Management Group
    ROLES: {
        MANAGE: "69922865003940c34a41",        // ROLES_MANAGE
    },

    // System Configuration Group
    CONFIG: {
        READ: "6992285900350f6df5c6",          // CONFIG_READ
        WRITE: "6992285f0031e4084cea",         // CONFIG_WRITE
    }
} as const;

/**
 * Group Identifiers
 * These correspond to the 'group' field in the Appwrite permissions collection.
 * Using these is often more convenient than individual IDs for high-level UI control.
 */
export const PERMISSION_GROUPS = {
    STAFF_READ: "STAFF_READ",
    STAFF_INVITE: "STAFF_INVITE",
    STAFF_UPDATE: "STAFF_UPDATE",
    STAFF_DELETE: "STAFF_DELETE",
    STAFF_ASSIGN_ROLES: "STAFF_ASSIGN_ROLES",
    USERS_INVITE: "USERS_INVITE",
    ROLES_MANAGE: "ROLES_MANAGE",
    CONFIG_READ: "CONFIG_READ",
    CONFIG_WRITE: "CONFIG_WRITE",
} as const;
