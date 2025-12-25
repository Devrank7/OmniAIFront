"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useStore";
import {Check, Star, Zap, Shield, Crown, Loader2, Lock as LockIcon, X, Sparkles} from "lucide-react";

// --- УТИЛИТА ДЛЯ КЛАССОВ ---
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

// --- КОМПОНЕНТЫ UI ---

// 1. Уведомления (Toast)
function Toast({ message, onClose, type = 'success' }: { message: string, onClose: () => void, type?: 'success' | 'error' }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);

    return (
        <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "fixed top-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl font-medium shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] z-[100] flex items-center gap-3 border backdrop-blur-xl",
                type === 'error'
                    ? "bg-red-500/10 border-red-500/20 text-red-200"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
            )}
        >
            <div className={cn("p-1 rounded-full", type === 'error' ? "bg-red-500/20" : "bg-emerald-500/20")}>
                {type === 'error' ? <X size={16} /> : <Check size={16} />}
            </div>
            <span className="text-sm tracking-wide">{message}</span>
        </motion.div>
    )
}

// 2. Анимированный фон
const AnimatedBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#030014]" />
        <div className="absolute top-[-50%] left-[-20%] w-[1000px] h-[1000px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen opacity-30 animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
    </div>
);

// 3. Карточка с эффектом подсветки
function SpotlightCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={cn(
                "group relative border border-white/10 bg-white/5 overflow-hidden rounded-3xl",
                className
            )}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                          650px circle at ${mouseX}px ${mouseY}px,
                          rgba(147, 51, 234, 0.15),
                          transparent 80%
                        )
                    `,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

// 4. Кнопка с эффектом шиммера
const ShimmerButton = ({ onClick, disabled, loading, children }: any) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group relative w-full overflow-hidden rounded-xl bg-white p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 md:py-4 py-3"
        >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-colors hover:bg-slate-900 group-disabled:opacity-80">
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : children}
            </span>
        </button>
    );
};

// --- ОСНОВНОЙ КОНТЕНТ ---

function PricingContent() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const PRICE_ID = process.env.NEXT_PUBLIC_PRICE_ID;

    const [loading, setLoading] = useState(false);
    const { user, isLoading, fetchUser } = useUserStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [toastMsg, setToastMsg] = useState<{msg: string, type: 'error' | 'success'} | null>(null);

    // 1. ПРОВЕРКА ВАЛИДНОСТИ ЮЗЕРА ПРИ ЗАГРУЗКЕ
    useEffect(() => {
        const validateUser = async () => {
            const token = localStorage.getItem("token");

            // Если токена нет вообще — просто показываем прайсинг (неавторизованный юзер)
            if (!token) return;

            // Если токен есть, но данные юзера не загружены — пробуем загрузить
            if (!user) {
                try {
                    await fetchUser();
                } catch (error) {
                    console.error("Auth check failed:", error);
                    // Если fetchUser упал (например 401), значит токен протух
                    localStorage.removeItem("token");
                    setToastMsg({ msg: "Session expired. Please sign in again.", type: 'error' });
                    setTimeout(() => router.push("/signin"), 2000);
                }
            }
            console.log(user)
            if (user && user.business_context === "") {
                setTimeout(() => router.push("/onboarding"), 500);
            }
        };

        validateUser();
    }, []);

    // 2. ОБРАБОТКА URL ПАРАМЕТРОВ (От Stripe)
    useEffect(() => {
        const error = searchParams.get('error');
        const payment = searchParams.get('payment');

        if (error === 'premium_required') {
            setToastMsg({ msg: "🔒 Premium subscription required.", type: 'error' });
            router.replace('/pricing');
        } else if (payment === 'success') {
            setToastMsg({ msg: "🎉 Welcome to the Pro club!", type: 'success' });
            router.replace('/pricing');
        } else if (payment === 'cancelled') {
            setToastMsg({ msg: "Payment process cancelled.", type: 'error' });
            router.replace('/pricing');
        }
    }, [searchParams, router]);

    // 3. РЕДИРЕКТ, ЕСЛИ УЖЕ КУПИЛ
    useEffect(() => {
        if (!isLoading && user && user.is_premium) {
            router.replace('/dashboard/subscription');
        }
    }, [user, isLoading, router]);

    // --- ЛОГИКА ПОКУПКИ ---
    const handleSubscribe = async () => {
        // 1. СТРОГАЯ ПРОВЕРКА: Если нет юзера в стейте ИЛИ нет токена
        const token = localStorage.getItem("token");

        if (!user || !token) {
            setToastMsg({ msg: "Please sign in to subscribe", type: 'error' });
            // Мгновенный редирект, без лишних ожиданий
            router.push("/signin");
            return;
        }
        if (user && !user.business_context) {
            setTimeout(() => router.push("/onboarding"), 500);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ priceId: PRICE_ID }),
            });

            // 2. Обработка ошибок от сервера (401, 403, 500)
            if (!res.ok) {
                // Если сервер сказал, что токен невалиден
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    useUserStore.setState({ user: null }); // Очищаем стейт
                    throw new Error("Unauthorized");
                }
                const errData = await res.json();
                throw new Error(errData.message || "Server error");
            }

            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No payment URL returned");
            }

        } catch (error: any) {
            console.error("Subscription error:", error);

            if (error.message === "Unauthorized") {
                setToastMsg({ msg: "Session expired. Redirecting...", type: 'error' });
                router.push("/signin");
            } else {
                setToastMsg({ msg: error.message || "Failed to start checkout", type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Zap, text: "AI Auto-Reply (Gemini Flash)", sub: "Instant responses" },
        { icon: Shield, text: "Voice & Image Recognition", sub: "Multimodal AI" },
        { icon: Star, text: "Unlimited Telegram Bots", sub: "Scale without limits" },
        { icon: Crown, text: "Priority 24/7 Support", sub: "Direct developer access" },
    ];

    return (
        <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center p-4 relative font-sans selection:bg-purple-500/30">
            <AnimatedBackground />

            <AnimatePresence>
                {toastMsg && <Toast message={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
            </AnimatePresence>

            <div className="relative z-10 max-w-6xl w-full flex flex-col items-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-4 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        New Generation CRM
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                        Unlock your <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-gradient-x">
                            AI Superpower
                        </span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Automate communications, analyze data, and scale your operations with the most advanced AI models available today.
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-[420px]"
                >
                    <SpotlightCard className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl shadow-purple-900/20">
                        <div className="p-8 flex flex-col h-full relative">
                            {/* Blur Decor */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-semibold text-white mb-1">Pro Plan</h3>
                                    <p className="text-zinc-400 text-sm">For serious power users</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-purple-500/20 border border-white/10 uppercase tracking-wider">
                                    Best Value
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1 mb-8 relative z-10">
                                <span className="text-5xl font-bold text-white tracking-tight">$10</span>
                                <span className="text-zinc-500 font-medium">/month</span>
                            </div>

                            <ul className="space-y-6 mb-10 flex-1 relative z-10">
                                {features.map((feature, idx) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (idx * 0.1) }}
                                        className="flex items-start gap-4 group"
                                    >
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/10 transition-colors">
                                            <feature.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{feature.text}</p>
                                            <p className="text-zinc-500 text-xs mt-0.5">{feature.sub}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="mt-auto relative z-10 w-full flex flex-col items-center">
                                {/* Декоративное свечение позади кнопки */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-indigo-500/50 blur-[40px] -z-10 rounded-full" />

                                <button
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className={`
            group relative w-full overflow-hidden rounded-xl py-3.5 px-6 
            transition-all duration-300 ease-out
            hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25 
            active:scale-[0.98]
            disabled:cursor-not-allowed disabled:opacity-70
            bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600
            bg-[length:200%_100%] hover:bg-[100%_0] animate-background-pan
            border border-white/10
        `}
                                >
                                    {/* Эффект блика (Shimmer) через CSS */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

                                    <span className="relative z-20 flex items-center justify-center gap-2 text-white font-semibold tracking-wide">
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    <Sparkles className="w-5 h-5 text-yellow-300 fill-yellow-300/20" />
                    <span>Upgrade to Pro</span>
                </>
            )}
        </span>
                                </button>

                                {/* Блок доверия (Trust signals) */}
                                <div className="flex flex-col items-center gap-1.5 mt-4">
                                    <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                                        <LockIcon className="w-3 h-3" />
                                        <span>Secured by Stripe</span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-400" />
                                        <span>Cancel anytime</span>
                                    </div>

                                    {/* Опционально: логотипы карт или визуальный пруф, если нужно */}
                                    {/* <div className="text-[10px] text-zinc-400 opacity-60">
             End-to-end encrypted transaction
        </div> */}
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </motion.div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030014] flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8 opacity-50"/></div>}>
            <PricingContent />
        </Suspense>
    );
}