import React, { useState } from 'react';
import { X, Upload, Plus, AlertCircle, FileText } from 'lucide-react';
import { createTicket, uploadAttachment } from '../../api/api';

const TicketForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    priority: 'Medium',
    description: '',
    category: 'General'
  });
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      setError('Subject is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await createTicket({
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority.toUpperCase(),
        category: formData.category,
      });

      const newTicketId = res.data?._id || res.data?.ticket?._id;
      if (newTicketId && files.length > 0) {
        for (const file of files) {
          const fd = new FormData();
          fd.append('file', file);
          try { await uploadAttachment(newTicketId, fd); } catch (e) { console.error('File upload failed:', e); }
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Plus size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">New Ticket</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-8 mt-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 animate-slide-up">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-slate-800 placeholder:text-slate-400"
              placeholder="Brief summary of your issue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-slate-800 cursor-pointer font-medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-slate-800 cursor-pointer font-medium"
              >
                <option>General</option>
                <option>Technical</option>
                <option>Billing</option>
                <option>Account</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-slate-800 placeholder:text-slate-400 resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragActive
              ? 'border-brand-400 bg-brand-50'
              : 'border-slate-200 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/30'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Upload size={24} className={`mx-auto mb-2 ${dragActive ? 'text-brand-500' : 'text-slate-400'}`} />
            <p className="text-sm font-semibold text-slate-600">
              {dragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Files will be attached to your ticket</p>
            <input
              id="fileInput"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                  <FileText size={16} className="text-brand-500" />
                  <span className="flex-1 truncate text-slate-700 font-medium">{file.name}</span>
                  <span className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;