"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ConnectTelegramBotPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

    const [token, setToken] = useState("");
    const [startMessage, setStartMessage] = useState("Hello! I am your AI assistant. How can I help?");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

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
                body: JSON.stringify({ token, start_message: startMessage }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            // Успех -> Возвращаемся в дашборд
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to connect bot");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-[#09090b] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Connect Telegram Bot</h1>
                        <p className="text-sm text-zinc-400">Use @BotFather to get your token</p>
                    </div>
                </div>

                <form onSubmit={handleConnect} className="space-y-6">
                    {/* Token Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Bot Token</label>
                        <input
                            type="text"
                            placeholder="123456789:ABCdefGHIjklMNOpqrs..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                        />
                    </div>

                    {/* Start Message Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Start Message (/start)</label>
                        <textarea
                            rows={4}
                            placeholder="Message sent to users when they start the bot..."
                            value={startMessage}
                            onChange={(e) => setStartMessage(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none text-sm leading-relaxed"
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Connect Bot"
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}