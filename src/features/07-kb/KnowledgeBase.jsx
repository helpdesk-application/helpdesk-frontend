import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, HelpCircle, Lightbulb, Filter, Layers } from 'lucide-react';
import { fetchArticles, searchArticles, createArticle, fetchKBCategories, createKBCategory } from '../../api/api';

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load articles & categories
  const loadData = async (keyword = '', isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setLoading(true);

    setError(null);
    try {
      const [articlesRes, catsRes] = await Promise.all([
        keyword ? searchArticles(keyword) : fetchArticles(),
        fetchKBCategories().catch(() => ({ data: [] }))
      ]);

      const userRole = getUserRole();
      const mapped = (articlesRes.data || [])
        .filter(a => {
          // Role-based filtering: Customers only see PUBLIC
          if (userRole === 'Customer' && a.visibility === 'INTERNAL') return false;
          return true;
        })
        .map(a => ({
          id: a._id,
          category: a.category_id?.name || a.category || 'General',
          title: a.title,
          excerpt: a.content?.substring(0, 150) + (a.content?.length > 150 ? '...' : '') || a.excerpt || '',
          fullContent: a.content || '',
          tags: a.tags || [],
          visibility: a.visibility || 'PUBLIC'
        }));
      setArticles(mapped);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error('Failed to load KB data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load Help Center');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData('', true);
  }, []);

  useEffect(() => {
    if (searchTerm === '' && !initialLoading) {
      loadData();
      return;
    }
    if (searchTerm !== '') {
      const timer = setTimeout(() => loadData(searchTerm), 400);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, initialLoading]);

  const filteredArticles = articles.filter(a => selectedCategory === 'All' || a.category === selectedCategory);

  // Get user role from token
  const getUserRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  const userRole = getUserRole();
  const canCreate = ['Admin', 'Super Admin', 'Agent', 'Manager'].includes(userRole);

  // Article form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '', category_id: '', visibility: 'PUBLIC' });
  const [submitting, setSubmitting] = useState(false);

  // Article detail state
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createArticle({
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id || undefined,
        visibility: formData.visibility,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setShowForm(false);
      setFormData({ title: '', content: '', tags: '', category_id: '', visibility: 'PUBLIC' });
      loadData();
    } catch (err) {
      alert('Failed to create article: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600 font-medium">Loading Help Center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-5xl font-black tracking-tight mb-2">Help Center</h2>
              <p className="text-blue-200 text-xl font-medium opacity-80">Find instant answers to your questions.</p>
            </div>
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-white text-blue-900 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition transform hover:scale-105 active:scale-95 shadow-xl"
              >
                + Create Article
              </button>
            )}
          </div>
          <div className="relative text-slate-800 mt-10">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input
              type="text"
              placeholder="Search guides, tutorials, and FAQs..."
              className="w-full pl-16 pr-20 py-6 rounded-[2rem] shadow-2xl focus:ring-8 focus:ring-blue-500/20 outline-none transition text-xl font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
        <Lightbulb className="absolute right-[-40px] bottom-[-40px] text-blue-400/10 w-96 h-96 rotate-12" />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all ${selectedCategory === 'All' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:text-blue-600 border border-slate-100'}`}
        >
          All Topics
        </button>
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all ${selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:text-blue-600 border border-slate-100'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <Layers size={64} className="mx-auto mb-6 text-slate-200" />
          <h3 className="text-2xl font-bold text-slate-800 mb-2">No guides found</h3>
          <p className="text-slate-400 font-medium">
            {selectedCategory === 'All' ? 'Our database is currently empty.' : `No articles found in ${selectedCategory}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-blue-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col h-full active:scale-[0.98] relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">
                    {article.category}
                  </span>
                  {article.visibility === 'INTERNAL' && (
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                      INTERNAL ONLY
                    </span>
                  )}
                </div>
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <BookOpen size={20} className="text-slate-300 group-hover:text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-4 group-hover:text-blue-600 transition leading-tight">{article.title}</h3>
              <p className="text-slate-500 text-base leading-relaxed mb-8 line-clamp-3">{article.excerpt}</p>

              <div className="mt-auto space-y-6">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest">
                  Read Full Guide <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Article Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 flex justify-between items-center text-white">
              <h2 className="text-2xl font-black tracking-tight">Post New Guide</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-slate-800 p-2 rounded-xl transition text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateArticle} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Article Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition font-bold text-slate-800"
                    placeholder="e.g., Resolving Connection Timeouts"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="PUBLIC">Public Article</option>
                    <option value="INTERNAL">Internal Only (Staff)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition font-bold text-slate-800"
                    placeholder="api, debug, network"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Content</label>
                <textarea
                  required
                  rows="6"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition font-bold text-slate-800 min-h-[150px]"
                  placeholder="Share the step-by-step solution..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:opacity-50">
                  {submitting ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 p-10 flex justify-between items-start border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-100 px-4 py-2 rounded-xl mb-6 inline-block">
                  {selectedArticle.category}
                </span>
                <h2 className="text-4xl font-black text-slate-900 leading-tight">{selectedArticle.title}</h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-3 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>
            <div className="p-10 overflow-y-auto">
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-600 leading-[2] text-xl font-medium mb-10">
                  {selectedArticle.fullContent || selectedArticle.excerpt}
                </div>
                {selectedArticle.tags?.length > 0 && (
                  <div className="mt-10 pt-10 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Keywords</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedArticle.tags.map((tag, idx) => (
                        <span key={idx} className="px-5 py-2 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-2xl shadow-blue-200 uppercase tracking-widest text-sm"
              >
                Finished Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;