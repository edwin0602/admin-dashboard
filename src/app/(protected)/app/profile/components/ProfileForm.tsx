"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Phone, User, Lock, Save, Key } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useProfile } from "../hooks/useProfile";

const FormSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.string().email({
        message: "Introduce un email válido.",
    }),
    phone: z.string().optional(),
});

const PasswordSchema = z.object({
    password: z.string().min(8, {
        message: "La contraseña debe tener al menos 8 caracteres.",
    }),
});

export function ProfileForm() {
    const { user, isLoading: isProfileLoading, updateName, updateEmail, updatePhone, createRecovery } = useProfile();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<"email" | "phone" | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    });

    const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
        resolver: zodResolver(PasswordSchema),
        defaultValues: {
            password: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user, form]);

    async function onGeneralSubmit(data: z.infer<typeof FormSchema>) {
        if (data.name !== user?.name) {
            setIsSubmitting(true);
            await updateName(data.name);
            setIsSubmitting(false);
        } else {
            toast({
                title: "Sin cambios",
                description: "No se han detectado cambios en el nombre.",
            });
        }
    }

    async function onSensitiveSubmit(passwordData: z.infer<typeof PasswordSchema>) {
        setIsSubmitting(true);
        const data = form.getValues();
        let success = false;

        if (pendingAction === "email") {
            success = await updateEmail(data.email, passwordData.password);
        } else if (pendingAction === "phone") {
            success = await updatePhone(data.phone || "", passwordData.password);
        }

        if (success) {
            setIsPasswordDialogOpen(false);
            passwordForm.reset();
            setPendingAction(null);
        }
        setIsSubmitting(false);
    }

    const handleActionClick = (action: "email" | "phone") => {
        const currentValues = form.getValues();
        const originalValue = action === "email" ? user?.email : user?.phone;

        if (currentValues[action] === originalValue) {
            toast({
                title: "Sin cambios",
                description: `El ${action === "email" ? "correo" : "teléfono"} no ha cambiado.`,
            });
            return;
        }

        setPendingAction(action);
        setIsPasswordDialogOpen(true);
    };

    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Form {...form}>
                <div className="space-y-6">
                    {/* Sección: Información Personal */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <User className="h-5 w-5 text-primary" />
                            <h3>Información Personal</h3>
                        </div>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Input disabled={isSubmitting} placeholder="Tu nombre" {...field} />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={form.handleSubmit(onGeneralSubmit)}
                                                disabled={isSubmitting || field.value === user?.name}
                                            >
                                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                                Actualizar
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>

                    <Separator />

                    {/* Sección: Contacto */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Mail className="h-5 w-5 text-primary" />
                            <h3>Contacto</h3>
                        </div>
                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input disabled={isSubmitting} placeholder="correo@ejemplo.com" {...field} />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleActionClick("email")}
                                                    disabled={isSubmitting || field.value === user?.email}
                                                >
                                                    Cambiar
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input disabled={isSubmitting} placeholder="+34 600..." {...field} />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleActionClick("phone")}
                                                    disabled={isSubmitting || field.value === user?.phone}
                                                >
                                                    Cambiar
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </section>

                    <Separator />

                    {/* Sección: Seguridad */}
                    <section className="space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Lock className="h-5 w-5 text-primary" />
                            <h3>Seguridad</h3>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                            ¿Quieres cambiar tu contraseña? Te enviaremos un correo para que puedas reestablecerla de forma segura.
                        </p>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => user?.email && createRecovery(user.email)}
                            className="w-full sm:w-auto"
                        >
                            <Key className="mr-2 h-4 w-4" />
                            Solicitar Cambio de Contraseña
                        </Button>
                    </section>
                </div>
            </Form>

            {/* Diálogo de Confirmación de Contraseña */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar cambios</DialogTitle>
                        <DialogDescription>
                            Para actualizar tu {pendingAction === "email" ? "correo electrónico" : "número de teléfono"}, debes introducir tu contraseña actual por seguridad.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onSensitiveSubmit)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsPasswordDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirmar y Guardar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
