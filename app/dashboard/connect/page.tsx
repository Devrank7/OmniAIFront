"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useStore"; // <--- Импорт стора
import { useRouter } from "next/navigation";     // <--- Импорт роутера

const Platforms = [
    {
        id: 'telegram',
        name: 'Telegram User',
        description: 'Connect your personal account',
        color: 'bg-blue-500',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z'
    },
    {
        id: 'telegram-bot',
        name: 'Telegram Bot API',
        description: 'Connect via @BotFather token',
        color: 'bg-indigo-500',
        icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
    },
    { id: 'whatsapp', name: 'WhatsApp', description: 'Business API', color: 'bg-green-500', disabled: true },
    { id: 'instagram', name: 'Instagram', description: 'Direct Messages', color: 'bg-pink-500', disabled: true },
];

export default function ConnectPlatformPage() {
    const { user, isLoading } = useUserStore();
    const router = useRouter();

    // --- ПРОВЕРКА ПОДПИСКИ ---
    useEffect(() => {
        // Ждем пока загрузится юзер
        if (!isLoading && user) {
            // Если НЕ премиум — выкидываем на прайсинг
            if (!user.is_premium) {
                router.replace('/pricing?error=premium_required');
            }
        }
    }, [user, isLoading, router]);

    // Показываем спиннер, пока идет проверка или если юзер не премиум (чтобы не мелькал контент перед редиректом)
    if (isLoading || (user && !user.is_premium)) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Connect Platform</h1>
                <p className="text-zinc-400 mb-8">Choose a communication channel to integrate with your AI CRM.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Platforms.map((platform) => (
                        <Link
                            key={platform.id}
                            href={platform.disabled ? '#' : `/dashboard/connect/${platform.id}`}
                            className={`block relative group ${platform.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <motion.div
                                whileHover={!platform.disabled ? { scale: 1.02 } : {}}
                                whileTap={!platform.disabled ? { scale: 0.98 } : {}}
                                className="bg-[#09090b] border border-white/10 rounded-2xl p-6 h-48 flex flex-col justify-between overflow-hidden relative"
                            >
                                <div className={`w-12 h-12 rounded-xl ${platform.color} bg-opacity-20 flex items-center justify-center text-white mb-4 relative z-10 border border-white/5`}>
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d={platform.icon} /></svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {platform.description || (platform.disabled ? 'Coming Soon' : 'Available')}
                                    </p>
                                </div>
                                <div className={`absolute top-[-50%] right-[-50%] w-full h-full ${platform.color} opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-500`} />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}