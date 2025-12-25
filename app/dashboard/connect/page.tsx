"use client";

// Эта настройка обязательна
import {PlatformDetailsModal} from "@/app/dashboard/page";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Оставляем useSearchParams, теперь он безопасен
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";

import BotDetailsModal from "../components/BotDetailsModal";

// --- ТИПЫ ---
interface TelegramInfo { _id: string; number: string; is_active: boolean; createdAt: string; }
interface BotInfo { _id: string; bot_token: string; start_message: string; createdAt: string; }

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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { user, isLoading } = useUserStore();
    const router = useRouter();

    // Даже если мы просто вызываем хук, Next.js может ругаться.
    // Наличие loading.tsx рядом решает эту проблему.
    const searchParams = useSearchParams();

    const [telegramData, setTelegramData] = useState<TelegramInfo | null>(null);
    const [botData, setBotData] = useState<BotInfo | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [openModal, setOpenModal] = useState<'telegram' | 'bot' | null>(null);

    useEffect(() => {
        if (!isLoading && user) {
            if (!user.is_premium) {
                router.replace('/pricing?error=premium_required');
                return;
            }
            fetchPlatforms();
        }
    }, [user, isLoading, router]);

    const fetchPlatforms = async () => {
        try {
            const token = localStorage.getItem("token");
            const [tgRes, botRes] = await Promise.all([
                fetch(`${API_URL}/telegram`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/telegram-bot`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            if (tgRes.ok) {
                const tgJson = await tgRes.json();
                if (tgJson.platform) setTelegramData(tgJson.platform);
                else setTelegramData(null);
            }

            if (botRes.ok) {
                const botJson = await botRes.json();
                if (botJson.platform) setBotData(botJson.platform);
                else setBotData(null);
            }
        } catch (e) {
            console.error("Error fetching platforms", e);
        } finally {
            setIsFetching(false);
        }
    };

    const handleCardClick = (platformId: string) => {
        if (platformId === 'telegram' && telegramData) {
            setOpenModal('telegram');
        } else if (platformId === 'telegram-bot' && botData) {
            setOpenModal('bot');
        } else {
            router.push(`/dashboard/connect/${platformId}`);
        }
    };

    const handleDisconnectBot = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_URL}/telegram-bot`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setBotData(null);
            setOpenModal(null);
        } catch (e) { console.error(e); }
    };

    const handleCloseTgModal = () => {
        setOpenModal(null);
        fetchPlatforms();
    };

    if (isLoading || (user && !user.is_premium)) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 lg:p-12 overflow-y-auto relative">
            <AnimatePresence>
                {openModal === 'telegram' && telegramData && (
                    <PlatformDetailsModal platform={telegramData} onClose={handleCloseTgModal} />
                )}
                {openModal === 'bot' && botData && (
                    <BotDetailsModal bot={botData} onClose={() => setOpenModal(null)} onDisconnect={handleDisconnectBot} />
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Connect Platform</h1>
                <p className="text-zinc-400 mb-8">Manage your communication channels.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Platforms.map((platform) => {
                        let isConnected = false;
                        if (platform.id === 'telegram' && telegramData) isConnected = true;
                        if (platform.id === 'telegram-bot' && botData) isConnected = true;

                        return (
                            <motion.div
                                key={platform.id}
                                whileHover={!platform.disabled ? { scale: 1.02 } : {}}
                                whileTap={!platform.disabled ? { scale: 0.98 } : {}}
                                onClick={() => !platform.disabled && handleCardClick(platform.id)}
                                className={`
                                    relative bg-[#09090b] border rounded-2xl p-6 h-48 flex flex-col justify-between overflow-hidden cursor-pointer transition-all
                                    ${platform.disabled ? 'cursor-not-allowed opacity-50 border-white/10' : ''}
                                    ${isConnected ? 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-white/10 hover:border-white/20'}
                                `}
                            >
                                {isConnected && (
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full z-20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
                                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wide">Connected</span>
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-xl ${platform.color} bg-opacity-20 flex items-center justify-center text-white mb-4 relative z-10 border border-white/5`}>
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d={platform.icon} /></svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {isConnected ? <span className="text-zinc-300">Click to manage settings</span> : (platform.description || (platform.disabled ? 'Coming Soon' : 'Available'))}
                                    </p>
                                </div>
                                <div className={`absolute top-[-50%] right-[-50%] w-full h-full ${platform.color} opacity-20 blur-[80px] group-hover:opacity-40 transition-opacity duration-500`} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}