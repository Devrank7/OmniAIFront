"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useUserStore } from "@/store/useStore";
import ChatModal from "./components/ChatDrawer";
import {useSocket} from "@/hooks/useSocket";
import BotDetailsModal from "@/app/dashboard/components/BotDetailsModal";
import ManageChatsModal from "@/app/dashboard/components/ManageChatsModal";

// --- ТИПЫ ---
interface Status { _id: string; name: string; order: number; }
interface TelegramBotInfo { _id: string; bot_token: string; start_message: string; createdAt: string; }
interface Lead {
    _id: string;
    username: string;
    status: string;
    temperature: 'COLD'|'WARM'|'HOT';
    platform_id: string;
    updatedAt: string;
    note?: string;
    last_message?: string; // <--- Добавили поле
}
interface TelegramInfo { _id: string; number: string; is_active: boolean; createdAt: string; }

// --- ИКОНКИ ---
const Icons = {
    Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    Dots: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
    Telegram: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.48-1.05-2.4-1.66-1.06-.7-.38-1.09.24-1.73.16-.17 2.93-2.69 2.98-2.92.01-.03.01-.14-.05-.2-.06-.07-.17-.04-.25-.02-.11.02-1.91 1.2-5.39 3.56-.51.35-.96.52-1.37.51-.45-.01-1.32-.26-1.96-.46-.79-.25-1.42-.38-1.37-.81.03-.22.33-.44.91-.67 3.55-1.55 5.93-2.57 7.13-3.07 3.41-1.41 4.12-1.66 4.58-1.67.1 0 .32.02.47.14.12.11.16.26.17.41 0 .06.01.27-.01.39z"/>
        </svg>
    ),
    Close: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Note: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Filter: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    Bot: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
};

