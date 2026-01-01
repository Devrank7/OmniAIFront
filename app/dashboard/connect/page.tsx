"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";
import BotDetailsModal from "../components/BotDetailsModal";
import { PlatformDetailsModal } from "@/app/dashboard/page"; // Импорт из родителя (если там экспортируется)

export const dynamic = "force-dynamic";

// --- ТИПЫ ---
interface TelegramInfo { _id: string; number: string; is_active: boolean; createdAt: string; }
interface BotInfo { _id: string; bot_token: string; start_message: string; createdAt: string; }

// --- КОНФИГУРАЦИЯ ПЛАТФОРМ (Изменен порядок и стили) ---
const Platforms = [
    {
        id: 'telegram-bot', // 1. СТАВИМ БОТА ПЕРВЫМ
        name: 'Telegram Bot API',
        description: 'Best for business automation & teams.',
        // Градиентный фон для выделения
        gradient: 'bg-gradient-to-br from-blue-600 to-purple-600',
        // Более "жирный" эффект свечения
        glow: 'from-blue-500 to-purple-500',
        // Бейдж "Рекомендуется"
        isRecommended: true,
        icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>, // Иконка "Бота" (инфо) - можно заменить на что-то более роботоподобное, если есть
    },
    {
        id: 'telegram', // 2. Личный аккаунт теперь второй
        name: 'Personal Telegram',
        description: 'Connect your own account',
        color: 'bg-sky-500',
        glow: 'sky-500',
        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z"/></svg>
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Official API connection.',
        color: 'bg-green-500',
        glow: 'green-500',
        disabled: true,
        // 3. Нормальная иконка WhatsApp
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
    },
    {
        id: 'instagram',
        name: 'Instagram Direct',
        description: 'Connect via Facebook.',
        color: 'bg-pink-500',
        glow: 'pink-500',
        disabled: true,
        // 4. Нормальная иконка Instagram
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
    },
];

function ConnectPlatformContent() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { user, isLoading } = useUserStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [telegramData, setTelegramData] = useState<TelegramInfo | null>(null);
    const [botData, setBotData] = useState<BotInfo | null>(null);
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
                setTelegramData(tgJson.platform || null);
            }
            if (botRes.ok) {
                const botJson = await botRes.json();
                setBotData(botJson.platform || null);
            }
        } catch (e) {
            console.error("Error fetching platforms", e);
        }
    };

    const handleCardClick = (platformId: string) => {
        if (platformId === 'telegram' && telegramData) setOpenModal('telegram');
        else if (platformId === 'telegram-bot' && botData) setOpenModal('bot');
        else router.push(`/dashboard/connect/${platformId}`);
    };

    const handleDisconnectBot = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_URL}/telegram-bot`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            setBotData(null);
            setOpenModal(null);
        } catch (e) { console.error(e); }
    };

    const handleCloseTgModal = () => {
        setOpenModal(null);
        fetchPlatforms();
    };

    if (isLoading || (user && !user.is_premium)) {
        return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="flex-1 p-6 lg:p-12 overflow-y-auto relative">
            <AnimatePresence>
                {openModal === 'telegram' && telegramData && (<PlatformDetailsModal platform={telegramData} onClose={handleCloseTgModal} />)}
                {openModal === 'bot' && botData && (<BotDetailsModal bot={botData} onClose={() => setOpenModal(null)} onDisconnect={handleDisconnectBot} />)}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Connect Platform</h1>
                <p className="text-zinc-400 mb-10">Choose a channel to start automating responses.</p>

                {/* 5. ИЗМЕНЕННАЯ СЕТКА: Бот занимает 2 колонки на больших экранах */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    {Platforms.map((platform) => {
                        let isConnected = false;
                        if (platform.id === 'telegram' && telegramData) isConnected = true;
                        if (platform.id === 'telegram-bot' && botData) isConnected = true;

                        // Классы для "Рекомендованной" карточки (Бота)
                        const recommendedClasses = platform.isRecommended
                            ? "lg:col-span-2 lg:row-span-1 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]" // Увеличиваем и подсвечиваем
                            : "";

                        // Фон для иконки: либо градиент, либо просто цвет
                        const iconBgClass = platform.gradient || platform.color || 'bg-zinc-800';

                        return (
                            <motion.div
                                key={platform.id}
                                whileHover={!platform.disabled ? { scale: 1.02, translateY: -4 } : {}}
                                whileTap={!platform.disabled ? { scale: 0.98 } : {}}
                                onClick={() => !platform.disabled && handleCardClick(platform.id)}
                                className={`
                                    relative bg-[#09090b] border rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden cursor-pointer transition-all
                                    ${platform.disabled ? 'cursor-not-allowed opacity-50 border-white/10 grayscale' : ''}
                                    ${isConnected ? 'border-green-500/40' : 'border-white/10 hover:border-white/25'}
                                    ${recommendedClasses}
                                `}
                            >
                                {/* Бейдж "Connected" */}
                                {isConnected && (
                                    <div className="absolute top-6 right-6 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full z-20 backdrop-blur-md">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"/>
                                        <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Connected</span>
                                    </div>
                                )}

                                {/* Бейдж "Recommended" (только для бота, если не подключен) */}
                                {!isConnected && platform.isRecommended && (
                                    <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 rounded-full z-20 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-300"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" /></svg>
                                        <span className="text-xs font-bold text-white uppercase tracking-wide">Recommended</span>
                                    </div>
                                )}

                                {/* Иконка */}
                                <div className={`w-16 h-16 rounded-2xl ${iconBgClass} flex items-center justify-center text-white mb-6 relative z-10 shadow-xl ${platform.gradient ? '' : 'bg-opacity-20 border border-white/10'}`}>
                                    {platform.icon}
                                </div>

                                {/* Текст */}
                                <div className="relative z-10">
                                    <h3 className={`text-2xl font-bold text-white mb-2 ${platform.isRecommended ? 'text-3xl' : ''}`}>{platform.name}</h3>
                                    <p className="text-zinc-400 font-medium leading-relaxed">
                                        {isConnected ? <span className="text-green-400/80">Click to manage settings & webhook</span> : (platform.description || 'Coming Soon')}
                                    </p>
                                </div>

                                {/* Фоновое свечение */}
                                <div className={`absolute -inset-[50%] w-[200%] h-[200%] bg-gradient-to-br ${platform.glow ? `from-${platform.glow.split(' ')[0]}/20 to-${platform.glow.split(' ')[2]}/20` : 'from-zinc-800/20 to-zinc-900/20'} opacity-30 blur-[100px] pointer-events-none group-hover:opacity-50 transition-opacity duration-500`} />

                                {!platform.disabled && !isConnected && (
                                    <div className="mt-8 relative z-10">
                                        <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                                            ${platform.isRecommended
                                            ? 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-blue-500/20'
                                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
                                        }`}>
                                            Connect Now
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function ConnectPlatformPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" /></div>}>
            <ConnectPlatformContent />
        </Suspense>
    );
}