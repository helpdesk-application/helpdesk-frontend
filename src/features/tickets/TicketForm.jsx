import React, { useState } from 'react';
import { X, Send, AlertTriangle, Upload, FileText, CheckCircle2 } from 'lucide-react';

const TicketForm = ({ onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Software',
    priority: 'Medium',
    description: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      alert("File is too large. Max limit is 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Network Latency for the API Team
    setTimeout(() => {
      console.log("Handoff to API Team:", { ...formData, attachment: selectedFile });
      alert("Ticket Created Successfully!");
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" size={24} />
            Create New Support Ticket
          </h2>
          <button onClick={onClose} className="hover:bg-slate-800 p-1 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
            <input 
              required
              type="text" 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50"
              placeholder="e.g., Cannot access VPN"
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Software</option>
                <option>Hardware</option>
                <option>Network</option>
                <option>Access Request</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
              <select 
                className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer"
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea 
              required
              rows="3" 
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50"
              placeholder="Please provide steps to reproduce the issue..."
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          {/* File Upload Section */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Attachments (Optional)</label>
            <div className={`mt-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-colors ${selectedFile ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400'}`}>
              {!selectedFile ? (
                <label className="cursor-pointer flex flex-col items-center group">
                  <Upload className="text-slate-400 group-hover:text-blue-500 transition-colors mb-2" size={24} />
                  <span className="text-xs text-slate-600 font-medium">Click to upload screenshot</span>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="flex items-center justify-between w-full px-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;