// =============================================================================
// LIVE SESSIONS SERVICE — SESSION LIFECYCLE & ACCESS CONTROL
// Centralized state machine: UPCOMING -> LIVE NOW -> ENDED (with/without replay)
// Persists sessions and reminders in localStorage with reactive event dispatching
// =============================================================================

const STORAGE_KEY_LIVE = 'medprep_live_sessions_v2';
const STORAGE_KEY_REMINDERS = 'medprep_live_reminders_v1';

export const SESSION_STATUS = {
  UPCOMING: 'upcoming',
  LIVE: 'live',
  ENDED: 'ended'
};

// Base timestamp reference for prototype reactivity (relative to session load time)
const PROTOTYPE_EPOCH = Date.now();

export const INITIAL_LIVE_SESSIONS = [
  // 1. CURRENTLY LIVE NOW: STEMI & Acute Coronary Syndrome Grand Rounds
  {
    id: 'live-stemi-01',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    title: 'STEMI & Acute Coronary Syndrome Grand Rounds',
    topic: 'STEMI Pathways, Culprit Vessel Localization & Reperfusion Timing',
    description: 'Interactive 12-lead ECG interpretation, primary PCI vs thrombolysis decision-making drills, cath-lab activation protocols, and student live Q&A.',
    faculty: 'Dr. Siddharth V.',
    facultyTitle: 'MD, DM Interventional Cardiology',
    college: 'AIIMS New Delhi Lead Mentor',
    facultyId: 'fac-1',
    timezone: 'IST',
    formattedTime: '8:00 PM – 9:15 PM IST',
    duration: '1 hr 15 min',
    durationMinutes: 75,
    // Started 20 mins ago, ends in 55 mins from epoch
    startOffsetMinutes: -20,
    endOffsetMinutes: 55,
    attendeesCount: 342,
    meetingLink: 'https://meet.google.com/medprep-stemi-live',
    replayAvailable: false,
    replayUrl: null,
    badge: 'Live Tonight',
    studyPlan: {
      weekNumber: 1,
      dayNumber: 3,
      dayTitle: 'Cardiac Arrhythmias & ECG Interpretation',
      subjectName: 'Cardiology & Hemodynamics',
      moduleTitle: 'Cardiac Arrhythmias & Clinical ECG Mastery'
    }
  },

  // 2. UPCOMING TONIGHT: ECG Mastery: Distinguishing VT vs SVT with Aberrancy
  {
    id: 'live-arrhythmia-02',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    title: 'ECG Mastery: Distinguishing VT vs SVT with Aberrancy',
    topic: 'Wide Complex Tachycardias & Antiarrhythmic Selection',
    description: 'Deep-dive into the Brugada 4-step algorithm, Vereckei aVR lead criteria, AV dissociation hallmarks, and emergency cardioversion.',
    faculty: 'Dr. Ananya Roy',
    facultyTitle: 'MD General Medicine, DNB Cardiology',
    college: 'Safdarjung Hospital Residency Lead',
    facultyId: 'fac-2',
    timezone: 'IST',
    formattedTime: 'Tonight • 10:00 PM – 11:15 PM IST',
    duration: '1 hr 15 min',
    durationMinutes: 75,
    // Starts in 2 hours 15 minutes (135 mins)
    startOffsetMinutes: 135,
    endOffsetMinutes: 210,
    attendeesCount: 285,
    meetingLink: 'https://meet.google.com/medprep-ecg-masterclass',
    replayAvailable: false,
    replayUrl: null,
    badge: 'Upcoming Tonight',
    studyPlan: {
      weekNumber: 1,
      dayNumber: 3,
      dayTitle: 'Cardiac Arrhythmias & ECG Interpretation',
      subjectName: 'Cardiology & Hemodynamics',
      moduleTitle: 'Cardiac Arrhythmias & Clinical ECG Mastery'
    }
  },

  // 3. UPCOMING TOMORROW: Clinical Pharmacology: High-Yield Toxins & Antidotes
  {
    id: 'live-pharm-03',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    title: 'Clinical Pharmacology: High-Yield Toxins & Specific Antidotes',
    topic: 'Toxidromes, Organophosphates, Digoxin, and Toxic Alcohols',
    description: 'High-yield poisonings, cholinergic vs anticholinergic syndromes, Digoxin-specific Fab fragments, and essential antidotes commonly tested in NExT/NEET PG.',
    faculty: 'Dr. Rajiv Mehta',
    facultyTitle: 'MD Clinical Pharmacology, Gold Medalist',
    college: 'Clinical Faculty Leader',
    facultyId: 'fac-3',
    timezone: 'IST',
    formattedTime: 'Tomorrow • 7:30 PM – 8:45 PM IST',
    duration: '1 hr 15 min',
    durationMinutes: 75,
    // Starts tomorrow evening (~24h from now)
    startOffsetMinutes: 1440,
    endOffsetMinutes: 1515,
    attendeesCount: 410,
    meetingLink: 'https://meet.google.com/medprep-pharm-live',
    replayAvailable: false,
    replayUrl: null,
    badge: 'Tomorrow',
    studyPlan: {
      weekNumber: 1,
      dayNumber: 2,
      dayTitle: 'Congestive Heart Failure & Pharmacotherapy',
      subjectName: 'Cardiology & Hemodynamics',
      moduleTitle: 'Heart Failure & Guideline Pharmacotherapy'
    }
  },

  // 4. ENDED WITH REPLAY: Valvular Surgery Timing & TAVI Indications
  {
    id: 'live-valvular-04',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    title: 'Valvular Surgery Timing & Transcatheter Valve Interventions',
    topic: 'Aortic Stenosis Grading, Wilkins PMBV Score & TAVI Criteria',
    description: 'Surgical vs catheter-based valve replacement, anticoagulation targets in mechanical prostheses, and ACC/AHA guideline algorithms.',
    faculty: 'Dr. Siddharth V.',
    facultyTitle: 'MD, DM Interventional Cardiology',
    college: 'AIIMS New Delhi Mentor',
    facultyId: 'fac-1',
    timezone: 'IST',
    formattedTime: 'Sep 12 • 8:00 PM – 9:20 PM IST',
    duration: '1 hr 20 min',
    durationMinutes: 80,
    // Ended 2 days ago
    startOffsetMinutes: -2880,
    endOffsetMinutes: -2800,
    attendeesCount: 520,
    meetingLink: 'https://meet.google.com/medprep-valvular-archive',
    replayAvailable: true,
    replayUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&auto=format&fit=crop&q=80',
    badge: 'Replay Available',
    studyPlan: {
      weekNumber: 1,
      dayNumber: 1,
      dayTitle: 'Valvular Heart Diseases & Murmurs',
      subjectName: 'Cardiology & Hemodynamics',
      moduleTitle: 'Valvular Heart Diseases & Auscultation Dynamics'
    }
  },

  // 5. ENDED WITHOUT REPLAY: Emergency Sepsis-6 Resuscitation & Shock Bundles
  {
    id: 'live-sepsis-05',
    examId: 'neet-pg',
    examName: 'NEET PG & NExT 2026',
    title: 'Emergency Sepsis-6 Resuscitation & Hemodynamic Shock Bundles',
    topic: 'Lactate Clearance, Fluid Responsiveness & Inotropic Escalation',
    description: 'Surviving Sepsis Campaign guidelines, dynamic fluid assessment, early vasopressor initiation, and ICU triage.',
    faculty: 'Dr. Priya Sharma',
    facultyTitle: 'MRCP, UK NHS Consultant',
    college: 'Critical Care Lead Mentor',
    facultyId: 'fac-4',
    timezone: 'IST',
    formattedTime: 'Yesterday • 6:30 PM – 8:00 PM IST',
    duration: '1 hr 30 min',
    durationMinutes: 90,
    // Ended yesterday
    startOffsetMinutes: -1440,
    endOffsetMinutes: -1350,
    attendeesCount: 380,
    meetingLink: 'https://meet.google.com/medprep-sepsis-live',
    replayAvailable: false,
    replayUrl: null,
    badge: 'Ended',
    studyPlan: null
  },

  // 6. UPCOMING USMLE TRACK: Cardiac Hemodynamics & Wiggers Diagrams
  {
    id: 'live-usmle-06',
    examId: 'usmle',
    examName: 'USMLE Step 1 & 2 CK',
    title: 'Wiggers Diagram & Pressure-Volume Loops Masterclass',
    topic: 'Cardiac Hemodynamics & Valvular Shifts on PV Loops',
    description: 'Preload, afterload, and inotropy shifts on left ventricular PV loops with USMLE high-yield question breakdowns.',
    faculty: 'Dr. Marcus Vance',
    facultyTitle: 'MD, FACC Cardiology',
    college: 'USMLE Track Director',
    facultyId: 'fac-5',
    timezone: 'IST',
    formattedTime: 'Wed, Sep 16 • 9:00 PM – 10:30 PM IST',
    duration: '1 hr 30 min',
    durationMinutes: 90,
    startOffsetMinutes: 2880,
    endOffsetMinutes: 2970,
    attendeesCount: 290,
    meetingLink: 'https://meet.google.com/usmle-hemodynamics-live',
    replayAvailable: false,
    replayUrl: null,
    badge: 'Upcoming',
    studyPlan: null
  }
];

