import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Search, Plus, X, Eye, Tag, Lock, Globe, Lightbulb } from 'lucide-react';
import { fetchArticles, searchArticles, fetchKBCategories, createArticle } from '../../api/api';

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [form, setForm] = useState({ title: '', content: '', category: '', visibility: 'PUBLIC' });

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const canCreate = ['Admin', 'Super Admin', 'Agent', 'Manager'].includes(user.role);

  const loadData = async (keyword = '', isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const articlesRes = keyword
        ? await searchArticles(keyword)
        : await fetchArticles(activeCategory === 'All' ? '' : activeCategory);
      setArticles(articlesRes.data || []);

      if (isInitial) {
        try {
          const catRes = await fetchKBCategories();
          setCategories(catRes.data || []);
        } catch { }
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      loadData(searchParam);
    } else {
      setSearchTerm('');
      loadData('', true);
    }
  }, [location.search]);

  // Combined initial load and category change
  useEffect(() => {
    if (!loading && !location.search) loadData();
  }, [activeCategory]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createArticle(form);
      setShowCreateModal(false);
      setForm({ title: '', content: '', category: '', visibility: 'PUBLIC' });
      loadData('', true);
    } catch (err) {
      console.error('Failed to create article:', err);
    }
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      'Getting Started': '🚀',
      'Account': '👤',
      'Billing': '💳',
      'Technical': '⚙️',
      'General': '📋',
    };
    return icons[cat] || '📄';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-purple-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full blur-3xl translate-y-1/3" />

        <div className="relative z-10 text-center max-w-xl mx-auto">
          <div className="inline-block p-3 bg-white/10 rounded-2xl mb-4">
            <BookOpen size={28} />
          </div>
          <h1 className="text-3xl font-extrabold mb-3 tracking-tight">Knowledge Base</h1>
          <p className="text-white/70 text-sm mb-6">Find answers to common questions and learn how to get the most out of Helpdesk Pro</p>


        </div>
      </div>

      {/* Category Tabs + Create */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeCategory === 'All' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            All
          </button>
          {categories.map(cat => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const catKey = typeof cat === 'string' ? cat : cat._id;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategory(catName)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeCategory === catName ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {getCategoryIcon(catName)} {catName}
              </button>
            );
          })}
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-95"
          >
            <Plus size={18} /> New Article
          </button>
        )}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map(article => (
          <div
            key={article._id}
            onClick={() => setSelectedArticle(article)}
            className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-3">
              {article.category && (
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                  {getCategoryIcon(article.category)} {article.category}
                </span>
              )}
              {article.visibility === 'INTERNAL' && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                  <Lock size={10} /> Internal
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">{article.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
              {article.content?.substring(0, 150)}...
            </p>
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(article.created_at).toLocaleDateString()}
              </span>
              <span className="text-[11px] text-brand-600 font-bold group-hover:underline flex items-center gap-1">
                Read more <Eye size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="py-16 text-center">
          <div className="inline-block p-4 rounded-2xl bg-slate-50 text-slate-300 mb-4">
            <Lightbulb size={40} />
          </div>
          <p className="text-slate-500 font-semibold">No articles found</p>
          <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
        </div>
      )}

      {/* Article Viewer Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedArticle(null)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-white/10 rounded-xl flex-shrink-0"><BookOpen size={20} className="text-white" /></div>
                <h2 className="text-lg font-bold text-white truncate">{selectedArticle.title}</h2>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white flex-shrink-0"><X size={20} /></button>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="flex gap-2 mb-4">
                {selectedArticle.category && <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">{selectedArticle.category}</span>}
                {selectedArticle.visibility === 'INTERNAL' && <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1"><Lock size={10} /> Internal</span>}
              </div>
              <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
                Published {new Date(selectedArticle.created_at).toLocaleDateString()}
                {selectedArticle.author && ` by ${selectedArticle.author.name || selectedArticle.author.email}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl"><Plus size={20} className="text-white" /></div>
                <h2 className="text-lg font-bold text-white">New Article</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" placeholder="Article title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" placeholder="e.g. Technical" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Visibility</label>
                  <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition cursor-pointer font-medium">
                    <option value="PUBLIC">Public</option>
                    <option value="INTERNAL">Internal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Content</label>
                <textarea required rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition resize-none" placeholder="Write your article content..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;