import { useState, useEffect } from "react";
import api from "@/appwrite/appwrite.client";
import { useToast } from "@/components/ui/use-toast";
import { Models } from "appwrite";

export function useProfile() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const userData = await api.getAccount();
            setUser(userData);
        } catch (error: any) {
            console.error("Error fetching user:", error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información del perfil.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const updateName = async (name: string) => {
        try {
            await api.updateName(name);
            await fetchUser();
            toast({
                title: "Nombre actualizado",
                description: "Tu nombre ha sido actualizado correctamente.",
            });
            return true;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo actualizar el nombre.",
                variant: "destructive",
            });
            return false;
        }
    };

    const updateEmail = async (email: string, password: string) => {
        try {
            await api.updateEmail(email, password);
            await fetchUser();
            toast({
                title: "Email actualizado",
                description: "Tu correo electrónico ha sido actualizado correctamente.",
            });
            return true;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo actualizar el email.",
                variant: "destructive",
            });
            return false;
        }
    };

    const updatePhone = async (phone: string, password: string) => {
        try {
            await api.updatePhone(phone, password);
            await fetchUser();
            toast({
                title: "Teléfono actualizado",
                description: "Tu número de teléfono ha sido actualizado correctamente.",
            });
            return true;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo actualizar el teléfono.",
                variant: "destructive",
            });
            return false;
        }
    };

    const createRecovery = async (email: string) => {
        try {
            await api.createRecovery(email);
            toast({
                title: "Email enviado",
                description: "Se ha enviado un enlace de recuperación a tu correo.",
            });
            return true;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "No se pudo enviar el correo de recuperación.",
                variant: "destructive",
            });
            return false;
        }
    };

    return {
        user,
        isLoading,
        updateName,
        updateEmail,
        updatePhone,
        createRecovery,
        refresh: fetchUser,
    };
}