// =============================================================================
// TIME & LIFECYCLE CALCULATION UTILITIES
// =============================================================================

/**
 * Calculates start and end Date objects for a session.
 */
export function getSessionTimes(session) {
  if (!session) {
    const now = new Date();
    return { startTime: now, endTime: now };
  }

  // If explicit ISO strings exist
  if (session.startIso && session.endIso) {
    return {
      startTime: new Date(session.startIso),
      endTime: new Date(session.endIso)
    };
  }

  // If relative minute offsets are provided (ideal for reactive prototype demonstration)
  if (typeof session.startOffsetMinutes === 'number' && typeof session.endOffsetMinutes === 'number') {
    return {
      startTime: new Date(PROTOTYPE_EPOCH + session.startOffsetMinutes * 60000),
      endTime: new Date(PROTOTYPE_EPOCH + session.endOffsetMinutes * 60000)
    };
  }

  // Fallback to now
  const fallback = new Date();
  return { startTime: fallback, endTime: fallback };
}

/**
 * Central state machine evaluation:
 * currentTime < startTime              => 'upcoming'
 * startTime <= currentTime < endTime  => 'live'
 * currentTime >= endTime              => 'ended'
 */
export function getLiveSessionStatus(session, now = new Date()) {
  const { startTime, endTime } = getSessionTimes(session);
  const currentTime = (now instanceof Date ? now : new Date(now)).getTime();
  const start = startTime.getTime();
  const end = endTime.getTime();

  if (currentTime < start) {
    return SESSION_STATUS.UPCOMING;
  }
  if (currentTime >= start && currentTime < end) {
    return SESSION_STATUS.LIVE;
  }
  return SESSION_STATUS.ENDED;
}

