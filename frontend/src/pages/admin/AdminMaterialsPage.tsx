import React, { useState, useEffect } from 'react';
import { UploadCloud, Trash2, BookOpen, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const AdminMaterialsPage: React.FC = () => {
  const [chapters, setChapters] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Upload state
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/chapters');
      const allChapters: any[] = res.data.chapters || [];
      setChapters(allChapters);
      if (allChapters.length > 0 && !selectedChapterId) {
        setSelectedChapterId(allChapters[0].id);
      }

      // Collect materials
      const allMats = allChapters.flatMap((ch) =>
        (ch.materials || []).map((m: any) => ({ ...m, chapter: ch }))
      );
      setMaterials(allMats);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a PDF document');
      return;
    }
    if (!selectedChapterId || !title.trim()) {
      setUploadError('Chapter and title are required');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chapterId', selectedChapterId);
    formData.append('title', title.trim());
    formData.append('description', description.trim());

    try {
      await api.post('/admin/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage('Study material uploaded and assigned to chapter successfully!');
      setTitle('');
      setDescription('');
      setFile(null);
      fetchData();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Failed to upload PDF material');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this PDF material?')) return;
    try {
      await api.delete(`/admin/materials/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete material');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-navy-950">Study Materials & PDF Uploader</h1>
        <p className="text-slate-600 text-sm mt-1">
          Upload PDF revision documents, attach them to chapters, and manage access availability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Upload Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-600 font-bold text-sm">
            <UploadCloud className="w-5 h-5" />
            <span>Upload New PDF Document</span>
          </div>

          {uploadMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleFileUpload} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Chapter</label>
              <select
                value={selectedChapterId}
                required
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.subject?.class?.name} - {ch.subject?.name}: Ch {ch.chapterNumber} (
                    {ch.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Document Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Derivations & Formula Sheet"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key concepts, formula sheet, and solved problems"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Select PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full px-3 py-2 border rounded-xl text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 mt-4"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading PDF...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Publish Material</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Materials List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-navy-950">
                Published Study Materials ({materials.length})
              </h3>
              <p className="text-xs text-slate-500">Secure PDF files stored in protected storage</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Title & Chapter</th>
                  <th className="py-2.5 px-4">Subject & Class</th>
                  <th className="py-2.5 px-4">File Size</th>
                  <th className="py-2.5 px-4">Sample Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{m.title}</p>
                      <p className="text-[11px] text-slate-400">Ch {m.chapter?.chapterNumber}: {m.chapter?.title}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <p className="font-semibold">{m.chapter?.subject?.name}</p>
                      <p className="text-[10px] text-slate-400">{m.chapter?.subject?.class?.name}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {(m.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          m.chapter?.isFree
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.chapter?.isFree ? 'Free Sample' : 'Locked'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        title="Delete material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
