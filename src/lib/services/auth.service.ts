import api from "@/appwrite/appwrite.client";

export const getSession = async () => {
  return await api.getAccount();
};

export const logout = async () => {
  return await api.deleteCurrentSession();
};
