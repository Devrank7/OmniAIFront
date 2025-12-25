"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
export const dynamic = "force-dynamic";
// --- ИКОНКИ (Слегка обновленные для стиля) ---
const Icons = {
    Logo: () => (
        <div className="w-9 h-9 relative group">
            <div className="absolute inset-0 bg-purple-600 blur-[10px] opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-inner border border-white/20">
                <span className="font-bold text-white text-lg">O</span>
            </div>
        </div>
    ),
    Board: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
    Profile: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Brain: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    CreditCard: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    ChevronRight: (props: any) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
};

// --- КОМПОНЕНТ ПУНКТА МЕНЮ С АНИМАЦИЕЙ ---
const NavItem = ({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive: boolean }) => {
    return (
        <Link href={href} className="relative group block w-full">
            {isActive && (
                <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
            <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'text-purple-300' : 'text-zinc-400 group-hover:text-white'}`}>
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'group-hover:scale-110'}`} />
                <span className="font-medium text-sm tracking-wide">{label}</span>

                {/* Glow Dot for active */}
                {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_currentColor]" />}
            </div>
        </Link>
    );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user, fetchUser, isLoading } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);

    // --- AUTH LOGIC (Без изменений, свернуто для краткости) ---
    useEffect(() => {
        const initAuth = async () => {
            const tokenFromUrl = searchParams.get('token');
            let currentToken = localStorage.getItem("token");

            if (tokenFromUrl) {
                localStorage.setItem("token", tokenFromUrl);
                currentToken = tokenFromUrl;
                window.history.replaceState(null, '', '/dashboard');
            }

            if (!currentToken) {
                router.replace("/signin");
                return;
            }

            let currentUser = useUserStore.getState().user;
            if (!currentUser || (currentUser && !currentUser.business_context)) {
                try {
                    await fetchUser();
                    currentUser = useUserStore.getState().user;
                } catch (error) {
                    console.error("Auth error:", error);
                }
            }

            if (currentUser && !currentUser.business_context) {
                router.replace("/onboarding");
                return;
            }
            setIsChecking(false);
        };
        initAuth();
    }, []);

    if (isChecking || (isLoading && !user)) {
        return (
            <div className="min-h-screen bg-[#020202] flex items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-zinc-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex overflow-hidden selection:bg-purple-500/30">

            {/* Global Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[9999]" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}} />

            {/* --- SIDEBAR --- */}
            <aside className="w-20 lg:w-72 bg-[#09090b]/60 backdrop-blur-2xl border-r border-white/5 flex flex-col justify-between p-4 z-50 transition-all duration-300 relative">

                {/* Logo Area */}
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2 mt-2">
                        <Icons.Logo />
                        <div className="hidden lg:flex flex-col">
                            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                                OmniAI Desk
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Workspace</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        <p className="hidden lg:block px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 mt-6">Menu</p>

                        <NavItem href="/dashboard" icon={Icons.Board} label="Pipeline" isActive={isActive('/dashboard')} />
                        <NavItem href="/dashboard/context" icon={Icons.Brain} label="Business Context" isActive={isActive('/dashboard/context')} />

                        <p className="hidden lg:block px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 mt-6">Settings</p>

                        <NavItem href="/profile" icon={Icons.Profile} label="My Profile" isActive={isActive('/dashboard/profile')} />
                        <NavItem href="/dashboard/subscription" icon={Icons.CreditCard} label="Subscription" isActive={isActive('/dashboard/subscription')} />
                    </nav>
                </div>

                {/* User Footer Card */}
                <div className="pt-4 border-t border-white/5">
                    <Link href="/profile">
                        <div className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden">
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-sm font-bold text-white shrink-0 border border-white/10 shadow-inner">
                                        {user?.first_name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                                {/* Online Status */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#09090b] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            </div>

                            <div className="hidden lg:block overflow-hidden relative z-10 flex-1">
                                <div className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                                    {user?.first_name} {user?.last_name}
                                </div>
                                <div className="text-xs text-zinc-500 group-hover:text-zinc-400 truncate flex items-center gap-1">
                                    {user.is_premium ? 'Pro Plan' : 'Free Plan'}
                                </div>
                            </div>

                            <div className="hidden lg:block text-zinc-600 group-hover:text-white transition-colors">
                                <Icons.ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-black/90">
                {/* Background Glows for Main Area */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none opacity-30" />

                {children}
            </main>

        </div>
    );
}