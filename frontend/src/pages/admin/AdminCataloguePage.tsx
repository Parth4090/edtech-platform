import React, { useState, useEffect } from 'react';
import {
  Layers,
  GraduationCap,
  BookOpen,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';
import { Board, Class, Subject, Chapter } from '../../types';

export const AdminCataloguePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'boards' | 'classes' | 'subjects' | 'chapters'>('chapters');
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [modalType, setModalType] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [bRes, cRes, sRes, chRes] = await Promise.all([
        api.get('/admin/boards'),
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
        api.get('/admin/chapters'),
      ]);
      setBoards(bRes.data.boards || []);
      setClasses(cRes.data.classes || []);
      setSubjects(sRes.data.subjects || []);
      setChapters(chRes.data.chapters || []);
    } catch (err) {
      console.error('Error fetching admin catalogue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleFree = async (chapterId: string, currentFree: boolean) => {
    try {
      await api.patch(`/admin/chapters/${chapterId}/free`, {
        isFree: !currentFree,
      });
      setChapters((prev) =>
        prev.map((ch) => (ch.id === chapterId ? { ...ch, isFree: !currentFree } : ch))
      );
    } catch (err) {
      alert('Failed to update free status');
    }
  };

  const handleDelete = async (endpoint: string, id: string) => {
    if (!confirm('Are you sure you want to delete this record? This may cascade to child records.'))
      return;
    try {
      await api.delete(`/admin/${endpoint}/${id}`);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete record');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalType === 'board') {
        await api.post('/admin/boards', formData);
      } else if (modalType === 'class') {
        await api.post('/admin/classes', { ...formData, order: parseInt(formData.order || '0') });
      } else if (modalType === 'subject') {
        await api.post('/admin/subjects', formData);
      } else if (modalType === 'chapter') {
        await api.post('/admin/chapters', {
          ...formData,
          chapterNumber: parseInt(formData.chapterNumber || '1'),
          isFree: Boolean(formData.isFree),
        });
      }
      setModalType(null);
      setFormData({});
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Curriculum Catalogue Management</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage academic boards, classes, subject packages, chapters, and free sample rules.
          </p>
        </div>

        <button
          onClick={() => {
            const single = activeTab.slice(0, -1);
            setModalType(single);
            setFormData({});
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab.slice(0, -1).toUpperCase()}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'chapters', label: `Chapters (${chapters.length})`, icon: FileText },
          { id: 'subjects', label: `Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'classes', label: `Classes (${classes.length})`, icon: GraduationCap },
          { id: 'boards', label: `Boards (${boards.length})`, icon: Layers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-navy-950 text-white shadow'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CHAPTERS TABLE */}
      {activeTab === 'chapters' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Ch #</th>
                <th className="py-3 px-6">Chapter Title & Description</th>
                <th className="py-3 px-6">Subject & Class</th>
                <th className="py-3 px-6">Free Sample</th>
                <th className="py-3 px-6">Materials Count</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chapters.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6 font-bold text-navy-950">Ch {ch.chapterNumber}</td>
                  <td className="py-3 px-6">
                    <p className="font-bold text-slate-900">{ch.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{ch.slug}</p>
                  </td>
                  <td className="py-3 px-6">
                    <p className="font-semibold text-slate-800">{ch.subject?.name}</p>
                    <p className="text-[11px] text-slate-400">{ch.subject?.class?.name}</p>
                  </td>
                  <td className="py-3 px-6">
                    <button
                      onClick={() => handleToggleFree(ch.id, ch.isFree)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition ${
                        ch.isFree
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ch.isFree ? 'Free Sample (Active)' : 'Locked (Paid)'}
                    </button>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-slate-700">
                    {ch.materials?.length || 0} PDF
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleDelete('chapters', ch.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBJECTS TABLE */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Subject Name</th>
                <th className="py-3 px-6">Class & Board</th>
                <th className="py-3 px-6">Chapters Count</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6">
                    <p className="font-bold text-slate-900">{sub.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{sub.slug}</p>
                  </td>
                  <td className="py-3 px-6">
                    <p className="font-semibold text-slate-800">{sub.class?.name}</p>
                    <p className="text-[11px] text-slate-400">{sub.class?.board?.name}</p>
                  </td>
                  <td className="py-3 px-6 font-bold text-navy-950 font-mono">
                    {sub._count?.chapters || 5} Chapters
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleDelete('subjects', sub.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CLASSES TABLE */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Order</th>
                <th className="py-3 px-6">Class Name</th>
                <th className="py-3 px-6">Board</th>
                <th className="py-3 px-6">Subjects</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classes.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6 font-bold text-slate-500 font-mono">{cls.order}</td>
                  <td className="py-3 px-6 font-bold text-navy-950">{cls.name}</td>
                  <td className="py-3 px-6 text-slate-600">{cls.board?.name}</td>
                  <td className="py-3 px-6 font-mono font-bold text-navy-950">
                    {cls.subjects?.length || 0} Subjects
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleDelete('classes', cls.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BOARDS TABLE */}
      {activeTab === 'boards' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Board Name</th>
                <th className="py-3 px-6">Slug</th>
                <th className="py-3 px-6">Classes Count</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {boards.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6 font-bold text-navy-950">{b.name}</td>
                  <td className="py-3 px-6 font-mono text-slate-500">{b.slug}</td>
                  <td className="py-3 px-6 font-mono font-bold text-navy-950">
                    {b.classes?.length || 0} Classes
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button
                      onClick={() => handleDelete('boards', b.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Delete Board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-navy-950 uppercase">
                Create New {modalType}
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              {modalType === 'board' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Board Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ICSE Board"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. icse"
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                </>
              )}

              {modalType === 'class' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Board</label>
                    <select
                      required
                      onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="">Select Board</option>
                      {boards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Class Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Class 12"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. class-12"
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Order Index</label>
                    <input
                      type="number"
                      defaultValue={12}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </>
              )}

              {modalType === 'subject' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Class</label>
                    <select
                      required
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.board?.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Biology"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. class-12-biology"
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                </>
              )}

              {modalType === 'chapter' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Subject</label>
                    <select
                      required
                      onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.class?.name} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chapter Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Optics and Wave Motion"
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Slug</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. optics-wave-motion"
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Chapter Number</label>
                      <input
                        type="number"
                        defaultValue={1}
                        onChange={(e) =>
                          setFormData({ ...formData, chapterNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="isFreeCheck"
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                        className="rounded text-brand-600 w-4 h-4"
                      />
                      <label htmlFor="isFreeCheck" className="font-bold text-slate-700">
                        Mark Free Sample
                      </label>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition mt-4"
              >
                {isSubmitting ? 'Saving...' : 'Create Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
