"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";

// --- КОМПОНЕНТ МОДАЛКИ ВЫБОРА ЧАТОВ ---
interface ChatItem { id: string; name: string; username?: string; }

const SelectChatsModal = ({ onFinish }: { onFinish: () => void }) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Загружаем последние диалоги
    useEffect(() => {
        const fetchDialogs = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/telegram/dialogs`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setChats(data.dialogs);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDialogs();
    }, []);

    const toggleChat = (id: string) => {
        const newSet = new Set(ignoredIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setIgnoredIds(newSet);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            // Отправляем каждый выбранный чат в игнор
            // В идеале бэкенд должен принимать массив, но если нет - шлем по одному или меняем API
            // Предположим, у нас есть эндпоинт для массового игнора или цикл
            const promises = Array.from(ignoredIds).map(id =>
                fetch(`${API_URL}/telegram/ignore`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ chatId: id, ignore: true })
                })
            );
            await Promise.all(promises);
            onFinish();
        } catch (e) {
            console.error(e);
            onFinish(); // Даже если ошибка, пускаем дальше
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-[#09090b] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]"
            >
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">Who should the AI ignore?</h2>
                    <p className="text-sm text-zinc-400">Select personal chats (Mom, Friends, Work) to disable auto-replies.</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 mb-6">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin"/></div>
                    ) : chats.length === 0 ? (
                        <p className="text-center text-zinc-500 py-4">No recent chats found.</p>
                    ) : (
                        chats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => toggleChat(chat.id)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${ignoredIds.has(chat.id) ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${ignoredIds.has(chat.id) ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                        {chat.name[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className={`text-sm font-medium truncate ${ignoredIds.has(chat.id) ? 'text-red-200' : 'text-white'}`}>{chat.name}</span>
                                        {chat.username && <span className="text-xs text-zinc-500 truncate">@{chat.username}</span>}
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${ignoredIds.has(chat.id) ? 'bg-red-500 border-red-500' : 'border-zinc-600'}`}>
                                    {ignoredIds.has(chat.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={onFinish} className="flex-1 py-3 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors">
                        Skip for now
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2"
                    >
                        {saving ? "Saving..." : `Ignore ${ignoredIds.size} Chats & Finish`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// --- ГЛАВНАЯ СТРАНИЦА ---

export default function TelegramConnectPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { fetchUser } = useUserStore();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Новое состояние: Показывать ли модалку выбора чатов
    const [showChatSelection, setShowChatSelection] = useState(false);

    // Логика завершения процесса
    const handleSuccess = async () => {
        await fetchUser();
        // Вместо редиректа - открываем модалку
        setShowChatSelection(true);
    };

    const handleFinalRedirect = () => {
        router.push("/dashboard?connected=true");
    };

    // ШАГ 1
    const handleSendPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/telegram/send-code`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setStep(2);
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    // ШАГ 2
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/telegram/verify-code`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            if (data.requires2FA) setStep(3);
            else handleSuccess(); // <--- УСПЕХ
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    // ШАГ 3
    const handleVerifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/telegram/verify-password`, {
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            handleSuccess(); // <--- УСПЕХ
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 relative">

            {/* МОДАЛКА ВЫБОРА ЧАТОВ */}
            <AnimatePresence>
                {showChatSelection && (
                    <SelectChatsModal onFinish={handleFinalRedirect} />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative z-10"
            >
                {/* ... (Твой старый дизайн формы: иконка, заголовок, инпуты) ... */}
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z" /></svg>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-2">Connect Telegram</h2>
                <p className="text-center text-zinc-400 text-sm mb-8">
                    {step === 1 && "Enter your phone number to start"}
                    {step === 2 && `Enter the code sent to ${phone}`}
                    {step === 3 && "Enter your Cloud Password (2FA)"}
                </p>

                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded text-center">{error}</div>}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form key="step1" onSubmit={handleSendPhone} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: 20, opacity: 0}}>
                            <input
                                type="text" placeholder="+1234567890"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-blue-500 outline-none transition-colors"
                                value={phone} onChange={e => setPhone(e.target.value)} required
                            />
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                                {loading ? "Sending..." : "Send Code"}
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form key="step2" onSubmit={handleVerifyCode} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: 20, opacity: 0}}>
                            <input
                                type="text" placeholder="12345"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-blue-500 outline-none text-center tracking-widest text-lg"
                                value={code} onChange={e => setCode(e.target.value)} required
                            />
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                                {loading ? "Verifying..." : "Verify Code"}
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form key="step3" onSubmit={handleVerifyPassword} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: 20, opacity: 0}}>
                            <input
                                type="password" placeholder="Cloud Password"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-blue-500 outline-none"
                                value={password} onChange={e => setPassword(e.target.value)} required
                            />
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                                {loading ? "Unlocking..." : "Submit Password"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}