import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface AuthState {
    user: any | null;
    team: any | null;
    role: any | null;
    permissions: string[];
    groups: string[];
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    team: null,
    role: null,
    permissions: [],
    groups: [],
    isLoading: true,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthData: (state, action: PayloadAction<{ user: any; team: any; role: any; permissions: string[]; groups: string[] }>) => {
            state.user = action.payload.user;
            state.team = action.payload.team;
            state.role = action.payload.role;
            state.permissions = action.payload.permissions;
            state.groups = action.payload.groups;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        clearAuth: (state) => {
            state.user = null;
            state.team = null;
            state.role = null;
            state.permissions = [];
            state.groups = [];
            state.isLoading = false;
        },
    },
});

export const { setAuthData, setLoading, clearAuth } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectGroups = (state: RootState) => state.auth.groups;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectTeam = (state: RootState) => state.auth.team;
export const selectRole = (state: RootState) => state.auth.role;

export default authSlice.reducer;