/**
 * Core product rule: A session is ONLY joinable when live right now.
 * (now >= startTime && now < endTime)
 */
export function canJoinLiveSession(session, now = new Date()) {
  if (!session) return false;
  return getLiveSessionStatus(session, now) === SESSION_STATUS.LIVE;
}

/**
 * Replay is separate from Ended state.
 * Only watchable if session has ended AND replayUrl is available.
 */
export function canWatchReplay(session) {
  if (!session) return false;
  return Boolean(session.replayAvailable && session.replayUrl);
}

/**
 * Reminders can only be toggled for upcoming sessions.
 */
export function canSetReminder(session, now = new Date()) {
  if (!session) return false;
  return getLiveSessionStatus(session, now) === SESSION_STATUS.UPCOMING;
}

/**
 * Human-friendly countdown string.
 */
export function formatSessionCountdown(session, now = new Date()) {
  if (!session) return '';
  const { startTime, endTime } = getSessionTimes(session);
  const current = (now instanceof Date ? now : new Date(now)).getTime();
  const diffMs = startTime.getTime() - current;

  if (diffMs <= 0) {
    if (current < endTime.getTime()) {
      return 'Live Now';
    }
    return 'Session Ended';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const mins = Math.max(1, diffMin);
    const secs = diffSec % 60;
    return mins <= 2 ? `Starts in ${mins}m ${secs}s` : `Starts in ${mins}m`;
  }
  if (diffHours < 24) {
    const remMins = diffMin % 60;
    return `Starts in ${diffHours}h ${remMins}m`;
  }
  if (diffDays === 1) {
    return `Starts Tomorrow • ${session.formattedTime ? session.formattedTime.split('•').pop().trim() : '7:30 PM IST'}`;
  }
  return `Starts in ${diffDays} days`;
}

/**
 * Dynamic featured session selection hierarchy:
 * 1. Currently LIVE session (highest priority)
 * 2. Next nearest UPCOMING session
 * 3. Most recent ENDED session with replay
 * 4. Fallback to first session
 */
