import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export const metadata = {
    title: "JS Mart | Admin Panel",
    description: "Advanced e-commerce admin dashboard",
};

import { ModalProvider } from "@/components/providers/ModalProvider";

import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
                <AuthProvider>
                    <ModalProvider>
                        {children}
                        <Toaster position="top-center" />
                    </ModalProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
