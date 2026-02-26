import { IConfig } from "@/interfaces/IConfig";

export const config: IConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  projectName: "BackOffice",
  projectLogo: "/logo.svg",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  groups: [
    {
      name: "Basic",
      id: "basic",
    }
  ],
  collections: [
    {
      name: "Staff",
      groupId: "basic",
      collectionId: "staff",
      searchColumn: "fullName",
      columns: [
        {
          key: "fullName",
          label: "Full Name",
          rules: {
            required: true,
          },
        },
        {
          key: "email",
          label: "Email",
          rules: {
            required: true,
            type: "email",
          },
        },
        {
          key: "phone",
          label: "Phone",
          rules: {
            placeholder: "+1 234 567 890",
          },
        },
        {
          key: "userId",
          label: "User ID",
          rules: {
            placeholder: "Appwrite User ID",
          },
        },
        {
          key: "role",
          label: "Role",
          type: "enum",
          options: ["user", "admin"],
          rules: {
            required: true,
          },
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          options: ["ACTIVE", "INACTIVE", "BANNED"],
          rules: {
            required: true,
          },
        },
      ],
    },
    {
      name: "Venues",
      groupId: "basic",
      collectionId: "venues",
      searchColumn: "name",
      columns: [
        {
          key: "name",
          label: "Name",
          rules: {
            required: true,
          },
        },
        {
          key: "code",
          label: "Code",
          rules: {
            required: true,
          },
        },
        {
          key: "isActive",
          label: "Status",
          type: "boolean",
          rules: {
            required: false,
          },
        },
        {
          key: "commissionPct",
          label: "Commission %",
          type: "number",
          rules: {
            required: false,
          },
        },
      ],
    },
    {
      name: "Venue Devices",
      groupId: "basic",
      collectionId: "venue_devices",
      searchColumn: "label",
      columns: [
        {
          key: "label",
          label: "Label",
          rules: {
            required: true,
          },
        },
        {
          key: "venueId",
          label: "Venue ID",
          rules: {
            required: true,
          },
        },
        {
          key: "status",
          label: "Status",
          type: "enum",
          options: ["pending", "active", "revoked"],
          rules: {
            required: true,
          },
        },
        {
          key: "activationCode",
          label: "Code",
          rules: {
            required: true,
          },
        },
        {
          key: "codeExpiresAt",
          label: "Expires At",
          type: "date",
          rules: {
            required: true,
          },
        },
      ],
    }
  ],
  shortcuts: [
    {
      action: "search",
      keyAfterCtrl: "s",
    },
    {
      action: "filter",
      keyAfterCtrl: "f",
    },
    {
      action: "searchbox",
      keyAfterCtrl: "y",
    },
  ],
  staffCollectionId: "staff",
  staffTeamId: process.env.NEXT_PUBLIC_APPWRITE_STAFF_TEAM_ID || "699245b7000828c0f75c",
  rolesCollectionId: "roles",
  permissionsCollectionId: "permissions",
  rolePermissionsCollectionId: "role_permissions",
  venuesCollectionId: "venues",
  venueDevicesCollectionId: "venue_devices",
};


