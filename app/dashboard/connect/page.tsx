"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Platforms = [
    { id: 'telegram', name: 'Telegram', color: 'bg-blue-500', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z' },
    { id: 'whatsapp', name: 'WhatsApp', color: 'bg-green-500', disabled: true },
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', disabled: true },
];

export default function ConnectPlatformPage() {
    return (
        <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-2">Connect Platform</h1>
                <p className="text-zinc-400 mb-8">Choose a messenger to integrate with your AI CRM.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Platforms.map((platform) => (
                        <Link
                            key={platform.id}
                            href={platform.disabled ? '#' : `/dashboard/connect/${platform.id}`}
                            className={`block relative group ${platform.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                            <motion.div
                                whileHover={!platform.disabled ? { scale: 1.02 } : {}}
                                whileTap={!platform.disabled ? { scale: 0.98 } : {}}
                                className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 h-48 flex flex-col justify-between overflow-hidden"
                            >
                                <div className={`w-12 h-12 rounded-xl ${platform.color} bg-opacity-20 flex items-center justify-center text-white mb-4`}>
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d={platform.icon || "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"} /></svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {platform.disabled ? 'Coming Soon' : 'Available'}
                                    </p>
                                </div>
                                {/* Glow Effect */}
                                <div className={`absolute inset-0 ${platform.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}