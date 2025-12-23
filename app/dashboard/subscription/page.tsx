"use client";

import React, {useState} from "react";
import {useUserStore} from "@/store/useStore";
import {motion} from "framer-motion";
import Link from "next/link";

const Icons = {
    Star: () => <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>,
    External: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
};

export default function SubscriptionPage() {
    const {user} = useUserStore();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const [loading, setLoading] = useState(false);

    const handleManage = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/stripe/create-portal-session`, {
                method: "POST",
                headers: {"Authorization": `Bearer ${token}`}
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto flex flex-col items-center">

            <div className="max-w-3xl w-full">
                <h1 className="text-3xl font-bold text-white mb-2">Subscription & Billing</h1>
                <p className="text-zinc-400 mb-8">Manage your plan, payment methods, and invoices.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Current Plan Card */}
                    <motion.div
                        initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                        className="col-span-2 bg-[#09090b] border border-white/10 rounded-2xl p-8 relative overflow-hidden"
                    >
                        {user?.is_premium ? (
                            <>
                                <div
                                    className="absolute top-0 right-0 bg-purple-600/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-purple-500/30">ACTIVE
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                                        <Icons.Star/>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                                        <p className="text-sm text-zinc-400">$10 / month</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div
                                        className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                                        <span className="text-sm text-zinc-400">Status</span>

                                        {user.stripe_cancel_at_period_end ? (
                                            <span className="text-yellow-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400"/> Cancels on period end
        </span>
                                        ) : (
                                            <span className="text-green-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/> Active (Auto-renew)
        </span>
                                        )}
                                    </div>
                                    {user.stripe_current_period_end && (
                                        <div
                                            className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                                            <span className="text-sm text-zinc-400">Renews on</span>
                                            <span className="text-white font-mono text-sm">
                                                {new Date(user.stripe_current_period_end).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleManage}
                                    disabled={loading}
                                    className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? "Loading..." : <>Manage Subscription <Icons.External/></>}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-zinc-800 rounded-xl border border-white/5">
                                        <div className="w-5 h-5 bg-zinc-600 rounded-full"/>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Starter Plan</h3>
                                        <p className="text-sm text-zinc-400">Free Forever</p>
                                    </div>
                                </div>
                                <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                                    You are currently on the free plan. Upgrade to Pro to unlock AI features, voice
                                    recognition, and unlimited bots.
                                </p>
                                <Link href="/pricing">
                                    <button
                                        className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
                                        Upgrade to Pro
                                    </button>
                                </Link>
                            </>
                        )}
                    </motion.div>

                    {/* Features / Info Side */}
                    <motion.div
                        initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}
                        className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-center"
                    >
                        <h4 className="font-bold text-white mb-4">Why Pro?</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex gap-2">✓ AI Auto-Replies</li>
                            <li className="flex gap-2">✓ Voice Transcription</li>
                            <li className="flex gap-2">✓ Image Analysis</li>
                            <li className="flex gap-2">✓ Unlimited Bots</li>
                        </ul>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}