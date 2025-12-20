"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useStore";

// --- ИКОНКИ ---
const Icons = {
    Logo: () => (
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <span className="font-bold text-white">O</span>
        </div>
    ),
    Board: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
    Profile: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user, fetchUser, isLoading } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // 1. Сначала ищем токен в URL (от Google)
            const tokenFromUrl = searchParams.get('token');
            let currentToken = localStorage.getItem("token");

            if (tokenFromUrl) {
                // Если пришли от Google — сохраняем токен
                localStorage.setItem("token", tokenFromUrl);
                currentToken = tokenFromUrl;

                // ВАЖНО: Используем history API для тихой очистки URL без перезагрузки страницы
                // Это предотвращает лишние ререндеры и "гонки"
                window.history.replaceState(null, '', '/dashboard');
            }

            // 2. Если токена нет нигде — редирект на вход
            if (!currentToken) {
                router.replace("/signin");
                return;
            }

            // 3. Если токен есть, но юзер не загружен — грузим
            // (Даже если мы только что получили токен от Google)
            if (!user) {
                try {
                    await fetchUser();
                    // Если fetchUser упадет (например, бэкенд вернет 401/500),
                    // стор очистит токен, и при следующем рендере сработает проверка !currentToken
                } catch (error) {
                    console.error("Auth error:", error);
                }
            }

            setIsChecking(false);
        };

        initAuth();
    }, []); // Пустой массив зависимостей, чтобы сработать один раз при маунте

    // Пока идет проверка или загрузка юзера — показываем лоадер
    if (isChecking || (isLoading && !user)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-500 text-sm animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    // Если проверка прошла, но юзера все равно нет (значит fetchUser упал) — не рендерим контент
    // useEffect перенаправит на signin, но чтобы не мелькал контент, вернем null
    if (!user) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden selection:bg-purple-500/30">

            {/* --- SIDEBAR --- */}
            <aside className="w-20 lg:w-64 bg-zinc-900/40 border-r border-white/5 flex flex-col justify-between p-4 backdrop-blur-xl z-20 shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-10 px-2 mt-2">
                        <Icons.Logo />
                        <span className="font-semibold text-lg tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              OmniAI Desk
            </span>
                    </div>

                    <nav className="space-y-2">
                        <Link href="/dashboard">
                            <div className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${isActive('/dashboard') ? 'bg-purple-500/10 text-purple-200 border border-purple-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                                <Icons.Board />
                                <span className="hidden lg:block font-medium">Pipeline</span>
                            </div>
                        </Link>

                        <Link href="/dashboard/profile">
                            <div className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${isActive('/dashboard/profile') ? 'bg-purple-500/10 text-purple-200 border border-purple-500/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                                <Icons.Profile />
                                <span className="hidden lg:block font-medium">My Profile</span>
                            </div>
                        </Link>
                    </nav>
                </div>

                <Link href="/profile" className="pt-4 border-t border-white/5 group">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/10">
                                {user?.first_name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}

                        <div className="hidden lg:block overflow-hidden">
                            <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors truncate">
                                {user?.first_name} {user?.last_name}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">View Profile</div>
                        </div>
                    </div>
                </Link>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
                {children}
            </main>

        </div>
    );
}