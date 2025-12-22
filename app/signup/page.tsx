"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Тот же компонент иконки
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
);

export default function SignUpPage() {
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

    // Состояния
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Code, 3: Details
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Данные формы
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [details, setDetails] = useState({ first_name: "", last_name: "", password: "" });

    // --- ШАГ 1: ОТПРАВКА КОДА ---
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/send-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }), // Отправляем email
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to send verification code");
            }

            console.log("Code sent successfully");
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- ШАГ 2: ПРОВЕРКА КОДА (REAL) ---
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/verify-code`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code }), // Отправляем и email, и код
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Invalid code");
            }

            // Если всё ок, переходим к заполнению данных
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- ШАГ 3: РЕГИСТРАЦИЯ (REAL) ---
    // Не забудь обновить и эту функцию, чтобы использовать API_URL
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                email,
                first_name: details.first_name,
                last_name: details.last_name,
                password: details.password
            };

            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Registration failed");
            }

            // Сохраняем токен
            localStorage.setItem("token", data.token);

            // ИЗМЕНЕНИЕ: Отправляем на заполнение инфы
            router.push("/onboarding");

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Браузер сам перейдет по ссылке
        window.location.href = `${API_URL}/auth/google`;
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                            <span className="font-bold text-white text-xl">O</span>
                        </div>
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                    <p className="text-zinc-400 text-sm mt-2">
                        {step === 1 && "Start with your email"}
                        {step === 2 && `Enter code sent to ${email}`}
                        {step === 3 && "Finish setting up your profile"}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Анимация смены шагов */}
                <div className="min-h-[200px]">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: EMAIL */}
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSendCode}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Email address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black font-semibold rounded-lg py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                >
                                    {loading ? "Sending Code..." : "Continue with Email"}
                                </button>
                            </motion.form>
                        )}

                        {/* STEP 2: CODE */}
                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleVerifyCode}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Verification Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center tracking-[0.5em] text-lg font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-white/5 text-zinc-400 font-semibold rounded-lg py-2.5 hover:bg-white/10 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-white text-black font-semibold rounded-lg py-2.5 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? "Verifying..." : "Verify Code"}
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {/* STEP 3: DETAILS */}
                        {step === 3 && (
                            <motion.form
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            value={details.first_name}
                                            onChange={(e) => setDetails({...details, first_name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            value={details.last_name}
                                            onChange={(e) => setDetails({...details, last_name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Set Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        value={details.password}
                                        onChange={(e) => setDetails({...details, password: e.target.value})}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/25"
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>
                            </motion.form>
                        )}

                    </AnimatePresence>
                </div>

                {/* Разделитель и Google только на первом шаге, чтобы не отвлекать */}
                {step === 1 && (
                    <>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#09090b] px-2 text-zinc-500">Or sign up with</span></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white/5 border border-white/10 text-white font-medium rounded-lg py-2.5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <GoogleIcon />
                            <span>Google</span>
                        </button>
                    </>
                )}

                <p className="mt-8 text-center text-sm text-zinc-500">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
                </p>

            </motion.div>
        </div>
    );
}