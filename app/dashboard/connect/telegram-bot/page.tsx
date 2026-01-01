"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";

// Иконки
const Icons = {
    Bot: () => <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
    Help: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Paste: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    External: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
    Close: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function ConnectTelegramBotPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { fetchUser } = useUserStore();

    const [token, setToken] = useState("");
    const [startMessage, setStartMessage] = useState("Hello! I am your AI assistant. How can I help?");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showGuide, setShowGuide] = useState(false); // По умолчанию скрыто

    const isValidTokenFormat = (t: string) => /^\d+:[A-Za-z0-9_-]{35,}$/.test(t.trim());

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setToken(text.trim());
        } catch (err) {
            console.error("Failed to read clipboard", err);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanToken = token.trim();

        if (!isValidTokenFormat(cleanToken)) {
            setError("Invalid token format. It should look like '123456:ABC-def...'");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const authToken = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/telegram-bot/connect`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ token: cleanToken, start_message: startMessage }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            await fetchUser();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to connect bot. Please check the token.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-[#050505] relative overflow-hidden min-h-screen font-sans">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none" />

            {/* MAIN CONTAINER: Динамически расширяется */}
            <motion.div
                layout // Включает плавную анимацию изменения размеров
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden"
                style={{ maxWidth: showGuide ? '1000px' : '500px' }} // Меняем ширину
            >
                {/* --- LEFT SIDE: FORM --- */}
                <motion.div layout className="flex-1 p-8 md:p-10 flex flex-col justify-center min-w-[350px]">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                            <Icons.Bot />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Connect Bot</h1>
                            <p className="text-sm text-zinc-400">Automate via Telegram API</p>
                        </div>
                    </div>

                    <form onSubmit={handleConnect} className="space-y-6">

                        {/* Token Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Bot Token</label>

                                {/* Кнопка открытия гайда (меняется текст если открыто) */}
                                <button
                                    type="button"
                                    onClick={() => setShowGuide(!showGuide)}
                                    className={`text-xs flex items-center gap-1.5 transition-colors ${showGuide ? 'text-indigo-300' : 'text-indigo-400 hover:text-indigo-300'}`}
                                >
                                    {showGuide ? (
                                        <>Close Guide <Icons.Close /></>
                                    ) : (
                                        <><Icons.Help /> Where do I get this?</>
                                    )}
                                </button>
                            </div>

                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Paste token here (e.g., 12345:ABC...)"
                                    value={token}
                                    onChange={(e) => { setToken(e.target.value); setError(""); }}
                                    className={`w-full bg-black/40 border rounded-xl px-4 py-3.5 pr-10 text-white placeholder-zinc-700 focus:outline-none transition-all font-mono text-sm ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-indigo-500/50 focus:bg-black/60'}`}
                                />
                                <button
                                    type="button"
                                    onClick={handlePaste}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1.5 bg-white/5 rounded-lg hover:bg-white/10"
                                    title="Paste"
                                >
                                    <Icons.Paste />
                                </button>
                            </div>
                            {token && !isValidTokenFormat(token) && (
                                <p className="text-xs text-yellow-500/80 ml-1">⚠️ Incorrect format. Token should contain digits, a colon, and letters.</p>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Start Message</label>
                            <textarea
                                rows={3}
                                placeholder="Hello! How can I help you today?"
                                value={startMessage}
                                onChange={(e) => setStartMessage(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:bg-black/60 transition-all resize-none text-sm leading-relaxed"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !token || !isValidTokenFormat(token)}
                            className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Connect & Start"}
                        </button>
                    </form>
                </motion.div>

                {/* --- RIGHT SIDE: GUIDE (Animated Panel) --- */}
                <AnimatePresence>
                    {showGuide && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="bg-zinc-900/50 border-l border-white/5 overflow-hidden flex flex-col md:w-[400px]" // Фиксируем ширину панели
                        >
                            <div className="p-8 min-w-[320px] h-full flex flex-col justify-center">
                                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-3">
                                    <span className="bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg shadow-indigo-500/30">?</span>
                                    How to get a Token
                                </h3>

                                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                    {[
                                        {
                                            text: <span>Open Telegram and search for <a href="https://t.me/BotFather" target="_blank" className="text-indigo-400 hover:underline font-bold">@BotFather</a></span>
                                        },
                                        {
                                            text: <span>Send the command <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-xs">/newbot</code></span>
                                        },
                                        {
                                            text: "Enter a name for your bot."
                                        },
                                        {
                                            text: "Enter a username (must end in 'bot')."
                                        },
                                        {
                                            text: <span>Copy the <b>HTTP API Token</b> and paste it here.</span>
                                        }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-4 relative z-10">
                                            <div className="w-6 h-6 rounded-full bg-[#09090b] border border-white/20 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-zinc-300 leading-snug pt-0.5">
                                                {step.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <p className="text-xs text-indigo-300 leading-relaxed">
                                        <b>Pro Tip:</b> If you already have a bot, just send <code className="text-white font-bold">/mybots</code> to BotFather, select your bot, and click <b>API Token</b>.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}