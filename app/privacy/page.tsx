"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Анимация для текстовых блоков (появление снизу)
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-purple-500/30">

            {/* --- BACKGROUND (Тот же, что на главной) --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* --- NAVBAR (Упрощенный, только кнопка назад) --- */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl h-16 flex items-center px-6">
                <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors">Back to Home</span>
                    </Link>
                    <span className="font-semibold text-white tracking-tight">OmniAI Desk</span>
                </div>
            </nav>

            {/* --- CONTENT --- */}
            <main className="relative z-10 pt-32 pb-20 px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-3xl mx-auto"
                >
                    {/* Header */}
                    <motion.div variants={fadeInUp} className="mb-12 border-b border-white/10 pb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Privacy Policy</h1>
                        <p className="text-zinc-500">Last updated: December 18, 2025</p>
                    </motion.div>

                    {/* Legal Text Blocks */}
                    <div className="space-y-12">

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                1. Introduction
                            </h2>
                            <p className="leading-relaxed">
                                Welcome to OmniAI Desk ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This policy explains how we process data when you use our AI-CRM services integrating Telegram, WhatsApp, and Instagram.
                            </p>
                        </motion.section>

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                2. Data We Collect
                            </h2>
                            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
                                <ul className="space-y-4 list-disc list-inside">
                                    <li><strong className="text-zinc-200">Account Data:</strong> Name, email address, password hash, and profile picture (via Google OAuth).</li>
                                    <li><strong className="text-zinc-200">Integration Data:</strong> Session tokens for Telegram/WhatsApp/Instagram needed to fetch messages.</li>
                                    <li><strong className="text-zinc-200">Communication Data:</strong> Message history, lead usernames, and media files processed by our AI.</li>
                                </ul>
                            </div>
                        </motion.section>

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                3. How We Use AI
                            </h2>
                            <p className="leading-relaxed mb-4">
                                Our core service utilizes Artificial Intelligence (LLMs) to analyze lead "temperature" and generate draft responses.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-white">Important:</strong> We do not use your private customer conversations to train our public AI models. Your data is processed in an isolated environment and is used solely to generate responses for your specific account.
                            </p>
                        </motion.section>

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                                4. Data Retention & Security
                            </h2>
                            <p className="leading-relaxed">
                                We use industry-standard encryption (AES-256) for storing API keys and session tokens. You can request full data deletion at any time via your account dashboard ("Delete Account" option), which triggers a cascade deletion of all your leads, messages, and settings.
                            </p>
                        </motion.section>

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                                5. Contact Us
                            </h2>
                            <p className="leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at: <br />
                                <a href="mailto:privacy@omniai.desk" className="text-purple-400 hover:text-purple-300 transition-colors">privacy@omniai.desk</a>
                            </p>
                        </motion.section>

                    </div>
                </motion.div>
            </main>
        </div>
    );
}