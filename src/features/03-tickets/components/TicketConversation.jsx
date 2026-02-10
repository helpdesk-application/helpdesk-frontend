import React from 'react';
import { Mail, MessageCircle, Linkedin, Send } from 'lucide-react';

const TicketConversation = ({ replies = [], isAdminOrAgent, ResponseTemplates, category, comment, setComment, handleSendMessage, sending, attachments }) => {
    // Defensive check
    const safeReplies = Array.isArray(replies) ? replies : [];

    return (
        <div className="p-8 space-y-8">
            {/* Associated Files section */}
            {attachments && attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest w-full mb-1">Attached Files</span>
                    {attachments.map(file => (
                        <a
                            key={file._id}
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/attachments/download/${file.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            <Mail size={12} /> {file.original_name}
                        </a>
                    ))}
                </div>
            )}

            <div className="space-y-6">
                {safeReplies.map((reply, idx) => (
                    <div key={reply._id || idx} className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {reply.user_id?.name?.charAt(0) || reply.user_id?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-slate-800">{reply.user_id?.name || reply.user_id?.email}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{new Date(reply.created_at).toLocaleString()}</span>
                                <span className="ml-auto flex gap-1 opacity-30">
                                    {idx % 3 === 0 ? <Mail size={12} /> : idx % 3 === 1 ? <MessageCircle size={12} /> : <Linkedin size={12} />}
                                </span>
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${reply.is_internal ? 'bg-yellow-50 text-slate-700 border border-yellow-100' : 'bg-slate-50 text-slate-600'}`}>
                                {reply.message}
                            </div>
                        </div>
                    </div>
                ))}
                {safeReplies.length === 0 && <p className="text-center py-10 text-slate-400 italic text-sm">No messages yet.</p>}
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-4">
                {isAdminOrAgent && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-full mb-1">Templates</span>
                        {(ResponseTemplates[category] || ResponseTemplates.General).map(tpl => (
                            <button key={tpl.title} onClick={() => setComment(tpl.text)} className="text-[11px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">
                                {tpl.title}
                            </button>
                        ))}
                    </div>
                )}
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all min-h-[120px]"
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleSendMessage}
                        disabled={sending || !comment.trim()}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                        <Send size={18} /> {sending ? 'Sending...' : 'Post Reply'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketConversation;
