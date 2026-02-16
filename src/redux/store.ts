import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import collectionSlice from "./collectionSlice";
import authSlice from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    app: appSlice,
    collection: collectionSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
