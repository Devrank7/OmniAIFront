"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// --- ТИПЫ ДАННЫХ ---
interface Message {
    _id: string;
    text: string;
    is_lead: boolean;
    createdAt: string;
}

interface Lead {
    _id: string;
    username: string;
    platform_id: string;
    temperature: 'COLD' | 'WARM' | 'HOT';
    updatedAt: string;
    note?: string;
}

// Добавляем onUpdate в пропсы
interface ChatModalProps {
    lead: Lead;
    onClose: () => void;
    onUpdate: (updatedLead: Lead) => void; // <--- Callback для обновления родителя
}

// --- ИКОНКИ ---
const Icons = {
    Send: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
    Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Telegram: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z"/></svg>,
    Edit: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    Trash: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Check: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
};

export default function ChatModal({ lead, onClose, onUpdate }: ChatModalProps) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- ЛОГИКА ЗАМЕТКИ ---
    const [noteText, setNoteText] = useState(lead.note || "");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);

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
                // ВАЖНО: Обновляем родительский стейт
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
        COLD: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
        WARM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
        HOT: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
    }[lead.temperature] || "bg-zinc-800 text-zinc-400";

    // --- ЗАГРУЗКА СООБЩЕНИЙ ---
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

    // Автоскролл
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, loading]);

    // --- ОТПРАВКА СООБЩЕНИЯ ---
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
                setMessages([...messages, data.message]);
                setNewMessage("");
            }
        } catch (e) { console.error(e); } finally { setSending(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md"/>

            {/* Main Container */}
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-5xl h-[90vh] bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="relative shrink-0 bg-gradient-to-b from-zinc-900 to-[#09090b] border-b border-white/5 flex flex-col justify-center px-10 py-6">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-purple-500/5 blur-[80px] pointer-events-none" />
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors z-10"><Icons.Close /></button>

                    <div className="flex items-start gap-8 relative z-10">
                        <div className="relative group mt-1">
                            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10 shadow-2xl group-hover:border-purple-500/50 transition-colors">{lead.username.charAt(0).toUpperCase()}</div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-[#09090b] rounded-full shadow-lg" />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-white tracking-tight">{lead.username}</h2>
                                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium uppercase tracking-wide"><Icons.Telegram /> Telegram</div>
                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tempStyles}`}>{lead.temperature}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span className="font-mono bg-white/5 px-2 py-0.5 rounded">ID: {lead.platform_id}</span>
                                <span>Active: {new Date(lead.updatedAt).toLocaleDateString()}</span>
                            </div>

                            {/* NOTE SECTION */}
                            <div className="mt-2 pt-2 border-t border-white/5">
                                {isEditingNote ? (
                                    <div className="flex gap-2 items-center">
                                        <input autoFocus type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} className="flex-1 bg-black/40 border border-purple-500/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder-zinc-600" placeholder="Enter a note about this lead..." />
                                        <button onClick={handleSaveNote} disabled={isSavingNote} className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors">{isSavingNote ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <Icons.Check />}</button>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between group/note">
                                        <p className="text-sm text-zinc-300 italic pr-4">
                                            {noteText ? <><span className="text-zinc-500 not-italic font-bold text-[10px] uppercase mr-2">Note:</span>{noteText}</> : <span className="text-zinc-600 not-italic cursor-pointer hover:text-zinc-400 transition-colors" onClick={() => setIsEditingNote(true)}>+ Add a note</span>}
                                        </p>
                                        {(noteText) && (
                                            <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
                                                <button onClick={() => setIsEditingNote(true)} className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-blue-400" title="Edit Note"><Icons.Edit /></button>
                                                <button onClick={handleDeleteNote} className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-red-400" title="Delete Note"><Icons.Trash /></button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHAT AREA */}
                <div className="flex-1 bg-black/20 overflow-y-auto p-8 space-y-4 scroll-smooth" ref={scrollRef}>
                    {loading ? <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin" /></div> : messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4"><div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl">💬</div><p>No messages yet. Start the conversation!</p></div> : messages.map((msg) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg._id} className={`flex ${msg.is_lead ? 'justify-start' : 'justify-end'}`}>
                            <div className={`relative px-4 py-2 max-w-[65%] rounded-2xl text-sm leading-relaxed shadow-sm min-w-[80px] ${msg.is_lead ? 'bg-zinc-800 border border-white/5 text-zinc-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none shadow-[0_5px_15px_rgba(37,99,235,0.2)]'}`}>
                                <span className="break-words">{msg.text}</span>
                                <span className={`float-right ml-3 mt-1 text-[10px] flex items-center gap-1 select-none ${msg.is_lead ? 'text-zinc-500' : 'text-blue-200 opacity-80'}`}>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}{!msg.is_lead && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* INPUT */}
                <div className="p-6 bg-[#09090b] border-t border-white/5">
                    <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-4">
                        <div className="relative flex-1"><input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-6 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all shadow-inner" /></div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={sending || !newMessage.trim()} className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all">{sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icons.Send />}</motion.button>
                    </form>
                </div>

            </motion.div>
        </div>
    );
}