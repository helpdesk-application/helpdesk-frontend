import React from 'react';
import { Sparkles } from 'lucide-react';

const AIInsights = ({ sentiment, Blueprints, category }) => {
    return (
        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
            <Sparkles className="absolute -right-8 -bottom-8 text-blue-500/10 h-40 w-40 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-[0.2em]">
                    <Sparkles size={16} /> AI Insights
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sentiment Analysis</p>
                    <span className={`text-lg font-black uppercase ${sentiment === 'Negative' ? 'text-rose-400' : sentiment === 'Positive' ? 'text-emerald-400' : 'text-blue-400'}`}>{sentiment}</span>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Suggested Path (Blueprint)</p>
                    <div className="space-y-3">
                        {(Blueprints[category] || Blueprints.General).map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="h-4 w-4 rounded bg-slate-800 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-slate-700">{i + 1}</div>
                                <p className="text-xs text-slate-300 leading-tight">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