export function getFeaturedSession(sessions, now = new Date()) {
  if (!sessions || sessions.length === 0) return null;

  // 1. Live Now
  const liveSessions = sessions.filter(s => getLiveSessionStatus(s, now) === SESSION_STATUS.LIVE);
  if (liveSessions.length > 0) return liveSessions[0];

  // 2. Next Upcoming
  const upcomingSessions = sessions
    .filter(s => getLiveSessionStatus(s, now) === SESSION_STATUS.UPCOMING)
    .sort((a, b) => getSessionTimes(a).startTime.getTime() - getSessionTimes(b).startTime.getTime());
  if (upcomingSessions.length > 0) return upcomingSessions[0];

  // 3. Ended with replay
  const endedWithReplay = sessions
    .filter(s => getLiveSessionStatus(s, now) === SESSION_STATUS.ENDED && canWatchReplay(s))
    .sort((a, b) => getSessionTimes(b).endTime.getTime() - getSessionTimes(a).endTime.getTime());
  if (endedWithReplay.length > 0) return endedWithReplay[0];

  // 4. Any ended session
  const anyEnded = sessions
    .filter(s => getLiveSessionStatus(s, now) === SESSION_STATUS.ENDED)
    .sort((a, b) => getSessionTimes(b).endTime.getTime() - getSessionTimes(a).endTime.getTime());
  return anyEnded[0] || sessions[0] || null;
}

// =============================================================================
// REMINDERS MANAGEMENT (LOCALSTORAGE PERSISTENCE)
// =============================================================================

export function getStoredReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isReminderSet(sessionId) {
  const list = getStoredReminders();
  return list.includes(sessionId);
}

export function toggleSessionReminder(sessionId) {
  const list = getStoredReminders();
  let updated;
  if (list.includes(sessionId)) {
    updated = list.filter(id => id !== sessionId);
  } else {
    updated = [...list, sessionId];
  }
  try {
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('medprep-live-reminders-updated', { detail: updated }));
    }
  } catch (e) {
    console.warn('Reminder storage error:', e);
  }
  return updated.includes(sessionId);
}

// =============================================================================
// MAIN SERVICE CLASS
// =============================================================================

class LiveSessionsService {
  constructor() {
    this.sessions = this.loadSessions();
  }