// --- КОМПОНЕНТ КАРТОЧКИ ---
function LeadCard({ lead, index, onDelete, onAddNote, onDeleteNote, onClick }: {
    lead: Lead; index: number;
    onDelete: (id: string) => void;
    onAddNote: (lead: Lead) => void;
    onDeleteNote: (lead: Lead) => void;
    onClick: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const close = () => setShowMenu(false);
        if(showMenu) document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [showMenu]);

    const tempBadge = {
        COLD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        WARM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        HOT: "bg-red-500/10 text-red-400 border-red-500/20",
    }[lead.temperature] || "bg-zinc-800 text-zinc-400";

    // Логика обрезки текста
    const truncateText = (text: string, length: number) => {
        if (!text) return "";
        return text.length > length ? text.substring(0, length) + "..." : text;
    };

    return (
        <Draggable draggableId={lead._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    onClick={onClick}
                    className={`
            relative group mb-3 rounded-xl p-4 cursor-pointer transition-all duration-300
            ${snapshot.isDragging
                        ? 'bg-zinc-800/90 shadow-[0_0_30px_rgba(168,85,247,0.3)] ring-2 ring-purple-500/50 scale-105 z-50'
                        : 'bg-[#18181b]/60 backdrop-blur-md border border-white/5 hover:border-purple-500/30 hover:bg-[#18181b]/80 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]'}
          `}
                >
                    {/* Индикатор, что есть заметка (маленький уголок) */}
                    {lead.note && (
                        <div className="absolute top-0 right-0 pointer-events-none">
                            <div className="w-0 h-0 border-t-[20px] border-l-[20px] border-t-yellow-500/20 border-l-transparent rounded-tr-xl"></div>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-2 pr-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-sm font-bold text-white border border-white/10 shadow-inner">
                                    {lead.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#18181b] rounded-full"></div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-100 truncate max-w-[130px] leading-tight">{lead.username}</span>
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5 font-medium">
                    <Icons.Telegram /> Telegram
                 </span>
                            </div>
                        </div>

                        {/* Меню */}
                        <div className="absolute top-3 right-2" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                className="p-1.5 rounded-lg text-zinc-600 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Icons.Dots />
                            </button>
                            <AnimatePresence>
                                {showMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 top-8 w-36 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10"
                                    >
                                        {!lead.note && <button onClick={(e) => { e.stopPropagation(); onAddNote(lead); }} className="w-full text-left px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-900 flex items-center gap-2 transition-colors"><span className="text-zinc-500"><Icons.Note /></span> Add Note</button>}
                                        {lead.note && <button onClick={(e) => { e.stopPropagation(); onDeleteNote(lead); }} className="w-full text-left px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-900 flex items-center gap-2 transition-colors"><span className="text-zinc-500"><Icons.Trash /></span> Delete Note</button>}
                                        <div className="h-px bg-white/5"></div>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(lead._id); }} className="w-full text-left px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"><span className="text-red-500/70"><Icons.Trash /></span> Delete Lead</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* --- CONTENT AREA: NOTE OR MESSAGE --- */}
                    <div className="mt-3 mb-3 min-h-[2.5em]">
                        {lead.note ? (
                            // 1. ОТОБРАЖЕНИЕ ЗАМЕТКИ (Яркое, выделяющееся)
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 flex items-start gap-2">
                                <span className="text-yellow-500 mt-0.5 shrink-0"><Icons.Note /></span>
                                <p className="text-xs text-yellow-200/90 font-medium leading-snug line-clamp-2">
                                    {lead.note}
                                </p>
                            </div>
                        ) : (
                            // 2. ОТОБРАЖЕНИЕ СООБЩЕНИЯ (Спокойное, серое)
                            <p className="text-xs text-zinc-500 leading-relaxed pl-1">
                                {lead.last_message
                                    ? truncateText(lead.last_message, 45)
                                    : <span className="italic opacity-50">No messages yet</span>
                                }
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
             <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md border tracking-wide ${tempBadge}`}>
               {lead.temperature}
             </span>
                        <div className="text-[10px] font-medium text-zinc-600">
                            {new Date(lead.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

// --- MODALS (Без изменений логики, только стиль) ---
function CreateStatusModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if(!name.trim()) return; setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/statuses`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ name, order: 99 }) });
            onCreated(); onClose();
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="relative bg-[#09090b] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl ring-1 ring-white/5">
                <h3 className="text-lg font-bold text-white mb-4">New Pipeline Stage</h3>
                <form onSubmit={handleSubmit}>
                    <input autoFocus type="text" placeholder="Stage Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-zinc-600" />
                    <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors">Cancel</button><button type="submit" disabled={loading} className="flex-1 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-colors">{loading ? 'Creating...' : 'Create'}</button></div>
                </form>
            </motion.div>
        </div>
    )
}

