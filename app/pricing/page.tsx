"use client";

import React, {useState, useEffect, Suspense} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/useStore";

// Компонент Toast
function Toast({ message, onClose, type = 'success' }: { message: string, onClose: () => void, type?: 'success' | 'error' }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div
            initial={{y: -50, opacity:0}} animate={{y:0, opacity:1}} exit={{y:-50, opacity:0}}
            className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-medium shadow-2xl z-[60] flex items-center gap-2 border ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}
        >
            {type === 'error' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {message}
        </motion.div>
    )
}

const Icons = {
    Check: () => <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    Star: () => <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
};

function PricingContent() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const [loading, setLoading] = useState(false);
    const { user, isLoading, fetchUser } = useUserStore();

    const searchParams = useSearchParams();
    const router = useRouter();
    const [toastMsg, setToastMsg] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
    useEffect(() => {
        // Если пользователя нет и загрузка не идет - пробуем загрузить
        // (Токен должен быть в localStorage)
        if (!user && !isLoading) {
            const token = localStorage.getItem("token");
            if (token) {
                fetchUser();
            }
        }
    }, []); // Один раз при маунте
    // 1. Эффект для обработки URL параметров (Toast)
    useEffect(() => {
        const error = searchParams.get('error');
        const payment = searchParams.get('payment');

        if (error === 'premium_required') {
            setToastMsg({ msg: "🔒 Premium subscription required.", type: 'error' });
            router.replace('/pricing');
        } else if (payment === 'success') {
            setToastMsg({ msg: "🎉 Payment successful! Welcome to Pro.", type: 'success' });
            router.replace('/pricing');
        } else if (payment === 'cancelled') {
            setToastMsg({ msg: "Payment cancelled.", type: 'error' });
            router.replace('/pricing');
        }
    }, [searchParams, router]);

    // 2. Эффект для редиректа, если уже есть подписка
    useEffect(() => {
        console.log("isLoading: ", isLoading);
        console.log("user: ", user);
        console.log("user: ", user?.is_premium);
        if (!isLoading && user && user.is_premium) {
            console.log("User is already premium, redirecting...");
            router.replace('/dashboard/subscription');
        }
    }, [user, isLoading, router]);

    const PRICE_ID = process.env.NEXT_PUBLIC_PRICE_ID;

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/signin";
                return;
            }
            const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ priceId: PRICE_ID }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert("Error creating checkout session");
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-purple-500/30">
            <AnimatePresence>
                {toastMsg && <Toast message={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
            </AnimatePresence>

            {/* Backgrounds */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />

            <div className="relative z-10 max-w-5xl w-full text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400 mb-4">Upgrade to Pro</h1>
                    <p className="text-zinc-400 text-lg">Supercharge your CRM with AI power.</p>
                </motion.div>

                <div className="flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} // Изменил анимацию на простую вертикальную
                        animate={{ opacity: 1, y: 0 }}
                        className="relative bg-gradient-to-b from-zinc-900 to-black border border-purple-500/30 rounded-3xl p-8 flex flex-col items-start h-full shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden max-w-md w-full"
                    >
                        <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Recommended</div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Pro <Icons.Star /></h3>
                        <p className="text-4xl font-bold text-white mb-6">$10 <span className="text-sm font-normal text-zinc-500">/ month</span></p>
                        <ul className="space-y-4 mb-8 flex-1 w-full text-left">
                            <li className="flex items-center gap-3 text-white text-sm"><Icons.Check /> <span className="font-semibold">AI Auto-Reply</span> (Gemini Flash)</li>
                            <li className="flex items-center gap-3 text-white text-sm"><Icons.Check /> Voice & Image Recognition</li>
                            <li className="flex items-center gap-3 text-white text-sm"><Icons.Check /> Unlimited Telegram Bots</li>
                            <li className="flex items-center gap-3 text-white text-sm"><Icons.Check /> Priority Support</li>
                        </ul>
                        <button onClick={handleSubscribe} disabled={loading} className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 disabled:opacity-70 flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : "Get Started"}
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PricingContent />
        </Suspense>
    );
}