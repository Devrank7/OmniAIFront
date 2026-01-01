"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useStore";
import { Check, Star, Zap, Shield, Crown, Loader2, Lock as LockIcon, X, Sparkles, ArrowRight, Clock } from "lucide-react";

// --- УТИЛИТА ---
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

// --- КОМПОНЕНТЫ ---

function Toast({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0, scale: 0.9 }}
            className={cn("fixed top-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl font-medium shadow-2xl z-[100] flex items-center gap-3 border backdrop-blur-xl",
                type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-200" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200")}
        >
            <div className={cn("p-1 rounded-full", type === 'error' ? "bg-red-500/20" : "bg-emerald-500/20")}>{type === 'error' ? <X size={16} /> : <Check size={16} />}</div>
            <span className="text-sm tracking-wide">{message}</span>
        </motion.div>
    )
}

function TiltCard({ children }: { children: React.ReactNode }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{
                rotateY: useMotionTemplate`${mouseX}deg`,
                rotateX: useMotionTemplate`${mouseY * -1}deg`,
                transformStyle: "preserve-3d",
            }}
            className="relative transition-all duration-200 ease-out perspective-1000"
        >
            {children}
        </motion.div>
    );
}

const AvatarGroup = () => (
    <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030014] bg-zinc-800 overflow-hidden relative">
                    <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="user" className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
        <div className="text-xs text-zinc-400">
            <span className="text-white font-bold">1,200+</span> businesses active now
        </div>
    </div>
);

// --- MAIN CONTENT ---

