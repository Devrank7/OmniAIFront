"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useStore";

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useUserStore();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (!user) return null;

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">

            {/* Background FX */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto relative z-10"
            >
                <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

                {/* --- CARD: MAIN INFO --- */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar Big */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1">
                                {user.avatar ? (
                                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="Avatar" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-3xl font-bold text-white">
                                        {user.first_name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-zinc-900 rounded-full"></div>
                        </div>

                        <div className="text-center sm:text-left flex-1">
                            <h2 className="text-2xl font-bold text-white">{user.first_name} {user.last_name}</h2>
                            <p className="text-zinc-400 mb-4">{user.email}</p>

                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                                Pro Plan (Trial)
                            </div>
                        </div>

                        <button className="hidden sm:block px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors">
                            Edit
                        </button>
                    </div>
                </div>

                {/* --- CARD: DETAILS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-xl">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">User ID</span>
                        <p className="text-zinc-300 font-mono text-sm mt-1">{user.id}</p>
                    </div>
                    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-xl">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</span>
                        <p className="text-zinc-300 mt-1">Administrator</p>
                    </div>
                </div>

                {/* --- NAVIGATION BUTTON (GO TO DASHBOARD) --- */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-white mb-4">Workspace</h3>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/dashboard")}
                        className="w-full group relative p-[1px] rounded-xl overflow-hidden"
                    >
                        {/* Градиентный бордер */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-xy" />

                        {/* Контент кнопки */}
                        <div className="relative bg-zinc-900 rounded-[11px] p-4 flex items-center justify-between group-hover:bg-zinc-800/90 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-semibold">Open CRM Pipeline</h4>
                                    <p className="text-zinc-400 text-xs">Go back to your Kanban board</p>
                                </div>
                            </div>

                            {/* Стрелочка */}
                            <div className="mr-2 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </motion.button>
                </div>

                {/* --- DANGER ZONE (LOGOUT) --- */}
                <div className="border-t border-white/10 pt-8">
                    <h3 className="text-lg font-medium text-white mb-4">Account Actions</h3>
                    <div className="flex justify-between items-center bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                        <div>
                            <p className="text-zinc-300 text-sm font-medium">Log out of session</p>
                            <p className="text-zinc-500 text-xs mt-0.5">You will need to sign in again.</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Log Out
                        </button>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}