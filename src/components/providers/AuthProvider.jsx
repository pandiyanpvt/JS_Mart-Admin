"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/api";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const isAuthenticated = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();

        if (isAuthenticated && currentUser) {
            setUser(currentUser);
        } else {
            setUser(null);
            // Redirect to login if not on login page
            if (pathname !== "/login") {
                router.push("/login");
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}
