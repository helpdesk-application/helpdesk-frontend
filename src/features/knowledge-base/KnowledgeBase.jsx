import React, { useState } from 'react';
import { Search, BookOpen, ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const articles = [
    { id: 1, category: 'Account', title: 'How to reset your password', excerpt: 'Follow these steps if you have forgotten your login credentials...' },
    { id: 2, category: 'Network', title: 'Connecting to Corporate VPN', excerpt: 'A guide on setting up the Cisco AnyConnect client for remote work...' },
    { id: 3, category: 'Hardware', title: 'Setting up your dual monitors', excerpt: 'Troubleshooting common display issues and docking station setup...' },
    { id: 4, category: 'Software', title: 'Installing Microsoft Teams', excerpt: 'How to download and sign in to Teams for company communication...' },
  ];

  const filteredArticles = articles.filter(art =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-extrabold mb-3">Self-Service Help Center</h2>
          <p className="text-blue-200 text-lg mb-8">Search our documentation for instant answers to common issues.</p>
          <div className="relative text-slate-800">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input 
              type="text"
              placeholder="What do you need help with?"
              className="w-full pl-14 pr-6 py-5 rounded-2xl shadow-2xl focus:ring-4 focus:ring-blue-500 outline-none transition text-lg"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Lightbulb className="absolute right-[-20px] bottom-[-20px] text-blue-500/20 w-64 h-64 rotate-12" />
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map(article => (
          <div key={article.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between">
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
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              Read Guide <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnowledgeBase;