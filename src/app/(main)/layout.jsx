'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";

export default function MainLayout({ children }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>;
    }

    return (
        <div className="flex min-h-screen overflow-x-hidden">
            <Sidebar />
            <div className="flex-1 lg:pl-[280px] flex flex-col transition-all duration-300 min-w-0 w-full max-w-full overflow-x-hidden">
                <Header />
                <main className="p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
