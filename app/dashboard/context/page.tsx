"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useStore";

// Иконка сохранения
const SaveIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

export default function BusinessContextPage() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { user, fetchUser } = useUserStore();

    // Инициализируем текст из user.business_context
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Как только юзер загрузился, подставляем его контекст
    useEffect(() => {
        if (user && user.business_context) {
            setText(user.business_context);
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/users/onboarding`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ business_context: text }),
            });

            if (res.ok) {
                setSaved(true);
                // Важно: обновляем пользователя в сторе, чтобы данные были свежими
                await fetchUser();
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505] p-8 overflow-hidden relative">

            {/* Background FX */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-end mb-6 z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Business Knowledge Base</h1>
                    <p className="text-zinc-400 text-sm max-w-2xl">
                        This is the brain of your AI. Update this information anytime to improve the quality of AI responses.
                        Describe your products, pricing, tone of voice, and common FAQs.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={loading}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all
                        ${saved
                        ? "bg-green-500 text-black hover:bg-green-400 shadow-green-500/20"
                        : "bg-white text-black hover:bg-zinc-200 shadow-white/10"
                    }
                    `}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                    ) : saved ? (
                        <><span>Saved!</span> <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></>
                    ) : (
                        <><span>Save Changes</span> <SaveIcon /></>
                    )}
                </motion.button>
            </div>

            {/* Editor Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 relative z-10"
            >
                <div className="absolute inset-0 bg-[#09090b] border border-white/10 rounded-2xl p-1 shadow-2xl ring-1 ring-white/5">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-full bg-transparent text-zinc-200 p-6 resize-none focus:outline-none text-base leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent placeholder-zinc-700 font-mono"
                        placeholder="Start typing your business context here..."
                        spellCheck={false}
                    />

                    {/* Stats Footer inside the box */}
                    <div className="absolute bottom-4 right-6 text-xs text-zinc-600 font-mono bg-[#09090b]/80 px-2 py-1 rounded backdrop-blur">
                        {text.length.toLocaleString()} / 1,000,000 chars
                    </div>
                </div>
            </motion.div>

        </div>
    );
}