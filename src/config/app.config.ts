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
};


