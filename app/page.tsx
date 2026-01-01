"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {useUserStore} from "@/store/useStore";

// --- КОНСТАНТЫ АНИМАЦИИ ---
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

// --- ИКОНКИ ---
const Icons = {
    Zap: () => <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Shield: () => <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Telegram: () => <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z" /></svg>,
    Check: () => <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    Cross: () => <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    Bot: () => <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Time: () => <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

// --- UI COMPONENTS ---

const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                    O
                </div>
                <span className="font-bold text-xl tracking-tight text-white">OmniAI Desk</span>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/signin" className="hidden sm:block text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    Log In
                </Link>
                <Link href="/dashboard">
                    <button className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-all">
                        Try It
                    </button>
                </Link>
            </div>
        </div>
    </nav>
);

const Hero = () => (
    <section className="relative pt-44 pb-32 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>

                <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"/>
                        For Telegram Sales Teams
                    </div>
                </motion.div>

                <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                    Stop Losing Clients in <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500">
             Messy Personal Chats
            </span>
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
                    Connect a <b>Telegram Bot</b> as your main sales channel. Centralize all leads, automate replies with AI, and give your managers a tool that saves 20 hours a week.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-all transform hover:scale-[1.02]">
                            Boost Sales Now
                        </button>
                    </Link>
                </motion.div>

            </motion.div>
        </div>
    </section>
);

const PainVsGain = () => (
    <section className="py-24 px-6 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">Why Managers Burn Out (And Leads disappear)</h2>
                <p className="text-zinc-400">If you are selling via personal Telegram accounts, you are losing money.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* OLD WAY */}
                <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
                    <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                        <Icons.Cross /> The Chaos (Personal Chats)
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-zinc-400">
                            <span className="text-red-500/50 mt-1">✕</span>
                            <span><b>Chats are mixed:</b> Clients are lost between "Mom" and "Friends".</span>
                        </li>
                        <li className="flex gap-3 text-zinc-400">
                            <span className="text-red-500/50 mt-1">✕</span>
                            <span><b>No tracking:</b> You don't know if a manager answered a lead.</span>
                        </li>
                        <li className="flex gap-3 text-zinc-400">
                            <span className="text-red-500/50 mt-1">✕</span>
                            <span><b>Account Bans:</b> Personal accounts get banned for "spamming" new clients.</span>
                        </li>
                        <li className="flex gap-3 text-zinc-400">
                            <span className="text-red-500/50 mt-1">✕</span>
                            <span><b>Voice Message Hell:</b> Managers waste hours listening to 2-min audio.</span>
                        </li>
                    </ul>
                </div>

                {/* NEW WAY */}
                <div className="relative p-8 rounded-3xl bg-green-500/5 border border-green-500/20">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Icons.Shield /></div>
                    <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
                        <Icons.Check /> The System (OmniAI Desk)
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3 text-white">
                            <span className="text-green-400 mt-1">✓</span>
                            <span><b>Professional Bot:</b> One link for all clients. Looks trusted and official.</span>
                        </li>
                        <li className="flex gap-3 text-white">
                            <span className="text-green-400 mt-1">✓</span>
                            <span><b>Centralized Pipeline:</b> Boss sees every chat, status, and deal stage.</span>
                        </li>
                        <li className="flex gap-3 text-white">
                            <span className="text-green-400 mt-1">✓</span>
                            <span><b>Zero Bans:</b> Telegram Bots are designed for business communication.</span>
                        </li>
                        <li className="flex gap-3 text-white">
                            <span className="text-green-400 mt-1">✓</span>
                            <span><b>AI Transcription:</b> Audio turns into text instantly. AI drafts the reply.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
);

const BotFeatureHighlight = () => (
    <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-6">
                    THE GAME CHANGER
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                    Professionalize Your Business with a <span className="text-blue-500">Telegram Bot</span>
                </h2>
                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                    Stop asking clients to "DM me personally." Give them a professional Bot link.
                    <br/><br/>
                    When a client writes to your Bot, the chat appears in <b>OmniAI Desk</b>.
                    Multiple managers can work on the same lead stream without sharing passwords or devices.
                </p>

                <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
                        <div className="text-2xl font-bold text-white mb-1">100%</div>
                        <div className="text-sm text-zinc-500">Message Delivery</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
                        <div className="text-2xl font-bold text-white mb-1">0%</div>
                        <div className="text-sm text-zinc-500">Chaos in Personal Chats</div>
                    </div>
                </div>

                <Link href="/dashboard/connect">
                    <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                        Connect Your Bot Now
                    </button>
                </Link>
            </div>

            <div className="lg:w-1/2 relative">
                {/* Abstract Visual representation of Bot Routing */}
                <div className="relative z-10 p-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl shadow-2xl">
                    <div className="bg-[#09090b] rounded-[22px] p-8 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><Icons.Telegram /></div>
                                <div>
                                    <div className="font-bold text-white">Your Business Bot</div>
                                    <div className="text-xs text-blue-400">bot</div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">Online</div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-zinc-800/50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl max-w-[80%] text-sm text-zinc-300">
                                Client: How much for the premium plan?
                            </div>
                            <div className="bg-blue-600/20 border border-blue-500/20 p-3 rounded-tl-xl rounded-br-xl rounded-bl-xl ml-auto max-w-[90%]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-blue-300 font-bold">AI Assistant</span>
                                    <span className="text-[10px] text-zinc-500">Drafting...</span>
                                </div>
                                <p className="text-sm text-white">
                                    Our Premium plan is $10/mo. It includes AI auto-replies and unlimited leads. Should I send you the payment link?
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="px-4 py-2 bg-zinc-800 rounded-lg text-xs text-zinc-500 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                                Synced with OmniAI Dashboard
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 blur-[100px] rounded-full -z-10" />
            </div>
        </div>
    </section>
);

