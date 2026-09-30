import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Radio, 
  Calendar, 
  Clock, 
  Users, 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  UploadCloud, 
  Play, 
  X, 
  GraduationCap,
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import { liveSessionsService } from '../../services/liveSessionsService';
import { authService, USER_ROLES } from '../../services/authService';
import { catalogService } from '../../services/catalogService';
import ScheduleLiveSessionDrawer from '../ScheduleLiveSessionDrawer';

export default function LiveSessionsTab() {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [activeCatalogExams, setActiveCatalogExams] = useState(() => catalogService.getActiveExams());

  const isAdmin = currentUser?.role === USER_ROLES.ADMIN;
  const isFaculty = currentUser?.role === USER_ROLES.FACULTY;
  const facultyAllowedExams = ['neet-pg', 'usmle'];

  // Scoped Exams: Admin sees all; Faculty sees only assigned
  const availableExams = isAdmin 
    ? activeCatalogExams 
    : activeCatalogExams.filter(e => facultyAllowedExams.includes(e.id));

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Filter & List State
  // ---------------------------------------------------------------------------
  const [examFilter, setExamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sessions, setSessions] = useState(() => 
    liveSessionsService.getSessions(examFilter, statusFilter, isFaculty ? facultyAllowedExams : null)
  );

  // Modals & Toast
  const [toastMessage, setToastMessage] = useState('');
  const [recordingModalSession, setRecordingModalSession] = useState(null);
  const [customRecordingUrl, setCustomRecordingUrl] = useState('');

  // Sync sessions on service updates
  useEffect(() => {
    const unsubscribe = liveSessionsService.subscribe(() => {
      setSessions(liveSessionsService.getSessions(examFilter, statusFilter, isFaculty ? facultyAllowedExams : null));
    });
    return unsubscribe;
  }, [examFilter, statusFilter, isFaculty]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleScheduled = (created, dayId) => {
    showToast(`✅ Live Session "${created.topic}" scheduled! Synced with Student Dashboard & Day ${dayId} Live Tab.`);
  };

  // Upload Recording Handler
  const handleUploadRecordingSubmit = (e) => {
    e.preventDefault();
    if (!recordingModalSession) return;

    liveSessionsService.uploadRecording(recordingModalSession.id, customRecordingUrl);
    setRecordingModalSession(null);
    setCustomRecordingUrl('');
    showToast(`✅ Recording published for "${recordingModalSession.topic}"! Available on Student's Day Content View.`);
  };

  // Cancel Session Handler
  const handleCancelSession = (session) => {
    if (confirm(`Are you sure you want to cancel "${session.topic}"?`)) {
      liveSessionsService.cancelSession(session.id);
      showToast(`Session "${session.topic}" cancelled and removed from student calendars.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-1.5">
              <Radio className="w-3.5 h-3.5 text-red-600" />
              <span>Rule 10 Enforced: Live Faculty Grand Rounds</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Live Sessions & Broadcast Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Schedule live case discussions, clinical triage simulations, and attach session recordings for candidate review.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isFaculty && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Faculty Scoped (NEET PG / USMLE)
              </span>
            )}
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {sessions.length} Sessions Active
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-600" />
              <span>Schedule New Live Session</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Pick exam, week & day, faculty, package tier and broadcast link.</p>
          </div>
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer text-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* PART A.2: SCHEDULED LIVE SESSIONS LIST / TABLE                       */}
        {/* ------------------------------------------------------------------- */}
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Scheduled Sessions Roster</h3>
              <p className="text-xs text-slate-500">Live synchronized broadcast roster across all exam categories</p>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 font-semibold">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <select
                  value={examFilter}
                  onChange={(e) => setExamFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-bold px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Exam Tracks</option>
                  {availableExams.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 font-semibold">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-700 font-bold px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Upcoming">Upcoming / Scheduled</option>
                  <option value="Live Soon">Live Tonight</option>
                  <option value="Completed">Completed / Recorded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Exam & Day</th>
                  <th className="py-3.5 px-4">Session Topic</th>
                  <th className="py-3.5 px-4">Scheduled Date & Time</th>
                  <th className="py-3.5 px-4">Faculty Assigned</th>
                  <th className="py-3.5 px-4">Scope</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No live sessions found matching the active filters.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{session.examName}</div>
                        <div className="text-[11px] text-indigo-700 font-semibold">
                          Week {session.weekId} • Day {session.dayId}
                        </div>
                      </td>
                      
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-800 line-clamp-1">{session.topic}</div>
                        <div className="text-[10px] text-slate-400 font-mono line-clamp-1">
                          Duration: {session.duration} • {session.attendeesCount || 120} Registered
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{session.date}</div>
                        <div className="text-[11px] font-mono text-slate-500">{session.time}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{session.faculty}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {session.packageTier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          session.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : session.status === 'Live Soon'
                            ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {session.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {session.isCompleted ? (
                          session.recordingUrl ? (
                            <button
                              onClick={() => {
                                setRecordingModalSession(session);
                                setCustomRecordingUrl(session.recordingUrl);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors cursor-pointer text-xs inline-flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Edit Recording</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setRecordingModalSession(session);
                                setCustomRecordingUrl('https://medprep.storage/recordings/grand-round-cardio-stemi.mp4');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-xs inline-flex items-center gap-1"
                            >
                              <UploadCloud className="w-3 h-3" />
                              <span>Attach Recording</span>
                            </button>
                          )
                        ) : (
                          <>
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition-colors cursor-pointer text-xs inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Join</span>
                            </a>
                            <button
                              onClick={() => handleCancelSession(session)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Cancel Session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      <ScheduleLiveSessionDrawer
        open={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduled={handleScheduled}
      />

      {/* DRAWER: Upload / Attach Session Recording */}
      {recordingModalSession && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setRecordingModalSession(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
              
              {/* Sticky Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Upload / Attach Session Recording</h4>
                    <span className="text-xs text-slate-400">
                      Day {recordingModalSession.dayId} • {recordingModalSession.examName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setRecordingModalSession(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleUploadRecordingSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-sm">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Topic</label>
                  <input
                    type="text"
                    disabled
                    value={recordingModalSession.topic}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cloud Recording URL (.mp4 or CDN Stream) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://medprep.storage/recordings/grand-round-cardio.mp4"
                    value={customRecordingUrl}
                    onChange={(e) => setCustomRecordingUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    Student View Effect
                  </span>
                  <p>
                    Attaching this link will update the <strong>Live Session tab on Day {recordingModalSession.dayId}</strong> in the Student Day Content View to show <em>"Recorded Faculty Grand Round Available"</em>.
                  </p>
                </div>

                {/* Sticky / Dedicated Footer Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRecordingModalSession(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2 text-sm transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Publish Recording to Student LMS</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
