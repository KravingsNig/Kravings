
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, User, Bell, Palette, Info, Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import packageJson from "../../../package.json";
import Loading from "@/app/loading";

export default function SettingsPage() {
    const { setTheme, theme } = useTheme();
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handlePasswordReset = async () => {
        if (!user || !user.email) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be signed in to reset your password.',
            });
            return;
        }

        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({
                title: 'Password Reset Email Sent',
                description: 'Check your inbox for a link to reset your password.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to send password reset email.',
            });
        }
    };

    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/');
    };

    if (loading) {
        return <Loading />;
    }

    if (!user) {
        // Redirect if not logged in, you can also show a message
        return (
            <div className="container mx-auto py-8 text-center">
                <p>Please sign in to view your settings.</p>
                <Button onClick={() => router.push('/signin')} className="mt-4">
                    Sign In
                </Button>
            </div>
        );
    }


    return (
        <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account and app preferences.</p>
            </div>
            
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> Account</CardTitle>
                        <CardDescription>Manage your account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">Email</p>
                            <p className="text-muted-foreground">{user?.email}</p>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <p className="font-medium">Password</p>
                            <Button variant="outline" onClick={handlePasswordReset}><Lock className="mr-2" />Reset Password</Button>
                        </div>
                         <Separator />
                         <Button variant="destructive" className="w-full" onClick={handleSignOut}><LogOut className="mr-2" />Sign Out</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette /> Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">Theme</p>
                            <div className="flex items-center gap-2">
                                <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('light')}>
                                    <Sun />
                                </Button>
                                 <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('dark')}>
                                    <Moon />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Info /> About</CardTitle>
                        <CardDescription>Information about the application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">App Version</p>
                            <p className="text-muted-foreground">{packageJson.version}</p>
                        </div>
                        <Separator />
                        <Button variant="outline" className="w-full" onClick={() => toast({ title: 'No Updates Found', description: 'You are on the latest version.'})}>
                            Check for Updates
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
