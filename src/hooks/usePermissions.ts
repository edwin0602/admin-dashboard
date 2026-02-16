import { useAppSelector } from "./reduxHooks";
import { selectPermissions, selectGroups, selectIsAuthLoading } from "@/redux/authSlice";

export const usePermissions = () => {
    const permissions = useAppSelector(selectPermissions);
    const groups = useAppSelector(selectGroups);
    const isLoading = useAppSelector(selectIsAuthLoading);

    const hasPermission = (permissionId: string) => {
        return permissions?.includes(permissionId) || false;
    };

    const hasGroup = (groupName: string) => {
        return groups?.includes(groupName) || false;
    };

    const hasAnyPermission = (permissionIds: string[]) => {
        return permissionIds.some(id => permissions?.includes(id)) || false;
    };

    const hasAllPermissions = (permissionIds: string[]) => {
        return permissionIds.every(id => permissions?.includes(id)) || false;
    };

    return {
        permissions,
        groups,
        isLoading,
        hasPermission,
        hasGroup,
        hasAnyPermission,
        hasAllPermissions,
    };
};
