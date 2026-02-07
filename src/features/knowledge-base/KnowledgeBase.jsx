import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';
import { fetchArticles, searchArticles, createArticle } from '../../api/api';

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load articles from API
  const loadArticles = async (keyword = '', isInitial = false) => {
    if (isInitial) setInitialLoading(true);
    else setLoading(true);

    setError(null);
    try {
      const response = keyword
        ? await searchArticles(keyword)
        : await fetchArticles();
      // Map API response to component format
      const mapped = (response.data || []).map(a => ({
        id: a.id || a._id,
        category: a.category || a.tags?.[0] || 'General',
        title: a.title,
        excerpt: a.content?.substring(0, 150) + (a.content?.length > 150 ? '...' : '') || a.excerpt || '',
        fullContent: a.content || '',
        tags: a.tags || []
      }));
      setArticles(mapped);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadArticles('', true);
  }, []);

  // Debounced search - skip initial run to avoid double fetch
  useEffect(() => {
    if (searchTerm === '') {
      // If we've already done initial load, just load articles again if search cleared
      if (!initialLoading) {
        loadArticles();
      }
      return;
    }

    const timer = setTimeout(() => {
      loadArticles(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, initialLoading]);


  const filteredArticles = articles;

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
  const canCreate = userRole === 'Admin' || userRole === 'Agent';

  // Article form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', tags: '' });
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
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setShowForm(false);
      setFormData({ title: '', content: '', tags: '' });
      loadArticles();
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-4xl font-extrabold">Self-Service Help Center</h2>
            {canCreate && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                + New Article
              </button>
            )}
          </div>
          <p className="text-blue-200 text-lg mb-8">Search our documentation for instant answers to common issues.</p>
          <div className="relative text-slate-800">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input
              type="text"
              placeholder="What do you need help with?"
              className="w-full pl-14 pr-16 py-5 rounded-2xl shadow-2xl focus:ring-4 focus:ring-blue-500 outline-none transition text-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
        <Lightbulb className="absolute right-[-20px] bottom-[-20px] text-blue-500/20 w-64 h-64 rotate-12" />
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="font-semibold">No articles found</p>
          {canCreate && <p className="text-sm">Click "New Article" to add your first article.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map(article => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                    {article.category}
                  </span>
                  <BookOpen size={20} className="text-slate-300 group-hover:text-blue-500 transition" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition">{article.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{article.excerpt}</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag, idx) => (
                  <span key={idx} className="text-[9px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                Read Guide <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Article Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Create New Article</h2>
              <button onClick={() => setShowForm(false)} className="hover:bg-slate-800 p-1 rounded-lg transition">✕</button>
            </div>
            <form onSubmit={handleCreateArticle} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., How to reset your password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  required
                  rows="4"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write the article content..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Account, Security, Password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400">
                  {submitting ? 'Creating...' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 p-6 flex justify-between items-start border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mb-3 inline-block">
                  {selectedArticle.category}
                </span>
                <h2 className="text-2xl font-bold text-slate-800">{selectedArticle.title}</h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-lg mb-8">
                  {selectedArticle.fullContent || selectedArticle.excerpt}
                </div>
                {selectedArticle.tags?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Related Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;