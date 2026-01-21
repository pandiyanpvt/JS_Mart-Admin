import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata = {
    title: "JS Mart | Admin Panel",
    description: "Advanced e-commerce admin dashboard",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${outfit.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
                <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex-1 lg:pl-[280px] flex flex-col transition-all duration-300">
                        <Header />
                        <main className="p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
