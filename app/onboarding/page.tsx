"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useStore"; // <--- 1. ИМПОРТИРУЕМ СТОР

export default function OnboardingPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

    // <--- 2. ДОСТАЕМ МЕТОД ОБНОВЛЕНИЯ
    const { fetchUser } = useUserStore();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const maxLength = 1000000;
    const minLength = 300;

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

            // --- ИСПРАВЛЕНИЕ: ОБНОВЛЕНИЕ ВРУЧНУЮ ---
            // Мы получили обновленного юзера (data.user) от сервера.
            // Принудительно кладем его в стейт, чтобы Layout увидел изменения.
            useUserStore.setState({ user: data.user });

            // Для надежности еще раз почистим, но прямой записи выше уже достаточно
            // await fetchUser();

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-purple-500/30">
            {/* Background FX */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-3xl z-10"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 mb-4">
                        Train Your AI 🧠
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Tell us everything about your business. Upload your FAQ, pricing, tone of voice, and key selling points.
                    </p>
                </div>

                <div className="bg-[#09090b] border border-white/10 rounded-3xl p-1 shadow-2xl ring-1 ring-white/5">
                    <div className="relative">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={maxLength}
                            className="w-full h-[50vh] bg-transparent text-zinc-200 p-6 resize-none focus:outline-none text-base leading-relaxed scrollbar-hide placeholder-zinc-700"
                            placeholder="Example: We are a digital marketing agency called 'Omni'..."
                        />
                        <div className={`absolute bottom-4 right-6 text-xs font-mono transition-colors ${text.length < minLength ? 'text-red-400' : 'text-green-400'}`}>
                            {text.length < minLength
                                ? `${text.length} / ${minLength} min chars`
                                : `${text.length.toLocaleString()} / ${maxLength.toLocaleString()}`
                            }
                        </div>
                    </div>
                </div>

                {/* ... Error Message ... */}

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || text.length < minLength} // Блокируем кнопку
                        className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? "Training AI..." : text.length < minLength ? `Type ${minLength - text.length} more` : "Finish Setup"}
                            {!loading && text.length >= minLength && <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
                        </span>
                        {/* ... Gradient ... */}
                    </button>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-center rounded-xl text-sm">
                        {error}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}