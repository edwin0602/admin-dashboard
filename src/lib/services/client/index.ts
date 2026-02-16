import * as auth from "./auth";
import * as database from "./database";
import * as roles from "./roles";
import * as staff from "./staff";
import * as storage from "./storage";
import client, { account, databases, storage as appwriteStorage, teams } from "./client";

export const api = {
    ...auth,
    ...database,
    ...roles,
    ...staff,
    ...storage,
    // Instance access for advanced cases
    account,
    databases,
    storage: appwriteStorage,
    teams,
    client
};

export default api;


