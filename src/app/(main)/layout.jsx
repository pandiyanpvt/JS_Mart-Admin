'use client';

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/api";
import { useBodyScrollLockObserver } from "@/hooks/useBodyScrollLock";

export default function MainLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useBodyScrollLockObserver();

    useEffect(() => {
        setMobileNavOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        if (mobileNavOpen) root.classList.add('admin-mobile-nav-open');
        else root.classList.remove('admin-mobile-nav-open');
        return () => root.classList.remove('admin-mobile-nav-open');
    }, [mobileNavOpen]);

    useEffect(() => {
        if (!mobileNavOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setMobileNavOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mobileNavOpen]);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login');
        } else {
            const user = authService.getCurrentUser();
            if (user?.role === 'DELIVERY_AGENT' && window.location.pathname !== '/delivery/agent') {
                router.push('/delivery/agent');
            }
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>;
    }

    const user = authService.getCurrentUser();
    const isDeliveryAgent = user?.role === 'DELIVERY_AGENT';

    if (isDeliveryAgent) {
        return (
            <div className="min-h-screen bg-slate-50">
                <main className="w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen overflow-x-hidden">
            {/* Drawer below lg; from lg–xl layout is compact (see globals.css 2xl for scale-up) */}
            <button
                type="button"
                aria-label="Close menu"
                className={`fixed inset-0 z-[35] bg-slate-900/50 backdrop-blur-[1px] transition-opacity lg:hidden ${mobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={() => setMobileNavOpen(false)}
            />
            <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
            <div className="flex min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden pl-0 transition-[padding] duration-300 ease-out lg:pl-[var(--admin-sidebar-width,280px)]">
                <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
                <main className="min-w-0 w-full max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-6 2xl:p-8 min-[1920px]:p-9 min-[2560px]:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
