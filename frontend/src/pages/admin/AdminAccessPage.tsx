import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Users,
  ShieldAlert,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  History,
} from 'lucide-react';
import api from '../../services/api';

export const AdminAccessPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentEntitlements, setStudentEntitlements] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'students' | 'audit'>('students');

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  // Grant Modal
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantType, setGrantType] = useState<'CHAPTER' | 'SUBJECT' | 'CLASS_PASS'>('CLASS_PASS');
  const [targetId, setTargetId] = useState('');
  const [durationDays, setDurationDays] = useState<string>('30');
  const [auditReason, setAuditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [studRes, auditRes, clsRes, subRes, chRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/audit-logs'),
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
        api.get('/admin/chapters'),
      ]);
      setStudents(studRes.data.students || []);
      setAuditLogs(auditRes.data.auditLogs || []);
      setClasses(clsRes.data.classes || []);
      setSubjects(subRes.data.subjects || []);
      setChapters(chRes.data.chapters || []);
    } catch (err) {
      console.error('Error fetching access data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`/admin/students/${student.id}/entitlements`);
      setStudentEntitlements(res.data.entitlements || []);
    } catch (err) {
      console.error('Error fetching entitlements:', err);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!auditReason.trim()) {
      alert('Audit reason is strictly required by assessment security rules.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/access/grant', {
        userId: selectedStudent.id,
        type: grantType,
        targetId,
        durationDays: durationDays ? parseInt(durationDays) : null,
        reason: auditReason.trim(),
      });

      setIsGrantModalOpen(false);
      setAuditReason('');
      handleSelectStudent(selectedStudent);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to grant access');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccess = async (entitlementId: string) => {
    const reason = prompt('Enter mandatory audit reason for revoking access:');
    if (!reason || !reason.trim()) {
      alert('Action cancelled: Reason is mandatory for audit logging.');
      return;
    }

    try {
      await api.post('/admin/access/revoke', {
        entitlementId,
        reason: reason.trim(),
      });

      handleSelectStudent(selectedStudent);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke access');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy-950">Student Access & Entitlements</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manually grant or revoke student material entitlements with cryptographic audit trail
            logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('students')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'students'
                ? 'bg-navy-950 text-white'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students Directory</span>
          </button>
          <button
            onClick={() => setActiveView('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'audit'
                ? 'bg-navy-950 text-white'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail Logs</span>
          </button>
        </div>
      </div>

      {activeView === 'students' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: Students List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-navy-950">
              Registered Students ({students.length})
            </h3>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {students.map((stud) => {
                const isSelected = selectedStudent?.id === stud.id;
                return (
                  <button
                    key={stud.id}
                    onClick={() => handleSelectStudent(stud)}
                    className={`w-full py-3 px-3 text-left rounded-2xl transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50 border border-brand-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-navy-950">{stud.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                        {stud.email}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-brand-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {stud._count?.entitlements || 0} Access
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Student Entitlements */}
          <div className="lg:col-span-2 space-y-4">
            {selectedStudent ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Access Management for
                    </span>
                    <h3 className="text-xl font-black text-navy-950">{selectedStudent.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {selectedStudent.email} • ID: {selectedStudent.id}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsGrantModalOpen(true);
                      setTargetId(classes[0]?.id || '');
                    }}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Grant Access Manually</span>
                  </button>
                </div>

                {studentEntitlements.length === 0 ? (
                  <div className="text-center py-10 space-y-2 text-slate-400">
                    <KeyRound className="w-8 h-8 mx-auto" />
                    <p className="text-xs font-semibold">No active entitlements for this student.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Active Entitlements ({studentEntitlements.length})
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                      {studentEntitlements.map((ent) => (
                        <div
                          key={ent.id}
                          className="p-3.5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                                {ent.type}
                              </span>
                              {ent.grantedByAdmin && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  Admin Granted
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-slate-600 mt-1">
                              Target ID: {ent.targetId}
                            </p>
                            {ent.auditReason && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5">
                                Reason: "{ent.auditReason}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right text-[11px]">
                              <span className="font-semibold text-slate-700 block">
                                {ent.validUntil
                                  ? `Expires: ${new Date(ent.validUntil).toLocaleDateString()}`
                                  : 'Lifetime Access'}
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                Granted: {new Date(ent.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <button
                              onClick={() => handleRevokeAccess(ent.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                              title="Revoke access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Student Selected</h4>
                <p className="text-xs text-slate-500">
                  Select a student from the directory to inspect and modify their active study
                  entitlements.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AUDIT LOGS TABLE */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Admin User</th>
                <th className="py-3 px-6">Action Performed</th>
                <th className="py-3 px-6">Target Type & ID</th>
                <th className="py-3 px-6">Mandatory Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-6 font-mono text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-6 font-bold text-slate-900">
                    {log.admin?.name || 'Administrator'}
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        log.action.includes('GRANT')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-mono text-slate-700">
                    {log.targetType}: {log.targetId.substring(0, 10)}...
                  </td>
                  <td className="py-3 px-6 font-medium text-slate-800 italic">
                    "{log.reason}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GRANT ACCESS MODAL */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-navy-950">
                Grant Access: {selectedStudent.name}
              </h3>
              <button onClick={() => setIsGrantModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantAccess} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Entitlement Type</label>
                <select
                  value={grantType}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setGrantType(t);
                    if (t === 'CLASS_PASS') setTargetId(classes[0]?.id || '');
                    if (t === 'SUBJECT') setTargetId(subjects[0]?.id || '');
                    if (t === 'CHAPTER') setTargetId(chapters[0]?.id || '');
                  }}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="CLASS_PASS">Class All-Access Pass</option>
                  <option value="SUBJECT">Full Subject Package</option>
                  <option value="CHAPTER">Single Chapter Notes</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Entity</label>
                <select
                  value={targetId}
                  required
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  {grantType === 'CLASS_PASS' &&
                    classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.board?.name})
                      </option>
                    ))}
                  {grantType === 'SUBJECT' &&
                    subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.class?.name} - {s.name}
                      </option>
                    ))}
                  {grantType === 'CHAPTER' &&
                    chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Duration in Days (Blank or 0 for Lifetime)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mandatory Audit Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="e.g. Scholarship award / technical assessment test grant"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !auditReason.trim()}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition mt-4 disabled:opacity-50"
              >
                {isSubmitting ? 'Granting...' : 'Grant & Record Audit Log'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