const AIStats = () => (
    <section className="py-20 bg-[#050505] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-16">Why Businesses Switch to OmniAI</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6">
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-2">2.5h</div>
                    <div className="text-zinc-400">Saved per manager / day</div>
                </div>
                <div className="p-6 border-x border-white/5">
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-2">24/7</div>
                    <div className="text-zinc-400">Instant Lead Response</div>
                </div>
                <div className="p-6">
                    <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-2">+30%</div>
                    <div className="text-zinc-400">Conversion Rate Increase</div>
                </div>
            </div>
        </div>
    </section>
);

const Pricing = () => {
    const { user } = useUserStore();

    // Логика: Показываем триал всем гостям ИЛИ тем, кто его еще не использовал
    const showTrial = !user || !user.has_used_trial;

    return (
        <section id="pricing" className="py-32 px-6 relative bg-zinc-900/20">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">Invest in Growth, Not Overhead</h2>
                    <p className="text-zinc-400 text-lg">
                        {showTrial
                            ? "Start with a risk-free trial. Scale when you see results."
                            : "Simple, transparent pricing. No hidden fees."
                        }
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-1 bg-[#09090b] rounded-[32px] max-w-lg mx-auto transform hover:scale-[1.02] transition-transform duration-500"
                >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500 to-blue-600 rounded-[32px] opacity-30 blur-md" />

                    <div className="relative bg-[#09090b] rounded-[30px] p-10 border border-white/10 overflow-hidden shadow-2xl">

                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold uppercase border border-purple-500/20">Pro License</span>
                                <h3 className="text-2xl font-bold text-white mt-2">All-In-One Access</h3>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 uppercase tracking-wide flex items-center gap-1">
                                {showTrial ? "LIMITED OFFER" : "BEST VALUE"}
                            </div>
                        </div>

                        {/* PRICE HERO - DYNAMIC */}
                        <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                            {/* Subtle inner glow */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/20 blur-[40px] rounded-full"></div>

                            {showTrial ? (
                                <>
                                    {/* Вариант с Триалом */}
                                    <div className="flex items-baseline gap-2 mb-1 relative z-10">
                                        <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-lg">$1</span>
                                        <span className="text-lg font-bold text-purple-400">/ 3 days</span>
                                    </div>
                                    <div className="text-zinc-400 text-xs font-medium flex items-center gap-2 mt-2 relative z-10">
                                        Then just $39/mo <span className="w-1 h-1 rounded-full bg-zinc-600" /> Cancel anytime
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Вариант без Триала (для тех, кто уже брал) */}
                                    <div className="flex items-baseline gap-2 mb-1 relative z-10">
                                        <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-lg">$39</span>
                                        <span className="text-lg font-bold text-zinc-500">/ month</span>
                                    </div>
                                    <div className="text-zinc-400 text-xs font-medium flex items-center gap-2 mt-2 relative z-10">
                                        Flat rate <span className="w-1 h-1 rounded-full bg-zinc-600" /> Full access included
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-5 mb-10">
                            <div className="flex items-start gap-4 text-white group">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-0.5 group-hover:scale-110 transition-transform"><Icons.Check /></div>
                                <div>
                                    <span className="font-bold">Unlimited</span> Telegram Bots & Accounts
                                    <p className="text-xs text-zinc-500 mt-0.5">Connect your whole team</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-white group">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-0.5 group-hover:scale-110 transition-transform"><Icons.Check /></div>
                                <div>
                                    <span><b>AI Auto-Replies</b> (Voice & Text)</span>
                                    <p className="text-xs text-zinc-500 mt-0.5">Powered by Gemini Flash</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-white group">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-0.5 group-hover:scale-110 transition-transform"><Icons.Check /></div>
                                <div>
                                    <span><b>CRM Pipeline</b> (Kanban Board)</span>
                                    <p className="text-xs text-zinc-500 mt-0.5">Drag & drop deal management</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 text-white group">
                                <div className="p-1 bg-green-500/20 rounded-full text-green-400 mt-0.5 group-hover:scale-110 transition-transform"><Icons.Check /></div>
                                <div>
                                    <span>Priority Support</span>
                                    <p className="text-xs text-zinc-500 mt-0.5">Direct access to developers</p>
                                </div>
                            </div>
                        </div>

                        <Link href="/pricing">
                            <button className="group w-full py-4 bg-white text-black text-lg font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                                {showTrial ? "Start 3-Day Trial for $1" : "Upgrade to Pro"}
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </Link>

                        <p className="text-center text-[10px] text-zinc-500 mt-4 flex justify-center gap-3 font-medium">
                            <span>🔒 Secure Payment</span>
                            <span>•</span>
                            <span>Money-back Guarantee</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="py-12 bg-black text-center relative z-10 border-t border-white/5">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <div className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-white font-bold">O</div>
            <span className="font-bold text-white">OmniAI Desk</span>
        </div>
        <p className="text-zinc-600 text-sm">© 2025 OmniAI Desk. Built for speed.</p>
    </footer>
);

// --- MAIN PAGE ---

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 scroll-smooth font-sans">
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999]" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}} />

            <Navbar />
            <main>
                <Hero />
                <PainVsGain />
                <BotFeatureHighlight />
                <AIStats />
                <Pricing />
            </main>
            <Footer />
        </div>
    );
}