import { Outfit } from "next/font/google";
import "./globals.css";

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
                {children}
            </body>
        </html>
    );
}