function AddNoteModal({ onClose, onSaved }: { onClose: () => void; onSaved: (text: string) => void }) {
    const [text, setText] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="relative bg-[#09090b] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Add Note</h3>
                <textarea autoFocus rows={3} placeholder="Enter important details..." value={text} onChange={e=>setText(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 resize-none placeholder-zinc-600" />
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors">Cancel</button>
                    <button onClick={() => onSaved(text)} className="flex-1 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">Save Note</button>
                </div>
            </motion.div>
        </div>
    )
}

function PlatformDetailsModal({ platform, onClose }: { platform: TelegramInfo, onClose: () => void }) {
    // Состояние для управления второй модалкой
    const [showManageChats, setShowManageChats] = useState(false);

    // Если открыта модалка управления чатами, рендерим её поверх (или вместо)
    if (showManageChats) {
        return <ManageChatsModal onClose={() => setShowManageChats(false)} />;
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="relative w-full max-w-md bg-[#09090b] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[80px] pointer-events-none" />
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <Icons.Telegram />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Telegram</h3>
                            <p className="text-sm text-zinc-500">Integration Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Icons.Close /></button>
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                        <span className="text-sm text-zinc-500 font-medium">Phone Number</span>
                        <span className="text-white font-mono tracking-wide">{platform.number}</span>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                        <span className="text-sm text-zinc-500 font-medium">Connected Since</span>
                        <span className="text-zinc-300 text-sm">{new Date(platform.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                {/* ДОБАВЛЯЕМ КНОПКУ СЮДА, перед Disconnect */}
                <div className="mt-8 flex flex-col gap-3 relative z-10">

                    <button
                        onClick={() => setShowManageChats(true)}
                        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors border border-white/5 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        Ignored Chats
                    </button>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors">Close</button>
                        <button className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-colors">Disconnect</button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

function Toast({ message, onClose }: { message: string, onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <motion.div initial={{y: 50, opacity:0}} animate={{y:0, opacity:1}} exit={{y:50, opacity:0}} className="fixed bottom-8 right-8 bg-[#09090b] border border-green-500/30 text-white pl-4 pr-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[60] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-sm font-medium">{message}</span>
        </motion.div>
    )
}

// --- MAIN PAGE ---
export default function PipelinePage() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500';
    const { user } = useUserStore();

    const [statuses, setStatuses] = useState<Status[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showCreateStatus, setShowCreateStatus] = useState(false);
    const [showPlatformModal, setShowPlatformModal] = useState(false);
    const [noteModalLead, setNoteModalLead] = useState<Lead | null>(null);
    const [toastMessage, setToastMessage] = useState("");
    const socket = useSocket();

    // --- НОВЫЙ СТЕЙТ ---
    const [telegramBot, setTelegramBot] = useState<TelegramBotInfo | null>(null);
    const [showBotModal, setShowBotModal] = useState(false);

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<'newest' | 'oldest' | 'hot' | 'cold'>('newest');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    const telegramPlatform = user?.telegram as unknown as TelegramInfo | undefined;

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const [statusesRes, leadsRes, botRes] = await Promise.all([
                fetch(`${API_URL}/statuses`, { headers: { "Authorization": `Bearer ${token}` } }),
                fetch(`${API_URL}/leads`, { headers: { "Authorization": `Bearer ${token}` } }),
                // Запрашиваем бота
                fetch(`${API_URL}/telegram-bot`, { headers: { "Authorization": `Bearer ${token}` } })
            ]);

            const statusesData = await statusesRes.json();
            const leadsData = await leadsRes.json();
            const botData = await botRes.json(); // Данные бота

            if (statusesRes.ok) setStatuses(statusesData.statuses.sort((a: any, b: any) => a.order - b.order));
            if (leadsRes.ok) setLeads(leadsData.leads || []);
            if (botRes.ok && botData.platform) setTelegramBot(botData.platform); // Сохраняем бота

        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [API_URL]);
    const handleDisconnectBot = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_URL}/telegram-bot`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setTelegramBot(null);
            setShowBotModal(false);
        } catch (e) { console.error(e); }
    };

    const handleLeadUpdate = (updatedLead: Lead) => {
        setLeads((prev) => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
        if (selectedLead && selectedLead._id === updatedLead._id) {
            setSelectedLead(updatedLead);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatusId = destination.droppableId;
        const newLeads = [...leads];
        const leadIndex = newLeads.findIndex(l => l._id === draggableId);
        if (leadIndex !== -1) {
            newLeads[leadIndex] = { ...newLeads[leadIndex], status: newStatusId };
            setLeads(newLeads);
        }

        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/leads/${draggableId}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ status: newStatusId })
            });
        } catch (error) { console.error("Failed to update status", error); }
    };

    const handleDeleteLead = async (id: string) => {
        if(!confirm("Delete lead?")) return;
        setLeads(leads.filter(l => l._id !== id));
        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/leads/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
        } catch (e) { fetchData(); }
    };

    const handleSaveNote = async (text: string) => {
        if (!noteModalLead) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/leads/${noteModalLead._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ note: text })
            });
            const data = await res.json();
            if(data.success) {
                setToastMessage("Note saved successfully");
                handleLeadUpdate(data.lead);
                setNoteModalLead(null);
            }
        } catch (e) { console.error(e); }
    };

    const handleDeleteNote = async (lead: Lead) => {
        if(!confirm("Delete note?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/leads/${lead._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ note: "" })
            });
            const data = await res.json();
            if(data.success) {
                setToastMessage("Note deleted");
                handleLeadUpdate(data.lead);
            }
        } catch (e) { console.error(e); }
    };
    useEffect(() => {
        if (!socket) return;

        // 1. Слушаем НОВОГО лида
        socket.on('lead:new', (newLead: Lead) => {
            // Добавляем в список (если его еще нет)
            setLeads(prev => [newLead, ...prev]);
        });

        // 2. Слушаем ОБНОВЛЕНИЕ лида (статус, последнее сообщение, ИИ)
        socket.on('lead:update', (updatedLead: Lead) => {
            setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));

            // Если этот лид сейчас открыт в модальном окне, обновляем и его
            if (selectedLead && selectedLead._id === updatedLead._id) {
                setSelectedLead(updatedLead);
            }
        });

        return () => {
            socket.off('lead:new');
            socket.off('lead:update');
        };
    }, [socket, selectedLead]); // selectedLead в зависимостях важно!

    const getFilteredLeads = (statusId: string) => {
        let filtered = leads.filter(l => l.status === statusId);

        // 1. Поиск
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(l => l.username.toLowerCase().includes(q));
        }

        // 2. Сортировка
        filtered.sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();

            // Приоритет температуры
            const tempWeight = { HOT: 3, WARM: 2, COLD: 1, SPAM: 0 };

            switch (filter) {
                case 'newest': return dateB - dateA;
                case 'oldest': return dateA - dateB;
                case 'hot': return (tempWeight[b.temperature] - tempWeight[a.temperature]) || (dateB - dateA);
                case 'cold': return (tempWeight[a.temperature] - tempWeight[b.temperature]) || (dateB - dateA);
                default: return 0;
            }
        });

        return filtered;
    };

    // Close dropdown on click outside
    useEffect(() => {
        const close = () => setShowFilterMenu(false);
        if(showFilterMenu) document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [showFilterMenu]);

    if (loading) {
        return <div className="h-full flex items-center justify-center bg-[#050505]"><div className="w-10 h-10 border-4 border-zinc-800 border-t-purple-500 rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden relative bg-[#050505] text-white font-sans selection:bg-purple-500/30">

            {/* ... Ambient Background ... */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 blur-[150px] rounded-full opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full opacity-60" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>

            {/* ... Modals ... */}
            <AnimatePresence>
                {selectedLead && <ChatModal key="chat" lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleLeadUpdate} />}
                {showCreateStatus && <CreateStatusModal key="status" onClose={() => setShowCreateStatus(false)} onCreated={fetchData} />}
                {showPlatformModal && telegramPlatform && <PlatformDetailsModal key="platform" platform={telegramPlatform} onClose={() => setShowPlatformModal(false)} />}
                {noteModalLead && <AddNoteModal key="note" onClose={() => setNoteModalLead(null)} onSaved={handleSaveNote} />}
                {toastMessage && <Toast key="toast" message={toastMessage} onClose={() => setToastMessage("")} />}
                {/* ДОБАВЬ ВОТ ЭТОТ БЛОК: */}
                {showBotModal && telegramBot && (
                    <BotDetailsModal
                        key="bot-modal"
                        bot={telegramBot}
                        onClose={() => setShowBotModal(false)}
                        onDisconnect={handleDisconnectBot}
                    />
                )}
            </AnimatePresence>

            {/* HEADER */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl z-20 shrink-0 relative bg-[#050505]/50">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">CRM Pipeline</h1>
                    <div className="h-6 w-px bg-white/10"></div>

                    {/* SEARCH & FILTER BAR */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-sm text-zinc-300 focus:outline-none focus:bg-white/10 transition-colors w-64 focus:ring-1 focus:ring-white/10"
                            />
                        </div>

                        {/* FILTER DROPDOWN */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`h-8 w-8 flex items-center justify-center rounded-full border transition-all ${showFilterMenu ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
                            >
                                <Icons.Filter />
                            </button>

                            <AnimatePresence>
                                {showFilterMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-10 left-0 w-48 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                                    >
                                        <div className="px-3 py-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider border-b border-white/5 mb-1">Sort By</div>
                                        {[
                                            { id: 'newest', label: 'Newest First' },
                                            { id: 'oldest', label: 'Oldest First' },
                                            { id: 'hot', label: 'Hot Leads 🔥' },
                                            { id: 'cold', label: 'Cold Leads ❄️' },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => { setFilter(item.id as any); setShowFilterMenu(false); }}
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-white/5 transition-colors ${filter === item.id ? 'text-purple-400 font-medium' : 'text-zinc-300'}`}
                                            >
                                                {item.label}
                                                {filter === item.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* ... (Кнопки Telegram и Connect те же самые) ... */}
                    {telegramPlatform ? (
                        <motion.button onClick={() => setShowPlatformModal(true)} className="h-10 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold flex items-center gap-2.5 transition-all hover:bg-blue-500/20 hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
                            <Icons.Telegram /><span className="hidden sm:inline">Telegram Active</span>
                        </motion.button>
                    ) : null}
                    {/* КНОПКА БОТА (Новая) */}
                    {telegramBot ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setShowBotModal(true)}
                            className="h-10 px-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold flex items-center gap-2.5 transition-all hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <Icons.Bot />
                            <span className="hidden sm:inline">Bot Active</span>
                        </motion.button>
                    ) : null}
                    <Link href="/dashboard/connect"><motion.button className="h-10 px-5 rounded-full bg-white text-black text-sm font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all"><Icons.Plus /> Connect Platform</motion.button></Link>
                </div>
            </header>

            {/* BOARD */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 z-10">
                    <div className="flex h-full gap-8">
                        {statuses.map((status) => {
                            // ИСПОЛЬЗУЕМ НОВУЮ ФУНКЦИЮ ФИЛЬТРАЦИИ
                            const columnLeads = getFilteredLeads(status._id);

                            return (
                                <div key={status._id} className="w-[340px] flex flex-col shrink-0">
                                    <div className="flex items-center justify-between mb-5 px-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">{status.name}</h2>
                                            <span className="bg-white/5 border border-white/5 text-zinc-400 text-xs font-mono font-medium px-2 py-0.5 rounded-md min-w-[24px] text-center">{columnLeads.length}</span>
                                        </div>
                                        <button className="text-zinc-600 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"><Icons.Dots /></button>
                                    </div>

                                    <Droppable droppableId={status._id}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 rounded-2xl flex flex-col gap-0 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.02] ring-1 ring-white/5' : ''}`}
                                            >
                                                {columnLeads.length > 0 ? columnLeads.map((lead, index) => (
                                                    <LeadCard
                                                        key={lead._id}
                                                        lead={lead}
                                                        index={index}
                                                        onClick={() => setSelectedLead(lead)}
                                                        onDelete={handleDeleteLead}
                                                        onAddNote={(l) => setNoteModalLead(l)}
                                                        onDeleteNote={handleDeleteNote}
                                                    />
                                                )) : (
                                                    status.order === 0 ? (
                                                        <div className="h-40 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-white/10 rounded-2xl m-1">
                                                            {!telegramPlatform ? <><div className="mb-2 p-3 bg-zinc-900 rounded-full border border-white/5"><Icons.Telegram /></div><span className="text-xs">Waiting for Telegram...</span></> : <span className="text-xs font-medium">No new leads</span>}
                                                        </div>
                                                    ) : null
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                        {/* ... (Кнопка Add Stage) ... */}
                        <div className="w-[340px] shrink-0 pt-12 px-2 opacity-50 hover:opacity-100 transition-opacity">
                            <button onClick={() => setShowCreateStatus(true)} className="w-full h-12 border border-dashed border-white/20 rounded-xl text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all text-sm font-medium flex items-center justify-center gap-2"><Icons.Plus /> Add New Stage</button>
                        </div>
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}