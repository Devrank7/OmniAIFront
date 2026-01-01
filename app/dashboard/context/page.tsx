"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useStore";

// --- ШАБЛОНЫ И ПОДСКАЗКИ ---
const TEMPLATES = [
    {
        id: "ecommerce",
        icon: "🛍️",
        label: "Online Store",
        content: `Store Name: [Name]\n\nMain Products:\n- [Product A]: $[Price]\n- [Product B]: $[Price]\n\nShipping: Worldwide, 3-5 days.\nReturn Policy: 30 days money-back.`
    },
    {
        id: "agency",
        icon: "💼",
        label: "Agency",
        content: `Agency: [Name]\nServices: Web Design ($500+), SEO ($200/mo).\nProcess: 50% deposit, 2 weeks delivery.\nContact: email@example.com`
    },
    {
        id: "support",
        icon: "🎧",
        label: "Support Rules",
        content: `Operating Hours: Mon-Fri, 9AM - 6PM.\nEmergency Contact: +123456789\nRefunds: Processed within 24h.`
    }
];

const HINTS = [
    "💰 Price List",
    "🚚 Delivery Info",
    "📞 Contacts",
    "⏰ Working Hours",
    "❌ Cancellation Policy"
];

// Иконка сохранения
const SaveIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

export default function BusinessContextPage() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { user, fetchUser } = useUserStore();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const minLength = 50; // Снизил лимит для удобства
    const maxLength = 1_000_000;

    // Загрузка контекста при открытии страницы
    useEffect(() => {
        if (user && user.business_context) {
            setText(user.business_context);
        }
    }, [user]);

    // Функция вставки шаблона
    const applyTemplate = (content: string) => {
        if (text.length > 50 && !confirm("Append template to the end of your text?")) {
            return;
        }
        setText(prev => prev ? prev + "\n\n" + content : content);
    };

    const handleSave = async () => {
        if (text.length < minLength) return;
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
                await fetchUser(); // Обновляем глобальный стейт
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505] p-4 lg:p-8 overflow-hidden relative font-sans">

            {/* Background FX */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 z-10 gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Business Knowledge Base</h1>
                    <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
                        This is your AI's "Brain". The more specific details you provide here (prices, conditions, FAQ),
                        the smarter the AI replies will be.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={loading || text.length < minLength}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all min-w-[160px] justify-center
                        ${saved
                        ? "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        : text.length < minLength
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                            : "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    }
                    `}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                    ) : saved ? (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>Saved!</span>
                        </>
                    ) : text.length < minLength ? (
                        <span>Type more...</span>
                    ) : (
                        <><span>Save Changes</span> <SaveIcon /></>
                    )}
                </motion.button>
            </div>

            {/* --- MAIN CONTENT (Grid) --- */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 z-10"
            >
                {/* --- LEFT: EDITOR (3 cols) --- */}
                <div className="lg:col-span-3 flex flex-col bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">

                    {/* Quick Templates Bar */}
                    <div className="flex items-center gap-2 p-2 border-b border-white/5 bg-zinc-900/50 overflow-x-auto scrollbar-hide shrink-0">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide ml-2 mr-1">Templates:</span>
                        {TEMPLATES.map((tmpl) => (
                            <button
                                key={tmpl.id}
                                onClick={() => applyTemplate(tmpl.content)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-zinc-300 transition-colors whitespace-nowrap"
                            >
                                <span>{tmpl.icon}</span>
                                <span>{tmpl.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Text Area */}
                    <div className="relative flex-1 min-h-0">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-full bg-transparent text-zinc-200 p-6 resize-none focus:outline-none text-base leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent placeholder-zinc-700 font-mono"
                            placeholder={`Example:\n- Our premium plan costs $99/mo.\n- We offer a 30-day refund policy.\n- Contact support at help@omni.ai`}
                            spellCheck={false}
                        />

                        {/* Counter Widget */}
                        <div className={`absolute bottom-4 right-6 text-xs font-mono bg-[#09090b]/90 border px-2 py-1 rounded backdrop-blur transition-colors ${text.length < minLength ? 'text-red-400 border-red-500/30' : 'text-green-400 border-green-500/30'}`}>
                            {text.length < minLength
                                ? `Minimum ${minLength} chars (${text.length}/${minLength})`
                                : `Context Strength: Good (${text.length.toLocaleString()})`
                            }
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: SIDEBAR TIPS (1 col) --- */}
                <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-1">
                    <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl">
                        <h3 className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Key Information
                        </h3>
                        <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                            Ensure your AI knows these details to avoid manual interventions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {HINTS.map((hint, i) => (
                                <span key={i} className="px-2.5 py-1 bg-zinc-800 rounded-md text-[11px] text-zinc-300 border border-white/5">
                                    {hint}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <h3 className="text-blue-200 text-sm font-bold mb-2">Pro Tip 💡</h3>
                        <p className="text-xs text-blue-200/60 leading-relaxed">
                            Use a Q&A format for best results:<br/><br/>
                            <i>"Q: Do you offer refunds?<br/>
                                A: Yes, within 14 days."</i>
                        </p>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}