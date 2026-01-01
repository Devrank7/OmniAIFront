"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/useStore";

// --- КОНСТАНТЫ И ШАБЛОНЫ ---

const TEMPLATES = [
    {
        id: "ecommerce",
        icon: "🛍️",
        label: "Online Store",
        content: `Store Name: [Name]\n\nMain Products:\n- [Product A]: $[Price]\n- [Product B]: $[Price]\n\nShipping Policy: We ship worldwide. Free shipping over $50. Delivery takes 3-5 days.\n\nReturn Policy: 30-day money-back guarantee.\n\nSupport Email: support@example.com`
    },
    {
        id: "agency",
        icon: "💼",
        label: "Service Agency",
        content: `Agency Name: [Name]\n\nServices We Offer:\n1. Web Design (starts at $500)\n2. SEO Optimization ($100/mo)\n3. Social Media Management\n\nHow we work: We take 50% prepayment. Turnaround time is usually 2 weeks.\n\nContact: +1 234 567 890`
    },
    {
        id: "coach",
        icon: "🎓",
        label: "Coach / Expert",
        content: `Expert Name: [Name]\n\nNiche: Fitness & Nutrition\n\nPrograms:\n- 1:1 Coaching: $200/month\n- Group Challenge: $50\n\nFAQ:\nQ: Do I need equipment?\nA: No, my workouts are bodyweight only.\n\nBooking: Link in bio or DM to schedule.`
    }
];

const HINTS = [
    "💰 Pricing list",
    "🚚 Shipping/Delivery",
    "📞 Contact info",
    "🕒 Business Hours",
    "🤝 Refund Policy"
];

export default function OnboardingPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { fetchUser } = useUserStore();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Снизил минимальный лимит для теста, но можно вернуть 300
    const maxLength = 1_000_000;
    const minLength = 50;

    // --- ФУНКЦИЯ ВСТАВКИ ШАБЛОНА ---
    const applyTemplate = (content: string) => {
        // Если текст уже есть, спрашиваем или добавляем снизу
        if (text.length > 10 && !confirm("Replace current text with template?")) {
            setText(prev => prev + "\n\n" + content);
            return;
        }
        setText(content);
    };

    const handleSubmit = async () => {
        if (text.length < minLength) return;
        if (!text.trim()) return;
        setLoading(true);
        setError("");

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

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            useUserStore.setState({ user: data.user });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Background FX */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-4xl z-10 flex flex-col gap-6"
            >
                {/* --- HEADER --- */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Upload Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Business Brain</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        The AI will use this text to answer your customers. <br className="hidden md:block"/>
                        Paste your website content, FAQs, or use a template below.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* --- MAIN INPUT AREA --- */}
                    <div className="flex-1 bg-[#09090b] border border-white/10 rounded-3xl p-1 shadow-2xl ring-1 ring-white/5 flex flex-col">

                        {/* Templates Bar */}
                        <div className="flex items-center gap-2 p-3 border-b border-white/5 overflow-x-auto scrollbar-hide">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide mr-2 shrink-0">
                                Quick Start:
                            </span>
                            {TEMPLATES.map((tmpl) => (
                                <button
                                    key={tmpl.id}
                                    onClick={() => applyTemplate(tmpl.content)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-zinc-300 transition-colors shrink-0"
                                >
                                    <span>{tmpl.icon}</span>
                                    <span>{tmpl.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Text Area */}
                        <div className="relative flex-1">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={maxLength}
                                className="w-full h-[45vh] lg:h-[500px] bg-transparent text-zinc-200 p-6 resize-none focus:outline-none text-base leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent placeholder-zinc-700 font-mono"
                                placeholder={`Try pasting your FAQ here...\n\nExample:\nWe open at 9 AM.\nOur delivery is free for orders over $50.\nWe create websites.`}
                            />

                            {/* Counter */}
                            <div className={`absolute bottom-4 right-6 text-xs font-mono transition-colors px-2 py-1 rounded bg-black/50 backdrop-blur ${text.length < minLength ? 'text-red-400 border border-red-500/30' : 'text-green-400 border border-green-500/30'}`}>
                                {text.length < minLength
                                    ? `${text.length} / ${minLength} chars needed`
                                    : "Context length: Perfect"
                                }
                            </div>
                        </div>
                    </div>

                    {/* --- SIDEBAR TIPS (Desktop) / BOTTOM (Mobile) --- */}
                    <div className="lg:w-72 flex flex-col gap-4">
                        <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-3xl">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                What to include?
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {HINTS.map((hint, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-zinc-400 border border-white/5">
                                        {hint}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
                                💡 <b>Pro Tip:</b> The more details you provide about prices and conditions, the less you'll have to answer manually.
                            </p>
                        </div>

                        {/* Submit Button Block */}
                        <div className="flex-1 flex flex-col justify-end">
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-center rounded-xl text-sm animate-pulse">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading || text.length < minLength}
                                className="w-full py-4 bg-white text-black font-bold text-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Initialize AI</span>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-xs text-zinc-600 mt-3">
                                You can update this anytime in Settings.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}