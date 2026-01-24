import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function MainLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 lg:pl-[280px] flex flex-col transition-all duration-300">
                <Header />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
