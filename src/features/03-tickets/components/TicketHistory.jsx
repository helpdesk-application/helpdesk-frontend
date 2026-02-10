import React from 'react';

const TicketHistory = ({ history, createdAt }) => {
    return (
        <div className="p-8 space-y-8">
            <div className="relative border-l-2 border-slate-100 ml-4 pl-10 space-y-10 py-4">
                {history.map((log, idx) => (
                    <div key={log._id || idx} className="relative">
                        <div className="absolute -left-[51px] top-0 w-5 h-5 bg-white border-4 border-blue-600 rounded-full shadow-sm" />
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-800">{log.user_name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                            Changed <span className="font-bold text-slate-900 uppercase tracking-tight">{log.field}</span> from
                            <span className="mx-2 line-through opacity-50 px-1 italic">"{typeof log.old_value === 'object' ? JSON.stringify(log.old_value) : (log.old_value || 'None')}"</span> to
                            <span className="mx-2 font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">"{typeof log.new_value === 'object' ? JSON.stringify(log.new_value) : log.new_value}"</span>
                        </p>
                    </div>
                ))}
                <div className="relative">
                    <div className="absolute -left-[51px] top-0 w-5 h-5 bg-white border-4 border-slate-200 rounded-full shadow-sm" />
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-800">System</span>
                        <span className="text-[10px] text-slate-400 font-medium">{createdAt}</span>
                    </div>
                    <p className="text-sm text-slate-600">Ticket <span className="font-bold">Created</span></p>
                </div>
            </div>
        </div>
    );
};

export default TicketHistory;
