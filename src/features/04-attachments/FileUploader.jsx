import React, { useState } from 'react';
import api from '../../api/api';

const FileUploader = ({ ticketId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("ticket_id", ticketId);

        setUploading(true);
        setError('');

        try {
            await api.post("/attachments", formData);
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Attach File</h4>
            <div className="flex items-center space-x-2">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`px-3 py-1 rounded text-white text-sm ${!file || uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default FileUploader;
