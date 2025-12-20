"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from "framer-motion";
import { useUserStore } from "@/store/useStore"; // <--- ИМПОРТИРУЕМ СТОР

// --- КОМПОНЕНТЫ ИКОНОК ---
const CheckIcon = () => (
    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

// --- КОМПОНЕНТ "SPOTLIGHT CARD" ---
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
      <div
          className={`group relative border border-white/10 bg-zinc-900/50 overflow-hidden rounded-xl ${className}`}
          onMouseMove={handleMouseMove}
      >
        <motion.div
            className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
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

// --- ОСНОВНАЯ СТРАНИЦА ---
export default function Home() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  // --- ЛОГИКА АВТОРИЗАЦИИ ---
  const { user, fetchUser } = useUserStore();
  const [mounted, setMounted] = useState(false);

  // Проверяем авторизацию при загрузке (чтобы избежать ошибок гидратации)
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (token && !user) {
      fetchUser();
    }
  }, [fetchUser, user]);

  return (
      <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">

        {/* --- ЖИВОЙ ФОН --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/30 blur-[120px]"
          />
          <motion.div
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 50, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[120px]"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        {/* --- NAVBAR --- */}
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <span className="font-bold text-white">O</span>
              </div>
              <span className="font-semibold text-xl tracking-tight">OmniAI Desk</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              {['Возможности', 'Как это работает', 'Тарифы'].map((item) => (
                  <Link key={item} href={`#${item}`} className="hover:text-white transition-colors relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
                  </Link>
              ))}
            </div>

            {/* --- ПРАВАЯ ЧАСТЬ НАВБАРА (КНОПКИ) --- */}
            <div className="flex items-center gap-4">
              {/* Показываем контент только когда клиент загрузился (mounted), чтобы не было мерцания */}
              {mounted && user ? (
                  // ЕСЛИ АВТОРИЗОВАН
                  <>
                    <Link href="/dashboard/profile" className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                      {user.avatar ? (
                          <img src={user.avatar} alt="Ava" className="w-8 h-8 rounded-full border border-white/10" />
                      ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 text-xs font-bold text-white">
                            {user.first_name?.[0]}
                          </div>
                      )}
                      <span className="hidden lg:inline">{user.first_name}</span>
                    </Link>

                    <Link href="/dashboard">
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-full hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all"
                      >
                        Dashboard
                      </motion.button>
                    </Link>
                  </>
              ) : (
                  // ЕСЛИ ГОСТЬ
                  <>
                    <Link href="/signin" className="hidden sm:block text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                      Sign In
                    </Link>
                    <Link href="/signup">
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                      >
                        Sign Up
                      </motion.button>
                    </Link>
                  </>
              )}
            </div>
          </div>
        </motion.nav>

        <main className="relative z-10 flex flex-col items-center pt-32 pb-20 px-6 sm:px-12">

          {/* --- HERO SECTION --- */}
          <motion.div
              ref={targetRef}
              style={{ opacity, scale, y }}
              className="max-w-4xl w-full text-center flex flex-col items-center gap-8 mb-24 relative"
          >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-4 backdrop-blur-md"
            >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
              AI-CRM V2.0 is Live
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500"
            >
              Ваш отдел продаж <br />
              на <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">автопилоте</span>.
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed"
            >
              OmniAI анализирует лиды из Telegram, WhatsApp и Instagram.
              ИИ определяет теплоту, отвечает клиентам и бронирует встречи.
              <span className="text-white font-medium"> Вы просто нажимаете Approve.</span>
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto"
            >
              {/* МЕНЯЕМ ССЫЛКУ GET STARTED В ЗАВИСИМОСТИ ОТ АВТОРИЗАЦИИ */}
              <Link href={mounted && user ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(147, 51, 234, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full h-14 px-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg flex items-center justify-center gap-2"
                >
                  {mounted && user ? "Open Dashboard" : "Get Started"}
                </motion.button>
              </Link>

              <Link href="#demo" className="w-full sm:w-auto">
                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full h-14 px-8 rounded-full border border-zinc-700 bg-zinc-900/50 text-zinc-300 font-medium text-lg flex items-center justify-center"
                >
                  Посмотреть демо
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* ... ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ (ВИЗУАЛ) ... */}
          {/* --- DYNAMIC INTERFACE PREVIEW --- */}
          <motion.div
              initial={{ opacity: 0, rotateX: 20, y: 100 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring", bounce: 0.2 }}
              className="relative w-full max-w-5xl aspect-[16/9] rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-md shadow-2xl overflow-hidden mb-32 perspective-1000"
          >
            {/* Animated Glow Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite] pointer-events-none" />

            {/* Fake UI Header */}
            <div className="absolute top-0 w-full h-10 border-b border-white/5 bg-black/40 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-4 w-64 h-2 rounded-full bg-white/10" />
            </div>

            {/* Fake UI Content */}
            <div className="absolute inset-0 pt-10 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Sidebar with Staggered Items */}
              <div className="hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Входящие</div>
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className={`p-3 rounded-lg border flex items-center gap-3 ${i === 1 ? 'bg-zinc-800/50 border-white/10' : 'border-transparent opacity-50'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5'}`}>
                        {i === 1 ? 'TG' : 'WA'}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-20 bg-white/20 rounded mb-1" />
                        <div className="h-2 w-12 bg-white/10 rounded" />
                      </div>
                    </motion.div>
                ))}
              </div>

              {/* AI Action Center */}
              <div className="md:col-span-2 flex flex-col justify-center items-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="relative p-6 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-white/10 shadow-xl max-w-md w-full"
                >
                  <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    AI THINKING...
                  </motion.div>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-sm text-zinc-400">Теплота:</span>
                      <motion.span
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 1 }}
                          className="text-sm font-bold text-emerald-400"
                      >
                        🔥 Hot (85%)
                      </motion.span>
                    </div>

                    <div className="bg-zinc-950/50 p-3 rounded-md border border-white/5 relative overflow-hidden">
                      <motion.div
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 2, delay: 1.5 }}
                          className="whitespace-nowrap overflow-hidden text-sm text-zinc-300 italic"
                      >
                        "Здравствуйте! Да, можем созвониться..."
                      </motion.div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2 bg-white text-black rounded-lg font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckIcon /> Approve & Send
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* --- FEATURES GRID (Bento Style) --- */}
          <section id="features" className="max-w-7xl w-full mb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Больше чем просто CRM</h2>
              <p className="text-zinc-400">Полный контроль с помощью нейросетей.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SpotlightCard className="p-8">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Умный Скорринг</h3>
                <p className="text-zinc-400">Автоматическая квалификация лидов на основе анализа текста сообщений.</p>
              </SpotlightCard>

              <SpotlightCard className="p-8">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Омниканальность</h3>
                <p className="text-zinc-400">Единое окно для Telegram, WhatsApp и Instagram. История не теряется.</p>
              </SpotlightCard>

              <SpotlightCard className="p-8">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Human-in-the-Loop</h3>
                <p className="text-zinc-400">ИИ предлагает — вы утверждаете. Полный контроль качества ответов.</p>
              </SpotlightCard>
            </div>
          </section>

          {/* --- DYNAMIC STEPS --- */}
          <section className="max-w-4xl w-full mb-20 border-t border-white/10 pt-20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex-1 space-y-12">
                <h2 className="text-3xl font-bold">Как это работает?</h2>

                {[
                  { id: 1, title: "Инструктаж", text: "Загрузите PDF о продукте или опишите словами." },
                  { id: 2, title: "Анализ", text: "ИИ читает каждое входящее сообщение 24/7." },
                  { id: 3, title: "Profit", text: "Подтверждайте готовые ответы одним кликом." }
                ].map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex gap-4 group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 group-hover:border-purple-500 group-hover:bg-purple-500/20 transition-colors flex items-center justify-center text-sm font-bold shadow-lg z-10">
                          {step.id}
                        </div>
                        {step.id !== 3 && <div className="w-px h-16 bg-zinc-800 my-2 group-hover:bg-zinc-700 transition-colors"></div>}
                      </div>
                      <div className="pt-2">
                        <h4 className="text-xl font-medium text-white group-hover:text-purple-300 transition-colors">{step.title}</h4>
                        <p className="text-sm text-zinc-400 mt-2">{step.text}</p>
                      </div>
                    </motion.div>
                ))}

              </div>

              <motion.div
                  initial={{ rotate: 5, opacity: 0 }}
                  whileInView={{ rotate: 0, opacity: 1 }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="flex-1 relative h-[400px] w-full bg-gradient-to-tr from-zinc-900 to-black rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="text-center p-6 relative z-10">
                  <motion.div
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="text-7xl mb-6"
                  >
                    🚀
                  </motion.div>
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Автоматизация
                  </div>
                  <p className="text-zinc-500 mt-2 text-lg">Ваш бизнес на сверхзвуке</p>
                </div>
              </motion.div>
            </div>
          </section>

        </main>

        {/* --- FOOTER --- */}
        <footer className="border-t border-white/10 bg-black py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
            <p>© 2025 OmniAI Desk.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
  );
}