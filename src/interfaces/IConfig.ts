import { ICollection } from "./ICollection";
import { IGroup } from "./IGroup";
import { IShortcut } from "./IShortcut";

export interface IConfig {
  endpoint: string;
  projectId: string;
  projectName: string;
  projectLogo: string;
  databaseId: string;
  groups: IGroup[];
  collections: ICollection[];
  shortcuts: IShortcut[];
  staffCollectionId: string;
  staffTeamId: string;
  rolesCollectionId: string;
  permissionsCollectionId: string;
  rolePermissionsCollectionId: string;
  venuesCollectionId: string;
}