  loadSessions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIVE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Live sessions read error:', e);
    }
    return [...INITIAL_LIVE_SESSIONS];
  }

  saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY_LIVE, JSON.stringify(this.sessions));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('medprep-live-sessions-updated', { detail: this.sessions }));
      }
    } catch (e) {
      console.warn('Live sessions save error:', e);
    }
  }

  getAllSessions() {
    return [...this.sessions];
  }

  getSessionById(id) {
    return this.sessions.find(s => s.id === id) || null;
  }

  /**
   * Filter sessions by exam track and lifecycle status
   */
  getSessions(examFilter = 'neet-pg', statusFilter = 'all', now = new Date()) {
    return this.sessions.filter((session) => {
      // 1. Exam track relevance: If specific exam is requested, filter strictly
      if (examFilter !== 'all' && session.examId !== examFilter) {
        return false;
      }

      // 2. Lifecycle status filter
      if (statusFilter !== 'all') {
        const status = getLiveSessionStatus(session, now);
        if (statusFilter === 'live' && status !== SESSION_STATUS.LIVE) return false;
        if (statusFilter === 'upcoming' && status !== SESSION_STATUS.UPCOMING) return false;
        if (statusFilter === 'past' && status !== SESSION_STATUS.ENDED) return false;
        if (statusFilter === 'plan' && !session.studyPlan) return false;
      }

      return true;
    });
  }

  addSession(data) {
    let examId = data.examId;
    let examName = data.examName;

    if (!examId && data.course) {
      if (data.course.includes('USMLE')) {
        examId = 'usmle';
        examName = 'USMLE Step 1 & 2 CK';
      } else if (data.course.includes('PLAB') || data.course.includes('UKMLA')) {
        examId = 'plab';
        examName = 'PLAB 1 & 2 / UKMLA';
      } else if (data.course.includes('Europe')) {
        examId = 'europe';
        examName = 'Europe Medical Licensing';
      } else {
        examId = 'neet-pg';
        examName = 'NEET PG & NExT 2026';
      }
    }

    const durationMinutes = Number(data.durationMinutes) || 
      (typeof data.duration === 'string' && data.duration.includes('hour') ? Math.round(parseFloat(data.duration) * 60) : parseInt(data.duration, 10)) || 75;

    let startOffsetMinutes = 60;
    let endOffsetMinutes = 60 + durationMinutes;

    if (data.isLiveNow) {
      startOffsetMinutes = -5;
      endOffsetMinutes = durationMinutes - 5;
    } else if (data.date && data.time) {
      try {
        const cleanTime = data.time.replace('IST', '').trim();
        const sched = new Date(`${data.date}T${cleanTime}`);
        if (!isNaN(sched.getTime())) {
          startOffsetMinutes = Math.round((sched.getTime() - PROTOTYPE_EPOCH) / 60000);
          endOffsetMinutes = startOffsetMinutes + durationMinutes;
        }
      } catch (e) {
        console.warn('Live session date parse warning:', e);
      }
    }

    const newSession = {
      id: data.id || `live-${Date.now()}`,
      examId: examId || 'neet-pg',
      examName: examName || 'NEET PG & NExT 2026',
      course: examName || data.course || 'NEET PG & NExT 2026',
      title: data.title || data.topic || 'Clinical Grand Rounds',
      topic: data.topic || data.title || 'Clinical Grand Rounds',
      description: data.description || 'Clinical grand rounds presentation with interactive discussion.',
      timezone: data.timezone || 'IST',
      formattedTime: data.formattedTime || (data.date ? `${data.date} • ${data.time || '8:00 PM IST'}` : `${data.time || '8:00 PM'} IST`),
      date: data.date || 'Today',
      time: data.time || '8:00 PM IST',
      duration: data.duration || `${durationMinutes} mins`,
      durationMinutes,
      faculty: data.faculty || data.instructor || 'Dr. Siddharth V.',
      instructor: data.instructor || data.faculty || 'Dr. Siddharth V.',
      facultyTitle: data.facultyTitle || 'Clinical Faculty Mentor',
      college: data.college || 'Clinical Specialist',
      facultyId: data.facultyId || 'fac-1',
      meetingLink: data.meetingLink || data.zoomLink || 'https://meet.google.com/medprep-live-room',
      zoomLink: data.zoomLink || data.meetingLink || 'https://meet.google.com/medprep-live-room',
      attendeesCount: data.registeredStudents || 0,
      registeredStudents: data.registeredStudents || 380,
      replayAvailable: false,
      replayUrl: null,
      packageTier: data.packageTier || 'All Students of this Exam',
      badge: data.isLiveNow ? 'Live Tonight' : 'Upcoming',
      startOffsetMinutes,
      endOffsetMinutes,
      studyPlan: data.weekId ? {
        weekNumber: Number(data.weekId),
        dayNumber: Number(data.dayId || 1),
        dayTitle: `Day ${data.dayId || 1} Review`,
        subjectName: 'Clinical Medicine',
        moduleTitle: 'Clinical Medicine Module'
      } : (data.studyPlan || null)
    };

    this.sessions = [newSession, ...this.sessions];
    this.saveSessions();

    return newSession;
  }

  deleteSession(id) {
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.saveSessions();
    return true;
  }

  startBroadcast(id) {
    const session = this.sessions.find(s => s.id === id);
    if (!session) return null;

    const duration = session.durationMinutes || 75;
    session.startOffsetMinutes = -2;
    session.endOffsetMinutes = duration - 2;
    session.startIso = new Date(Date.now() - 2 * 60000).toISOString();
    session.endIso = new Date(Date.now() + duration * 60000).toISOString();
    session.badge = 'Live Now';

    this.saveSessions();
    return session;
  }

  endBroadcast(id, replayUrl) {
    const session = this.sessions.find(s => s.id === id);
    if (!session) return null;

    const duration = session.durationMinutes || 75;
    session.startOffsetMinutes = -duration - 10;
    session.endOffsetMinutes = -1;
    session.startIso = new Date(Date.now() - (duration + 10) * 60000).toISOString();
    session.endIso = new Date(Date.now() - 60000).toISOString();

    if (replayUrl) {
      session.replayAvailable = true;
      session.replayUrl = replayUrl;
      session.badge = 'Replay Available';
    } else {
      session.badge = 'Ended';
    }

    this.saveSessions();
    return session;
  }

  uploadRecording(sessionId, recordingUrl) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return null;

    session.replayAvailable = true;
    session.replayUrl = recordingUrl || 'https://medprep.storage/recordings/grand-round-archive.mp4';
    session.badge = 'Recorded';
    this.saveSessions();

    return session;
  }

  subscribe(callback) {
    const handler = (e) => callback(e.detail || this.sessions);
    window.addEventListener('medprep-live-sessions-updated', handler);
    return () => window.removeEventListener('medprep-live-sessions-updated', handler);
  }
}

export const liveSessionsService = new LiveSessionsService();
