"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TelegramConnectPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Phone, 2: Code, 3: Password
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ШАГ 1: ОТПРАВИТЬ НОМЕР
    const handleSendPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/telegram/send-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ШАГ 2: ВВЕСТИ КОД
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/telegram/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            if (data.requires2FA) {
                setStep(3); // Нужен пароль
            } else {
                router.push("/dashboard?connected=true"); // Успех!
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ШАГ 3: 2FA ПАРОЛЬ
    const handleVerifyPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/telegram/verify-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            router.push("/dashboard?connected=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl relative"
            >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z" /></svg>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-2">Connect Telegram</h2>
                <p className="text-center text-zinc-400 text-sm mb-8">
                    {step === 1 && "Enter your phone number to start"}
                    {step === 2 && `Enter the code sent to ${phone}`}
                    {step === 3 && "Enter your Cloud Password (2FA)"}
                </p>

                {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded text-center">{error}</div>}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form key="step1" onSubmit={handleSendPhone} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: 20, opacity: 0}}>
                            <input
                                type="text" placeholder="+1234567890"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-blue-500 outline-none transition-colors"
                                value={phone} onChange={e => setPhone(e.target.value)} required
                            />
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors">
                                {loading ? "Sending..." : "Send Code"}
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form key="step2" onSubmit={handleVerifyCode} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: 20, opacity: 0}}>
                            <input
                                type="text" placeholder="12345"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-blue-500 outline-none text-center tracking-widest text-lg"
                                value={code} onChange={e => setCode(e.target.value)} required
                            />
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors">
                                {loading ? "Verifying..." : "Verify Code"}
                            </button>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form key="step3" onSubmit={handleVerifyPassword} initial={{x: -20, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{x: 20, opacity: 0}}>
                            <input
                                type="password" placeholder="Cloud Password"
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white mb-4 focus:border-blue-500 outline-none"
                                value={password} onChange={e => setPassword(e.target.value)} required
                            />
                            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors">
                                {loading ? "Unlocking..." : "Submit Password"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}