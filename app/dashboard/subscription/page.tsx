"use client";

import React, { useState } from "react";
import { useUserStore } from "@/store/useStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, CreditCard, ShieldCheck, XCircle } from "lucide-react";

// --- КОМПОНЕНТЫ ИКОНОК ---
const Icons = {
    Star: () => <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    External: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
};

export default function SubscriptionPage() {
    const { user } = useUserStore();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const [loading, setLoading] = useState(false);

    // Логика перенаправления в Stripe Portal (для отмены/смены карты)
    const handleManage = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/stripe/create-portal-session`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- ОПРЕДЕЛЕНИЕ СТАТУСА ---
    // Если бэкенд еще не обновили, считаем 'active', если is_premium = true
    const status = user?.stripe_subscription_status || (user?.is_premium ? 'active' : 'free');

    const isTrial = status === 'trialing';
    const isCanceled = user?.stripe_cancel_at_period_end;

    // Форматирование цены для отображения
    const planPrice = isTrial ? "$1.00 / 3 days" : "$10.00 / month";
    const planName = isTrial ? "Pro Trial" : "Pro Plan";

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto flex flex-col items-center">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-3xl w-full relative z-10">
                <h1 className="text-3xl font-bold text-white mb-2">Subscription & Billing</h1>
                <p className="text-zinc-400 mb-8">Manage your plan, payment methods, and invoices.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Current Plan Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="col-span-2 bg-[#09090b] border border-white/10 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
                    >
                        {user?.is_premium ? (
                            <>
                                {/* --- STATUS BADGE --- */}
                                <div className="absolute top-0 right-0">
                                    {isCanceled ? (
                                        <div className="bg-red-500/20 text-red-200 text-xs font-bold px-4 py-1.5 rounded-bl-xl border-l border-b border-red-500/30 flex items-center gap-2">
                                            <XCircle size={12} /> CANCELED
                                        </div>
                                    ) : isTrial ? (
                                        <div className="bg-blue-500/20 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-bl-xl border-l border-b border-blue-500/30 flex items-center gap-2">
                                            <Clock size={12} /> TRIAL ACTIVE
                                        </div>
                                    ) : (
                                        <div className="bg-green-500/20 text-green-300 text-xs font-bold px-4 py-1.5 rounded-bl-xl border-l border-b border-green-500/30 flex items-center gap-2">
                                            <ShieldCheck size={12} /> ACTIVE
                                        </div>
                                    )}
                                </div>

                                {/* --- PLAN HEADER --- */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 rounded-2xl border ${isTrial ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-purple-500/20 border-purple-500/30 text-purple-400'}`}>
                                        <Icons.Star />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{planName}</h3>
                                        <p className="text-sm text-zinc-400 font-medium">{planPrice}</p>
                                    </div>
                                </div>

                                {/* --- DETAILS --- */}
                                <div className="space-y-4 mb-8">
                                    {/* Status Row */}
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                                        <span className="text-sm text-zinc-400">Current Status</span>

                                        {isCanceled ? (
                                            <span className="text-yellow-400 font-medium text-sm flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Ends soon
                                            </span>
                                        ) : isTrial ? (
                                            <span className="text-blue-400 font-medium text-sm flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> 3-Day Trial
                                            </span>
                                        ) : (
                                            <span className="text-green-400 font-medium text-sm flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Auto-renewing
                                            </span>
                                        )}
                                    </div>

                                    {/* Date Row */}
                                    {user.stripe_current_period_end && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                                            <span className="text-sm text-zinc-400">
                                                {isCanceled
                                                    ? "Access until"
                                                    : isTrial
                                                        ? "Trial ends (then $39/mo)"
                                                        : "Renews on"
                                                }
                                            </span>
                                            <span className="text-white font-mono text-sm font-bold">
                                                {new Date(user.stripe_current_period_end).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* --- ACTIONS --- */}
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleManage}
                                        disabled={loading}
                                        className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                                    >
                                        {loading ? "Opening Portal..." : (
                                            <>
                                                {isCanceled ? "Renew Plan" : "Manage / Cancel Subscription"}
                                                <Icons.External />
                                            </>
                                        )}
                                    </button>
                                    {!isCanceled && (
                                        <p className="text-center text-xs text-zinc-500">
                                            You can cancel anytime via the Stripe Customer Portal.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            // FREE PLAN VIEW
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-zinc-800 rounded-xl border border-white/5">
                                        <div className="w-5 h-5 bg-zinc-600 rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Starter Plan</h3>
                                        <p className="text-sm text-zinc-400">Free Forever</p>
                                    </div>
                                </div>
                                <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                                    You are currently on the free plan. Upgrade to Pro to unlock AI features, voice recognition, and unlimited bots.
                                </p>
                                <Link href="/pricing">
                                    <button className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
                                        Upgrade to Pro
                                    </button>
                                </Link>
                            </>
                        )}
                    </motion.div>

                    {/* Features / Info Side */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-center"
                    >
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard size={16} className="text-zinc-400"/> Billing Info
                        </h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li className="flex gap-2 items-start">
                                <span className="text-purple-400 mt-0.5">●</span>
                                <span>Payments are securely processed by Stripe.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="text-purple-400 mt-0.5">●</span>
                                <span>If you cancel during the trial, you won't be charged $39.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="text-purple-400 mt-0.5">●</span>
                                <span>Need invoice? Download it from the Manage portal.</span>
                            </li>
                        </ul>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}