import React from 'react';
import { Mail, MessageCircle, Send, Paperclip, FileText, Download, User2, ShieldCheck, CornerDownRight } from 'lucide-react';

const isImage = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

const getAvatarColor = (name) => {
    const colors = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-indigo-500',
        'from-rose-500 to-pink-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-violet-500 to-purple-500',
    ];
    const hash = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

const TicketConversation = ({ replies = [], isAdminOrAgent, ResponseTemplates, category, comment, setComment, handleSendMessage, sending, attachments }) => {
    const safeReplies = Array.isArray(replies) ? replies : [];
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};

    return (
        <div className="flex flex-col h-full min-h-[600px]">
            {/* Messages Area - Scrollable */}
            <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
                {/* Embedded Attachments Display (Top of conversation) */}
                {attachments && attachments.length > 0 && (
                    <div className="mb-8 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                                <Paperclip size={14} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attached Files ({attachments.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {attachments.map(file => (
                                isImage(file.filename) ? (
                                    <a
                                        key={file._id}
                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/attachments/download/${file.filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative h-24 w-24 rounded-2xl overflow-hidden border border-slate-100 hover:border-brand-400 transition-all shadow-sm hover:shadow-lg hover:shadow-brand-500/10"
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/attachments/download/${file.filename}`}
                                            alt={file.original_name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                            <Download size={14} className="text-white" />
                                        </div>
                                    </a>
                                ) : (
                                    <a
                                        key={file._id}
                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/attachments/download/${file.filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600 transition-all h-24 w-24 shadow-sm hover:shadow-md group"
                                    >
                                        <FileText size={24} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                                        <span className="truncate w-full text-center px-1">{file.original_name}</span>
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages List */}
                {safeReplies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-60">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={32} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No conversation yet.</p>
                        <p className="text-slate-400 text-sm">Start the discussion below.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {safeReplies.map((reply, idx) => {
                            const isOwnMessage = reply.user_id?._id === currentUser._id || reply.user_id?.email === currentUser.email;
                            const isAgent = ['Admin', 'Agent', 'Super Admin', 'Manager'].includes(reply.user_id?.role);
                            const userName = reply.user_id?.name || reply.user_id?.email || 'Unknown';
                            const avatarColor = getAvatarColor(userName);

                            return (
                                <div key={reply._id || idx} className={`flex gap-4 group ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                                        <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white`}>
                                            {isAgent ? <ShieldCheck size={18} /> : <User2 size={18} />}
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-xs font-bold text-slate-700">{userName}</span>
                                            {isAgent && !isOwnMessage && (
                                                <span className="bg-brand-50 text-brand-600 text-[9px] px-1.5 py-0.5 rounded-md font-bold border border-brand-100 uppercase tracking-wider">
                                                    Support
                                                </span>
                                            )}
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(reply.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                                        </div>

                                        <div className={`relative p-4 md:p-5 rounded-3xl text-sm leading-relaxed shadow-sm transition-all duration-200
                                            ${reply.is_internal
                                                ? 'bg-amber-50 text-slate-800 border border-amber-200 rounded-tl-sm'
                                                : isOwnMessage
                                                    ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-brand-500/20 rounded-tr-sm'
                                                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-card'
                                            } hover:shadow-md`}>
                                            {reply.is_internal && (
                                                <div className="flex items-center gap-1.5 mb-2 text-amber-700/80 text-[10px] font-bold uppercase tracking-wider border-b border-amber-200/50 pb-2">
                                                    <ShieldCheck size={12} /> Internal Note
                                                </div>
                                            )}
                                            <div className="whitespace-pre-wrap">{reply.message}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Reply Area (Sticky Bottom) */}
            <div className="p-4 md:p-6 bg-white border-t border-slate-100 rounded-b-3xl">
                {isAdminOrAgent && (
                    <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 mr-2">
                            <CornerDownRight size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Replies</span>
                        </div>
                        {(ResponseTemplates[category] || ResponseTemplates.General).map(tpl => (
                            <button
                                key={tpl.title}
                                onClick={() => setComment(tpl.text)}
                                className="text-[11px] font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-300 hover:text-brand-600 hover:shadow-sm transition-all whitespace-nowrap"
                            >
                                {tpl.title}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative group">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={isAdminOrAgent ? "Write a reply or internal note..." : "Type your message here..."}
                        className="w-full p-4 pr-14 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all min-h-[100px] text-sm resize-none placeholder-slate-400 font-medium"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                            onClick={handleSendMessage}
                            disabled={sending || !comment.trim()}
                            className="bg-brand-600 text-white p-2.5 rounded-xl hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all disabled:opacity-50 disabled:hover:shadow-none active:scale-95 flex items-center justify-center group/send"
                            title="Send Reply"
                        >
                            <Send size={18} className="group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
                    Press <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">Ctrl + Enter</span> to send
                </p>
            </div>
        </div>
    );
};

export default TicketConversation;
