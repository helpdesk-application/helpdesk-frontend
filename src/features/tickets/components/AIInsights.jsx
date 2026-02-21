import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Brain, Target, AlertTriangle, CheckCircle2, TrendingUp, Eye, Zap } from 'lucide-react';
import { fetchAIInsights } from '../../../api/api';

const ShimmerLine = ({ width = '100%' }) => (
    <div className={`h-3 bg-slate-700/50 rounded-full animate-pulse`} style={{ width }} />
);

const LoadingSkeleton = () => (
    <div className="space-y-8 p-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl animate-pulse" />
            <div className="space-y-2 flex-1">
                <ShimmerLine width="40%" />
                <ShimmerLine width="25%" />
            </div>
        </div>
        {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
                <ShimmerLine width="30%" />
                <ShimmerLine width="90%" />
                <ShimmerLine width="70%" />
            </div>
        ))}
    </div>
);

const SentimentBadge = ({ sentiment }) => {
    const config = {
        Positive: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '😊' },
        Neutral: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: '😐' },
        Negative: { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', icon: '😟' },
    };
    const c = config[sentiment?.label] || config.Neutral;
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${c.bg}`}>
            <span className="text-lg">{c.icon}</span>
            <span className={`text-sm font-bold ${c.color}`}>{sentiment?.label || 'Unknown'}</span>
            {sentiment?.confidence && (
                <span className="text-[10px] font-mono text-slate-500 ml-1">{sentiment.confidence}%</span>
            )}
        </div>
    );
};

const PriorityBadge = ({ priority }) => {
    const colors = {
        CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
        HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        LOW: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    };
    return (
        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${colors[priority?.level] || colors.MEDIUM}`}>
            {priority?.level || 'MEDIUM'}
        </span>
    );
};

const AIInsights = ({ ticket }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadInsights = async () => {
        if (!ticket?._id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetchAIInsights(ticket._id);
            setInsights(res.data);
        } catch (err) {
            console.error('AI Insights error:', err);
            setError(err.response?.data?.error || err.message || 'Failed to load AI insights');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, [ticket?._id]);

    if (loading) {
        return (
            <div className="bg-slate-900 rounded-3xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
                <LoadingSkeleton />
                <div className="px-8 pb-6">
                    <p className="text-xs text-slate-500 text-center animate-pulse flex items-center justify-center gap-2">
                        <Sparkles size={14} className="text-blue-400" /> Analyzing ticket with AI...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white text-center">
                <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300 mb-1">Analysis Failed</p>
                <p className="text-xs text-slate-500 mb-4">{error}</p>
                <button
                    onClick={loadInsights}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    if (!insights) return null;

    const isAI = insights.source === 'gemini';

    return (
        <div className="bg-slate-900 rounded-3xl shadow-xl text-white relative overflow-hidden group">
            {/* Background decorations */}
            <Sparkles className="absolute -right-8 -bottom-8 text-blue-500/5 h-40 w-40 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-0 left-0 w-56 h-56 bg-purple-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 p-8 space-y-7">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Brain size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xs font-extrabold text-blue-400 uppercase tracking-[0.2em]">AI Insights</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                {isAI ? 'Powered by Google Gemini' : 'Keyword-based analysis'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={loadInsights}
                        className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-500 hover:text-blue-400"
                        title="Regenerate insights"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Sentiment + Priority Row */}
                <div className="flex flex-wrap gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sentiment</p>
                        <SentimentBadge sentiment={insights.sentiment} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Suggested Priority</p>
                        <div className="flex items-center gap-2 mt-1">
                            <PriorityBadge priority={insights.priority} />
                        </div>
                    </div>
                    {insights.category && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</p>
                            <span className="px-3 py-1 rounded-lg text-xs font-bold border text-purple-400 bg-purple-500/10 border-purple-500/20">
                                {insights.category}
                            </span>
                        </div>
                    )}
                </div>

                {/* Priority Reasoning */}
                {insights.priority?.reasoning && (
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Target size={12} /> Priority Reasoning
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">{insights.priority.reasoning}</p>
                    </div>
                )}

                {/* Root Cause */}
                {insights.rootCause && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Zap size={12} className="text-amber-400" /> Root Cause Analysis
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed">{insights.rootCause}</p>
                    </div>
                )}

                {/* Resolution Steps */}
                {insights.resolutionSteps?.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-400" /> Suggested Resolution
                        </p>
                        <div className="space-y-2.5">
                            {insights.resolutionSteps.map((step, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="h-5 w-5 rounded-md bg-slate-800 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border border-slate-700">
                                        {i + 1}
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Key Observations */}
                {insights.observations?.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Eye size={12} className="text-purple-400" /> Key Observations
                        </p>
                        <div className="space-y-2">
                            {insights.observations.map((obs, i) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                    <TrendingUp size={12} className="text-slate-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-slate-400 leading-relaxed">{obs}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Source indicator */}
                <div className="pt-4 border-t border-slate-800">
                    <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1.5">
                        <Sparkles size={10} />
                        {isAI ? 'Generated by Google Gemini AI' : 'Keyword-based analysis • Add GEMINI_API_KEY for full AI'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