function PricingContent() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const PRICE_ID = process.env.NEXT_PUBLIC_PRICE_ID;
    const [loading, setLoading] = useState(false);
    const { user, isLoading, fetchUser } = useUserStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [toastMsg, setToastMsg] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);

    // --- 1. ЛОГИКА ОПРЕДЕЛЕНИЯ ТРИАЛА ---
    // Если юзера нет (гость) -> Показываем триал ($1), чтобы завлечь.
    // Если юзер есть И has_used_trial == false -> Показываем триал.
    // Если юзер есть И has_used_trial == true -> Показываем $39.
    const showTrial = !user || !user.has_used_trial;

    useEffect(() => {
        const validateUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            if (!user) {
                try { await fetchUser(); }
                catch { localStorage.removeItem("token"); router.push("/signin"); }
            }
            if (user && !user.business_context) setTimeout(() => router.push("/onboarding"), 500);
        };
        validateUser();
    }, []);

    useEffect(() => {
        const p = searchParams.get('payment');
        if (p === 'success') { setToastMsg({ msg: "🚀 Upgrade Successful!", type: 'success' }); router.replace('/pricing'); }
        if (p === 'cancelled') { setToastMsg({ msg: "Payment cancelled.", type: 'error' }); router.replace('/pricing'); }
    }, [searchParams]);

    useEffect(() => { if (!isLoading && user?.is_premium) router.replace('/dashboard/subscription'); }, [user, isLoading]);

    const handleSubscribe = async () => {
        const token = localStorage.getItem("token");
        if (!user || !token) { router.push("/signin"); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ priceId: PRICE_ID }),
            });
            if (!res.ok) throw new Error("Server error");
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch {
            setToastMsg({ msg: "Failed to start checkout", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Zap, title: "AI Auto-Reply", desc: "Replies instantly 24/7 with Gemini Flash" },
        { icon: Shield, title: "Smart Recognition", desc: "Understands Voice & Images automatically" },
        { icon: Star, title: "Unlimited Bots", desc: "Connect as many Telegram accounts as you need" },
        { icon: Crown, title: "Priority Support", desc: "Direct line to our engineering team" },
    ];

    return (
        <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden selection:bg-purple-500/30">
            {/* Background FX */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-pulse-slow delay-1000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>

            <AnimatePresence>
                {toastMsg && <Toast message={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
            </AnimatePresence>

            <div className="relative z-10 max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* LEFT COLUMN: DYNAMIC TEXT */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8 lg:text-left text-center"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-sm font-semibold text-purple-300 backdrop-blur-md shadow-lg shadow-purple-500/10">
                        {showTrial ? (
                            <>
                                <Clock className="w-4 h-4 text-purple-300" />
                                <span>Limited Time: 3-Day Trial Access</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span>Pro Access Unlocked</span>
                            </>
                        )}
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                        {showTrial ? (
                            <>
                                Try the Future <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-gradient-x">
                                    Risk-Free for $1
                                </span>
                            </>
                        ) : (
                            <>
                                Unlock Full <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-gradient-x">
                                    Business Power
                                </span>
                            </>
                        )}
                    </h1>

                    <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
                        {showTrial
                            ? "Experience the full power of AI automation. Start with a 3-day trial. If you love it, it's just $39/mo."
                            : "Ready to scale? Get unlimited access to AI automation, voice recognition, and unlimited bots for a flat monthly rate."
                        }
                    </p>

                    <div className="flex flex-col lg:flex-row items-center gap-6 pt-4">
                        <div className="h-8 w-px bg-white/10 hidden lg:block" />
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                            <span className="text-sm font-bold ml-2">Trusted by Pros</span>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN: DYNAMIC PRICING CARD */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative w-full max-w-md mx-auto perspective-1000"
                >
                    <TiltCard>
                        <div className="relative bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 overflow-hidden shadow-2xl shadow-indigo-500/20 group">

                            {/* Glow Effects */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-all duration-500" />

                            {/* HEADER */}
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">Pro License</h3>
                                    <p className="text-zinc-400 text-sm">Full Access. No Limits.</p>
                                </div>
                                <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 border border-white/20 uppercase tracking-wide flex items-center gap-1">
                                    <Sparkles size={10} className="fill-white" />
                                    {showTrial ? "Special Offer" : "Best Value"}
                                </div>
                            </div>

                            {/* PRICE - DYNAMIC SECTION */}
                            <div className="mb-8 relative z-10 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
                                {showTrial ? (
                                    <>
                                        {/* State: Trial Available */}
                                        <div className="flex items-baseline gap-1 mb-1">
                                            <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-lg">$1</span>
                                            <span className="text-lg font-bold text-purple-400">/ 3 days</span>
                                        </div>
                                        <div className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                                            Then $39/mo <span className="w-1 h-1 rounded-full bg-zinc-600"/> Cancel anytime
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* State: Trial Used (Standard Price) */}
                                        <div className="flex items-baseline gap-1 mb-1">
                                            <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-lg">$39</span>
                                            <span className="text-lg font-bold text-zinc-500">/ month</span>
                                        </div>
                                        <div className="text-zinc-400 text-xs font-medium flex items-center gap-2">
                                            Flat rate <span className="w-1 h-1 rounded-full bg-zinc-600"/> No hidden fees
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                            {/* Features List */}
                            <ul className="space-y-5 mb-10 relative z-10">
                                {features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <div className="shrink-0 p-2 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 text-purple-400 shadow-sm">
                                            <feature.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm leading-tight">{feature.title}</p>
                                            <p className="text-zinc-500 text-xs mt-0.5 leading-snug">{feature.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <div className="mt-auto relative z-10 w-full">
                                <button
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className="group relative w-full overflow-hidden rounded-2xl py-4 px-6 bg-white text-black font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                            <>
                                                {showTrial ? "Start 3-Day Trial for $1" : "Upgrade to Pro"}
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>

                                <p className="text-center text-[10px] text-zinc-500 mt-4 font-medium flex justify-center gap-4">
                                    <span className="flex items-center gap-1"><LockIcon size={10} /> Secure Stripe Payment</span>
                                </p>
                            </div>

                        </div>
                    </TiltCard>
                </motion.div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030014] flex items-center justify-center text-white"><Loader2 className="animate-spin w-10 h-10 text-purple-500"/></div>}>
            <PricingContent />
        </Suspense>
    );
}