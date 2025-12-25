"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom"; // 1. Импортируем Portal
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import VoiceMessage from "./VoiceMessage";

// --- ТИПЫ ДАННЫХ ---
interface Message {
    _id: string;
    text: string;
    caption?: string;
    is_lead: boolean;
    createdAt: string;
    type?: 'text' | 'photo' | 'voice' | 'sticker';
    mediaUrl?: string;
}

interface Lead {
    _id: string;
    username: string;
    platform_id: string;
    temperature: 'COLD' | 'WARM' | 'HOT';
    updatedAt: string;
    note?: string;
    ai_draft_response?: string;
}

interface ChatModalProps {
    lead: Lead;
    onClose: () => void;
    onUpdate: (updatedLead: Lead) => void;
}

// --- ИКОНКИ ---
const Icons = {
    Send: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Telegram: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z"/></svg>,
    Edit: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    Trash: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
};

export default function ChatModal({ lead, onClose, onUpdate }: ChatModalProps) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const socket = useSocket();

    // 2. State для Portal (чтобы избежать ошибок гидратации Next.js)
    const [mounted, setMounted] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState(lead.ai_draft_response || "");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Рефы
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Логика заметок
    const [noteText, setNoteText] = useState(lead.note || "");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        setMounted(true); // Компонент смонтирован на клиенте
        return () => setMounted(false);
    }, []);

    // --- ФУНКЦИИ (Сохранены без изменений) ---
    const handleSaveNote = async () => {
        setIsSavingNote(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/leads/${lead._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ note: noteText })
            });
            const data = await res.json();
            if (data.success) {
                setIsEditingNote(false);
                onUpdate(data.lead);
            }
        } catch (e) { console.error(e); } finally { setIsSavingNote(false); }
    };

    const handleDeleteNote = async () => {
        if(!confirm("Delete this note?")) return;
        setNoteText("");
        setIsSavingNote(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/leads/${lead._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ note: "" })
            });
            const data = await res.json();
            if (data.success) {
                onUpdate(data.lead);
            }
        } catch (e) { console.error(e); } finally { setIsSavingNote(false); }
    };

    const tempStyles = {
        COLD: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
        WARM: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        HOT: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    }[lead.temperature] || "bg-zinc-800 text-zinc-400";

    useEffect(() => {
        const fetchMessages = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${API_URL}/messages/${lead._id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setMessages(data.messages);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchMessages();
    }, [lead._id, API_URL]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    useEffect(() => {
        if (!socket) return;
        const handleMessage = (data: { message: Message, leadId: string }) => {
            if (data.leadId === lead._id) {
                setMessages(prev => {
                    // ПРОВЕРКА НА ДУБЛИКАТЫ ПО ID
                    if (prev.some(m => m._id === data.message._id)) {
                        return prev; // Если уже есть, не добавляем
                    }
                    return [...prev, data.message];
                });
            }
        };
        const handleLeadUpdate = (updatedLead: Lead) => {
            if (updatedLead._id === lead._id) {
                if (updatedLead.ai_draft_response) setNewMessage(updatedLead.ai_draft_response);
                onUpdate(updatedLead);
            }
        };
        socket.on('message:new', handleMessage);
        socket.on('lead:update', handleLeadUpdate);
        return () => {
            socket.off('message:new', handleMessage);
            socket.off('lead:update', handleLeadUpdate);
        };
    }, [socket, lead._id, onUpdate]);

    const renderCleanText = (text: string) => {
        if (!text) return null;
        if (text.trim().startsWith('{') && text.includes('"response_draft"')) return null;
        return <span className="block break-words whitespace-pre-wrap">{text}</span>;
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [newMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e as any);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setSending(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_URL}/messages/${lead._id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ text: newMessage }),
            });
            const data = await res.json();
            if (data.success) {
                // ПРОВЕРКА НА ДУБЛИКАТЫ (на всякий случай, хотя при отправке мы получаем его первыми)
                setMessages(prev => {
                    if (prev.some(m => m._id === data.message._id)) return prev;
                    return [...prev, data.message];
                });

                setNewMessage("");
                if (textareaRef.current) textareaRef.current.style.height = "56px";
            }
        } catch (e) { console.error(e); } finally { setSending(false); }
    };

    // Если не смонтировано на клиенте, не рендерим ничего
    if (!mounted) return null;

    // 3. ОБЕРТКА В PORTAL
    // Мы переносим этот div прямо в document.body, минуя все overflow:hidden родительских контейнеров
    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

                {/* --- GLOBAL STYLES FOR SCROLLBARS --- */}
                <style>{`
                    .chat-scrollbar::-webkit-scrollbar { width: 4px; }
                    .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                    .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
                `}</style>

                {/* Backdrop with heavy blur */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                />

                {/* Main Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-5xl h-[85vh] bg-[#030303]/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-white/5 z-[10000]"
                >
                    {/* Decorative Noise */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0" />

                    {/* --- HEADER --- */}
                    <div className="relative shrink-0 border-b border-white/5 flex flex-col justify-center px-8 py-5 z-10 bg-white/[0.01]">
                        {/* Header Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-purple-500/5 blur-[60px] pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all z-50 hover:scale-105 active:scale-95"
                        >
                            <Icons.Close />
                        </button>

                        <div className="flex items-start gap-6 relative z-10">
                            {/* Avatar with Glow */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative w-16 h-16 rounded-full bg-[#111] flex items-center justify-center text-2xl font-bold text-white border border-white/10 shadow-2xl">
                                    {lead.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-[3px] border-[#0a0a0a] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            </div>

                            <div className="flex-1 space-y-2 mt-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white tracking-tight">{lead.username}</h2>
                                    <div className="h-4 w-px bg-white/10 mx-1"></div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] text-[10px] font-bold uppercase tracking-wide shadow-[0_0_10px_rgba(0,136,204,0.15)]">
                                        <Icons.Telegram /> <span className="pt-0.5">Telegram</span>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tempStyles}`}>
                                        {lead.temperature}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">ID: {lead.platform_id}</span>
                                    <span>Updated: {new Date(lead.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* NOTE SECTION */}
                        <div className="mt-4 pt-3 border-t border-white/5 relative">
                            {isEditingNote ? (
                                <div className="flex gap-3 items-center animate-in fade-in slide-in-from-top-2 duration-200">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        className="flex-1 bg-zinc-900/50 border border-purple-500/30 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:bg-zinc-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 placeholder-zinc-600 transition-all shadow-inner"
                                        placeholder="Enter a note about this lead..."
                                    />
                                    <button onClick={handleSaveNote} disabled={isSavingNote} className="h-9 w-9 flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]">
                                        {isSavingNote ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <Icons.Check />}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between group/note">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-wider shrink-0">Note:</span>
                                        <p className="text-sm text-zinc-300 truncate pr-4 leading-none pt-0.5">
                                            {noteText || <span className="text-zinc-600 italic cursor-pointer hover:text-purple-400 transition-colors" onClick={() => setIsEditingNote(true)}>No note added. Click to add...</span>}
                                        </p>
                                    </div>
                                    {(noteText) && (
                                        <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                            <button onClick={() => setIsEditingNote(true)} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-500 hover:text-white transition-colors" title="Edit"><Icons.Edit /></button>
                                            <button onClick={handleDeleteNote} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-500 hover:text-red-400 transition-colors" title="Delete"><Icons.Trash /></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- CHAT AREA --- */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 chat-scrollbar z-0 relative" ref={scrollRef}>
                        {/* Background gradient hint */}
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/5 blur-[100px] rounded-full pointer-events-none" />

                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="w-8 h-8 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 opacity-60">
                                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-4xl shadow-inner">💬</div>
                                <p className="font-light tracking-wide">No messages yet. Start the conversation!</p>
                            </div>
                        ) : messages.map((msg) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg._id}
                                className={`flex ${msg.is_lead ? 'justify-start' : 'justify-end'} relative z-10`}
                            >
                                <div className={`relative px-5 py-3.5 max-w-[70%] rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm transition-all duration-300 ${
                                    msg.is_lead
                                        ? 'bg-white/[0.03] border border-white/[0.08] text-zinc-200 rounded-tl-sm hover:bg-white/[0.05]'
                                        : 'bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white rounded-tr-sm shadow-[0_5px_20px_-5px_rgba(99,102,241,0.4)] border border-white/10'
                                }`}>

                                    {/* Photo */}
                                    {msg.type === 'photo' && msg.mediaUrl && (
                                        <div className="mb-3 rounded-xl overflow-hidden border border-black/20 shadow-sm mt-1">
                                            <img src={msg.mediaUrl} alt="Photo" className="w-full h-auto max-h-[350px] object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    )}

                                    {/* Voice */}
                                    {msg.type === 'voice' && msg.mediaUrl && (
                                        <div className="mb-2 mt-1">
                                            <VoiceMessage src={msg.mediaUrl} isLead={msg.is_lead} />
                                        </div>
                                    )}

                                    {/* Caption */}
                                    {msg.caption && msg.type === 'photo' && (
                                        <div className="mb-2 text-sm font-medium opacity-90">{msg.caption}</div>
                                    )}

                                    {/* Text */}
                                    {msg.text && (
                                        <div className={`${(msg.type === 'voice' || msg.type === 'photo') ? 'text-xs opacity-80 italic border-l-2 border-white/30 pl-3 my-2' : ''}`}>
                                            {renderCleanText(msg.text)}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className={`flex justify-end items-center gap-1 mt-1.5 text-[10px] font-medium ${msg.is_lead ? 'text-zinc-500' : 'text-white/60'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        {!msg.is_lead && <span className="opacity-80"><Icons.Check /></span>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* --- INPUT AREA --- */}
                    <div className="p-6 bg-[#030303]/90 border-t border-white/5 backdrop-blur-xl z-20">
                        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-4 items-end">
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                                <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl focus-within:bg-[#0a0a0a] focus-within:border-white/20 transition-all shadow-inner overflow-hidden">
                                    <textarea
                                        ref={textareaRef}
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={1}
                                        className="w-full bg-transparent text-zinc-100 placeholder-zinc-600 px-5 py-4 rounded-xl focus:outline-none resize-none overflow-y-auto chat-scrollbar"
                                        style={{ minHeight: "58px", maxHeight: "150px" }}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                type="submit" disabled={sending || !newMessage.trim()}
                                className="w-14 h-14 shrink-0 bg-gradient-to-br from-white to-zinc-200 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                            >
                                {sending ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Icons.Send />}
                            </motion.button>
                        </form>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>,
        document.body // Рендерим в body
    );
}