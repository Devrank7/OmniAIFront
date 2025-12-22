"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ChatItem {
    id: string;
    name: string;
    username?: string;
    is_ignored: boolean;
}

const Icons = {
    Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

export default function ManageChatsModal({ onClose }: { onClose: () => void }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Загрузка чатов
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_URL}/telegram/dialogs`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setChats(data.dialogs);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    // Тоггл игнора
    const handleToggle = async (chatId: string, currentStatus: boolean) => {
        // Оптимистичное обновление UI
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_ignored: !currentStatus } : c));

        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/telegram/ignore`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ chatId, ignore: !currentStatus })
            });
        } catch (e) {
            console.error("Failed to toggle ignore", e);
            // Откат при ошибке
            setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_ignored: currentStatus } : c));
        }
    };

    const filteredChats = chats.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-[#09090b] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">Manage Ignored Chats</h3>
                        <p className="text-xs text-zinc-400">Select personal chats to exclude from CRM</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Icons.Close /></button>
                </div>

                {/* Search */}
                <div className="relative mb-4 shrink-0">
                    <div className="absolute left-3 top-2.5 text-zinc-500"><Icons.Search /></div>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin"/></div>
                    ) : filteredChats.length === 0 ? (
                        <div className="text-center text-zinc-500 py-10 text-sm">No personal chats found</div>
                    ) : (
                        filteredChats.map(chat => (
                            <div key={chat.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-zinc-800 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-white/10">
                                        {chat.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium text-white truncate">{chat.name}</span>
                                        {chat.username && <span className="text-xs text-zinc-500 truncate">@{chat.username}</span>}
                                    </div>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                    onClick={() => handleToggle(chat.id, chat.is_ignored)}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out shrink-0 ${chat.is_ignored ? 'bg-red-500' : 'bg-zinc-700'}`}
                                >
                                    <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${chat.is_ignored ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

            </motion.div>
        </div>
    );
}