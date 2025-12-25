"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// --- КОНСТАНТЫ АНИМАЦИИ ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// --- КОМПОНЕНТЫ ИКОНОК (SVG) ---
const Icons = {
  Zap: () => <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Chart: () => <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Telegram: () => <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z" /></svg>,
  Check: () => <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Bot: () => <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Brain: () => <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
};

// --- КОМПОНЕНТЫ UI ---

const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300">
            O
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-purple-200 transition-colors">OmniAI Desk</span>
        </div>

        {/* Anchor Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
            How it Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
          </a>
          <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/signin" className="hidden sm:block text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard">
            <button className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
);

const Hero = () => (
    <section className="relative pt-40 pb-28 lg:pt-52 lg:pb-40 px-6 text-center overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>

          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-300 text-xs font-medium backdrop-blur-md shadow-lg">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
              New: Multi-modal AI Analysis 2.0
            </div>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-6xl lg:text-8xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
            Your AI Sales Manager <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 animate-gradient-x">
                        That Never Sleeps
                    </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect Telegram, automate responses with Gemini Flash, and manage leads in a smart Kanban board. Close more deals automatically.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white/10">
                Start for Free
              </button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900/50 backdrop-blur-md text-white font-medium rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                See How It Works
              </button>
            </a>
          </motion.div>

        </motion.div>
      </div>
    </section>
);

const Features = () => (
    <section id="features" className="py-32 px-6 relative bg-[#050505]">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Supercharge Your Workflow</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Replace manual work with intelligent automation. Everything you need to manage leads effectively.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Multimodal AI",
              desc: "Processes text, voice messages, and images. The AI understands context and drafts perfect replies in seconds.",
              icon: <Icons.Brain />,
              gradient: "from-yellow-500/20 to-orange-500/5"
            },
            {
              title: "Smart Pipeline",
              desc: "Trello-like Kanban board. Drag and drop leads, add notes, and track statuses in real-time.",
              icon: <Icons.Chart />,
              gradient: "from-blue-500/20 to-cyan-500/5"
            },
            {
              title: "Telegram Integration",
              desc: "Connect your personal account or Bots via API. Manage all chats and leads from one unified dashboard.",
              icon: <Icons.Telegram />,
              gradient: "from-sky-500/20 to-blue-500/5"
            }
          ].map((feature, i) => (
              <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">{feature.desc}</p>
                </div>
              </motion.div>
          ))}
        </div>
      </div>
    </section>
);

const HowItWorks = () => (
    <section id="how-it-works" className="py-32 px-6 relative border-t border-white/5 bg-zinc-900/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Setup in 3 Minutes</h2>
          <p className="text-zinc-400 text-lg">No complex configuration. Just connect and sell.</p>
        </motion.div>

        <div className="space-y-20 relative before:absolute before:left-8 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-purple-500/50 before:to-transparent">
          {[
            {
              step: "01",
              title: "Connect Telegram",
              text: "Scan the QR code to link your personal account or insert a Bot Token from BotFather.",
              icon: <Icons.Telegram />
            },
            {
              step: "02",
              title: "Set Business Context",
              text: "Tell the AI about your business, pricing, and tone of voice. It learns instantly.",
              icon: <Icons.Zap />
            },
            {
              step: "03",
              title: "Auto-Pilot Sales",
              text: "Watch as leads appear in your pipeline. The AI drafts responses, you just approve and close.",
              icon: <Icons.Bot />
            }
          ].map((item, i) => (
              <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col md:flex-row items-center gap-10 relative ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Dot on timeline */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-black border-2 border-purple-500 rounded-full z-10 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />

                <div className={`flex-1 md:w-1/2 pl-20 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-16" : "md:text-left md:pl-16"}`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 mb-4 text-purple-400 ${i % 2 === 0 ? "md:ml-auto" : ""}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{item.text}</p>
                </div>

                <div className="hidden md:block flex-1" />
              </motion.div>
          ))}
        </div>
      </div>
    </section>
);

const Pricing = () => (
    <section id="pricing" className="py-32 px-6 relative border-t border-white/5 bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-zinc-400 text-lg">Start free, upgrade when you grow.</p>
        </div>

        <div className="flex justify-center">

          {/* Pro */}
          <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-10 rounded-3xl bg-[#09090b] border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col scale-105 z-10"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
            <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30">
              MOST POPULAR
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
            <div className="text-5xl font-bold text-white mb-1">$10 <span className="text-lg font-normal text-zinc-500">/ mo</span></div>
            <p className="text-zinc-500 text-sm mb-8">Everything in Starter, plus:</p>

            <ul className="space-y-5 mb-10 flex-1">
              <li className="text-white text-sm flex gap-3 items-center"><Icons.Check /> <span className="font-semibold text-purple-300">AI Auto-Reply</span> (Gemini Flash)</li>
              <li className="text-white text-sm flex gap-3 items-center"><Icons.Check /> Voice & Image Recognition</li>
              <li className="text-white text-sm flex gap-3 items-center"><Icons.Check /> Unlimited Telegram Bots</li>
              <li className="text-white text-sm flex gap-3 items-center"><Icons.Check /> Priority Support</li>
            </ul>

            <Link href="/dashboard" className="mt-auto">
              <button className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">
                Get Pro Access
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
);

const Footer = () => (
    <footer className="py-12 border-t border-white/5 bg-black text-center relative z-10">
      <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
        <div className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-white font-bold">O</div>
        <span className="font-bold text-white">OmniAI Desk</span>
      </div>
      <p className="text-zinc-600 text-sm">© 2025 OmniAI Desk. All rights reserved.</p>
    </footer>
);

// --- ГЛАВНАЯ СТРАНИЦА ---

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 scroll-smooth">
        {/* Global Noise Overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999]" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}} />

        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <Pricing />
        </main>
        <Footer />
      </div>
  );
}