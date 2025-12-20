"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    visible: { transition: { staggerChildren: 0.1 } }
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-400 font-sans selection:bg-blue-500/30">

            {/* --- BACKGROUND --- */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl h-16 flex items-center px-6">
                <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Back to Home</span>
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
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Terms of Use</h1>
                        <p className="text-zinc-500">Last updated: December 18, 2025</p>
                    </motion.div>

                    <div className="space-y-12">

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing or using OmniAI Desk, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
                            </p>
                        </motion.section>

                        {/* Важный блок про ИИ */}
                        <motion.section variants={fadeInUp}>
                            <h2 className="text-xl font-bold text-white mb-3">2. AI Limitations & "Human-in-the-Loop"</h2>
                            <div className="p-5 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                                <h3 className="text-yellow-200 font-semibold mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Disclaimer
                                </h3>
                                <p className="text-zinc-300 text-sm leading-relaxed">
                                    OmniAI Desk uses artificial intelligence to generate suggested responses. AI can make mistakes ("hallucinations"). You acknowledge that you are solely responsible for reviewing and approving all messages before they are sent to your clients. We are not liable for any loss of business resulting from AI-generated content.
                                </p>
                            </div>
                        </motion.section>

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-xl font-bold text-white mb-3">3. Acceptable Use</h2>
                            <p className="leading-relaxed mb-4">
                                You agree not to use OmniAI Desk for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-4">
                                <li>Sending spam or unsolicited bulk messages (violating Telegram/Meta policies).</li>
                                <li>Harassing, abusive, or illegal content.</li>
                                <li>Reverse engineering our API or scraping data.</li>
                            </ul>
                        </motion.section>

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-xl font-bold text-white mb-3">4. Subscription & Billing</h2>
                            <p className="leading-relaxed">
                                Services are billed on a subscription basis. You can cancel your subscription at any time. Refunds are processed according to our Refund Policy (within 14 days of initial purchase).
                            </p>
                        </motion.section>

                        <motion.section variants={fadeInUp}>
                            <h2 className="text-xl font-bold text-white mb-3">5. Termination</h2>
                            <p className="leading-relaxed">
                                We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms (e.g., using the bot for spam).
                            </p>
                        </motion.section>

                        <motion.section variants={fadeInUp} className="pt-8 border-t border-white/10">
                            <p className="text-sm text-zinc-500">
                                Questions? Email us at <a href="mailto:legal@omniai.desk" className="text-blue-400 hover:underline">legal@omniai.desk</a>
                            </p>
                        </motion.section>

                    </div>
                </motion.div>
            </main>
        </div>
    );
}