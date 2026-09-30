import React, { useState, useEffect } from 'react';
import { Plus, Radio, X, Link as LinkIcon } from 'lucide-react';
import { liveSessionsService } from '../services/liveSessionsService';
import { authService, USER_ROLES } from '../services/authService';
import { catalogService } from '../services/catalogService';
import { contentService } from '../services/contentService';
import { peopleService } from '../services/peopleService';

const FACULTY_ALLOWED_EXAMS = ['neet-pg', 'usmle'];

const selectCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20';

// Right-side slide-over form for scheduling a live session (admin + faculty).
export default function ScheduleLiveSessionDrawer({ open, onClose, onScheduled }) {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;

  const activeExams = catalogService.getActiveExams();
  const availableExams = isAdmin
    ? activeExams
    : activeExams.filter((e) => FACULTY_ALLOWED_EXAMS.includes(e.id));
  const facultyList = peopleService.getFacultyList ? peopleService.getFacultyList() : [];

  const [formExam, setFormExam] = useState(() => availableExams[0]?.id || 'neet-pg');
  const [curriculum, setCurriculum] = useState(() => contentService.getCurriculumStructure(formExam));
  const [formWeek, setFormWeek] = useState(() => curriculum.weeks[0]?.id || '1');
  const [formDay, setFormDay] = useState(() => curriculum.weeks[0]?.days[0]?.id || '1');
  const [formTopic, setFormTopic] = useState('');
  const [formDate, setFormDate] = useState('2026-09-08');
  const [formTime, setFormTime] = useState('20:00');
  const [formDuration, setFormDuration] = useState('1.5 hours');
  const [formMeetingLink, setFormMeetingLink] = useState('https://meet.google.com/medprep-grand-rounds-live');
  const [formFaculty, setFormFaculty] = useState(() => currentUser?.name || 'Dr. Siddharth V.');
  const [formTier, setFormTier] = useState('Standard & Premium Only');

  const currentWeekObj = curriculum.weeks.find((w) => w.id === String(formWeek)) || curriculum.weeks[0];

  useEffect(() => {
    const cur = contentService.getCurriculumStructure(formExam);
    setCurriculum(cur);
    setFormWeek(cur.weeks[0]?.id || '1');
  }, [formExam]);

  useEffect(() => {
    const weekObj = curriculum.weeks.find((w) => w.id === String(formWeek)) || curriculum.weeks[0];
    setFormDay(weekObj?.days?.[0]?.id || '1');
  }, [formWeek, curriculum]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selectedExamName = availableExams.find((e) => e.id === formExam)?.name || formExam;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTopic.trim()) return;
    const created = liveSessionsService.addSession({
      examId: formExam,
      examName: selectedExamName,
      weekId: formWeek,
      dayId: formDay,
      topic: formTopic.trim(),
      date: formDate,
      time: formTime,
      duration: formDuration,
      faculty: formFaculty,
      meetingLink: formMeetingLink.trim(),
      packageTier: formTier,
    });
    setFormTopic('');
    onScheduled?.(created, formDay);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Schedule New Live Session</h4>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Synced with Day View (Phase 4) & Dashboard (Phase 3)
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">1. Select Exam Track *</label>
              <select value={formExam} onChange={(e) => setFormExam(e.target.value)} className={selectCls}>
                {availableExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>{exam.flag} {exam.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">2. Target Week *</label>
                <select value={formWeek} onChange={(e) => setFormWeek(e.target.value)} className={selectCls}>
                  {curriculum.weeks.map((w) => (
                    <option key={w.id} value={w.id}>{w.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">3. Target Day in Curriculum *</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  className={selectCls.replace('border-slate-200', 'border-red-200')}
                >
                  {currentWeekObj?.days.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Session Topic & Clinical Theme *</label>
              <input
                type="text"
                required
                placeholder="e.g. STEMI Pathways, Dynamic Auscultation & Door-to-Balloon Drills"
                value={formTopic}
                onChange={(e) => setFormTopic(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Meeting / Broadcast Link *</label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  required
                  value={formMeetingLink}
                  onChange={(e) => setFormMeetingLink(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-red-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Session Date *</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className={selectCls}
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Start Time (IST) *</label>
                <input
                  type="time"
                  required
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className={selectCls}
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Duration *</label>
                <select value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className={selectCls}>
                  <option value="30 min">30 Minutes</option>
                  <option value="1 hour">1 Hour</option>
                  <option value="1.5 hours">1.5 Hours</option>
                  <option value="2 hours">2 Hours</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                {isAdmin ? 'Assigned Faculty Specialist *' : 'Host Faculty (Auto-Filled)'}
              </label>
              {isAdmin ? (
                <select value={formFaculty} onChange={(e) => setFormFaculty(e.target.value)} className={selectCls}>
                  {facultyList.map((f) => (
                    <option key={f.id} value={`${f.name} (${f.specialty})`}>{f.name} — {f.specialty}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={formFaculty}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 bg-slate-100 cursor-not-allowed"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Eligible Package Tier (Rule 9) *</label>
              <select value={formTier} onChange={(e) => setFormTier(e.target.value)} className={selectCls}>
                <option value="All Students of this Exam">All Enrolled Students (Basic, Standard & Premium)</option>
                <option value="Standard & Premium Only">Standard & Premium Tiers Only</option>
                <option value="All Premium Students">Premium VIP Students Only</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900">
              <span className="font-bold">System Behavior Note:</span> This session will appear on the Student Dashboard of all students enrolled in <strong>{selectedExamName}</strong> with an eligible package, and automatically unlocks under <strong>Day {formDay}'s Live Session Tab</strong>.
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Schedule Live Grand Round</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
