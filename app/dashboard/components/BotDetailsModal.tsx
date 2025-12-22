"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface BotInfo {
    _id: string;
    bot_token: string;
    start_message: string;
    createdAt: string;
}

const Icons = {
    Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Bot: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
};

export default function BotDetailsModal({ bot, onClose, onDisconnect }: { bot: BotInfo, onClose: () => void, onDisconnect: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect your bot?")) return;
        setLoading(true);
        await onDisconnect();
        setLoading(false);
    };

    // Маскируем токен (показываем только начало и конец)
    const maskedToken = bot.bot_token
        ? `${bot.bot_token.substring(0, 10)}...${bot.bot_token.substring(bot.bot_token.length - 5)}`
        : "Hidden";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-[#09090b] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] pointer-events-none" />

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                            <Icons.Bot />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Telegram Bot</h3>
                            <p className="text-sm text-green-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> Active
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Icons.Close /></button>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Bot Token</p>
                        <p className="text-white font-mono text-sm tracking-wide break-all">{maskedToken}</p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Start Message</p>
                        <p className="text-zinc-300 text-sm italic">"{bot.start_message}"</p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 flex justify-between">
                        <span className="text-xs text-zinc-500 uppercase font-semibold">Connected At</span>
                        <span className="text-zinc-300 text-xs">{new Date(bot.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mt-8 flex gap-3 relative z-10">
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/5">Close</button>
                    <button
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? "Disconnecting..." : "Disconnect"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}