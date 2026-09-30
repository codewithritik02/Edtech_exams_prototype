import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  UploadCloud, 
  Video, 
  FileText, 
  Users, 
  BarChart3, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Radio, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Search,
  BookOpen,
  Image as ImageIcon,
  Brain,
  Edit2,
  X
} from 'lucide-react';
import FacultyNavbar from '../components/FacultyNavbar';
import FacultySidebar from '../components/FacultySidebar';
import { 
  facultyProfileData, 
  facultySummaryMetrics, 
  facultyRecentActivity, 
  facultyStudentDirectory,
  dashboardTests,
  testService,
  initialCohortTestResults 
} from '../data/mockData';
import { liveSessionsService } from '../services/liveSessionsService';
import ScheduleLiveSessionDrawer from '../components/ScheduleLiveSessionDrawer';

export default function FacultyDashboardPage() {
  const navigate = useNavigate();

  // Sidebar Tab state: 'overview' | 'upload' | 'live' | 'tests' | 'students' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Content Upload Cascading Selector state
  const [selectedCourse, setSelectedCourse] = useState('neet-pg');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [selectedDay, setSelectedDay] = useState('3');

  // Uploaded state per day feedback
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // PDF form state
  const [pdfTitle, setPdfTitle] = useState('Clinical ECG Mastery: Arrhythmias & AV Blocks');
  const [pdfFile, setPdfFile] = useState('ECG_Mastery_Arrhythmias_2026.pdf');

  // Images form state
  const [imageCaption, setImageCaption] = useState('Fig: Monomorphic VT with AV Dissociation & Extreme Right Axis');

  // Video form state
  const [videoTitle, setVideoTitle] = useState('Wide Complex Tachycardias: Brugada vs Vereckei Criteria');
  const [videoLink, setVideoLink] = useState('https://vimeo.com/medpreppro/cardio-day03-wct');

  // Flashcards repeatable form state
  const [flashcardList, setFlashcardList] = useState([
    { question: 'Hallmark of AV dissociation in VT?', answer: 'Independent sinus P waves marching across wide QRS complexes with capture & fusion beats.' },
    { question: 'Class III antiarrhythmic mechanism of action?', answer: 'Blocks outward K+ channels, prolonging action potential duration & QT interval.' }
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Live Session form state
  const [liveSessionsList, setLiveSessionsList] = useState(() => liveSessionsService.getAllSessions());

  React.useEffect(() => {
    const unsub = liveSessionsService.subscribe((updated) => setLiveSessionsList([...updated]));
    return () => unsub();
  }, []);
  const [isLiveDrawerOpen, setIsLiveDrawerOpen] = useState(false);

  // Tests form & state (Phase 6 Reactive Store)
  const [testsList, setTestsList] = useState(() => testService.getTests());
  const [testCourse, setTestCourse] = useState('NEET PG & NExT 2026');
  const [testName, setTestName] = useState('Cardiology Mock Test 1');
  const [testBatchTier, setTestBatchTier] = useState('All Students of this Course');
  const [testDate, setTestDate] = useState('2026-09-18');
  const [testTime, setTestTime] = useState('18:00');
  const [testDuration, setTestDuration] = useState('45 mins');
  const [testTotalMarks, setTestTotalMarks] = useState('100');
  const [testQuestionCount, setTestQuestionCount] = useState('20');

  // Cohort Results Modal State
  const [activeResultsModalTest, setActiveResultsModalTest] = useState(null);
  const [cohortResultsData, setCohortResultsData] = useState(null);

  // Sync test store across browser sessions and tabs
  React.useEffect(() => {
    const handleSync = () => {
      setTestsList(testService.getTests());
      if (activeResultsModalTest) {
        setCohortResultsData(testService.getCohortResults(activeResultsModalTest.id));
      }
    };
    window.addEventListener('medprep-tests-updated', handleSync);
    window.addEventListener('medprep-results-updated', handleSync);
    return () => {
      window.removeEventListener('medprep-tests-updated', handleSync);
      window.removeEventListener('medprep-results-updated', handleSync);
    };
  }, [activeResultsModalTest]);

  // Students Search state
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const triggerUploadSuccess = (msg) => {
    setUploadSuccessMessage(msg);
    setTimeout(() => setUploadSuccessMessage(''), 3000);
  };

  const handleAddFlashcard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFlashcardList([...flashcardList, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion('');
    setNewAnswer('');
    triggerUploadSuccess('New flashcard added to deck!');
  };

  const handleRemoveFlashcard = (index) => {
    setFlashcardList(flashcardList.filter((_, i) => i !== index));
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    const newTest = {
      id: `test-${Date.now()}`,
      name: testName,
      courseId: testCourse.toLowerCase().includes('neet') ? 'neet-pg' : testCourse.toLowerCase().includes('usmle') ? 'usmle' : 'plab',
      course: testCourse,
      batch: testBatchTier,
      date: testDate,
      time: `${testTime} IST`,
      duration: testDuration,
      durationSeconds: testDuration.includes('210') ? 12600 : testDuration.includes('60') || testDuration.includes('1 hr') ? 3600 : 2700,
      totalMarks: parseInt(testTotalMarks, 10) || 100,
      questionsCount: parseInt(testQuestionCount, 10) || 20,
      status: 'Upcoming',
      badge: 'Newly Scheduled',
      pattern: 'NExT/USMLE Clinical Simulation',
      startsIn: `Starts on ${testDate}`,
      instructions: [
        `Examination: ${testName}`,
        `Candidate Batch: ${testBatchTier}`,
        `Total marks: ${testTotalMarks} Marks (${testQuestionCount} clinical questions).`,
        'Marking Scheme: +5 marks per correct response, -1 mark negative marking for incorrect choices.',
        'Proctored countdown clock enforces automatic submission upon timer expiration.'
      ]
    };

    testService.saveTest(newTest);
    triggerUploadSuccess(`Assessment "${testName}" scheduled successfully for ${testBatchTier}!`);
  };

  const handleOpenResults = (testObj) => {
    const results = testService.getCohortResults(testObj.id);
    setActiveResultsModalTest(testObj);
    setCohortResultsData(results);
  };

  const handleCancelTest = (testId, name) => {
    const updated = testsList.filter((t) => t.id !== testId);
    testService.saveTest(updated);
    setTestsList(updated);
    triggerUploadSuccess(`Test "${name}" was cancelled.`);
  };

  const filteredStudents = facultyStudentDirectory.filter((s) => 
    s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    s.packageTier.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <FacultyNavbar 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-grow flex">
        
        {/* Left Sidebar */}
        <FacultySidebar 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Workspace Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-10">
          
          {/* Notification Toast */}
          <ScheduleLiveSessionDrawer
            open={isLiveDrawerOpen}
            onClose={() => setIsLiveDrawerOpen(false)}
            onScheduled={(created) => triggerUploadSuccess(`Live session "${created.topic}" scheduled successfully!`)}
          />

          {uploadSuccessMessage && (
            <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4">
              <CheckCircle2 className="w-5 h-5" />
              <span>{uploadSuccessMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. Faculty Dashboard Overview (Landing Page)                              */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Welcome Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Faculty Management Console</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Welcome, {facultyProfileData.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                    {facultyProfileData.institution}. Manage clinical lecture notes, multi-image ECG strips, flashcards, and live grand rounds.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0 self-start lg:self-auto"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Daily Content</span>
                </button>
              </div>

              {/* 4 Summary Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Assigned Courses
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {facultySummaryMetrics.coursesAssigned}
                  </div>
                  <p className="text-xs text-indigo-600 font-medium">
                    NEET PG & USMLE Cardio
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Students Enrolled
                  </span>
                  <div className="text-2xl font-black text-emerald-600">
                    {facultySummaryMetrics.studentsEnrolled.toLocaleString()}+
                  </div>
                  <p className="text-xs text-slate-500">
                    Active across 4 cohorts
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Units Uploaded This Week
                  </span>
                  <div className="text-2xl font-black text-brand-600">
                    {facultySummaryMetrics.contentUploadedThisWeek} Units
                  </div>
                  <p className="text-xs text-slate-500">
                    Week 1 Curriculum 100% Ready
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Upcoming Live Sessions
                  </span>
                  <div className="text-2xl font-black text-rose-600">
                    {facultySummaryMetrics.upcomingLiveSessions} Scheduled
                  </div>
                  <p className="text-xs text-rose-500 font-medium">
                    Tonight @ 8:00 PM IST
                  </p>
                </div>

              </div>

              {/* Recent Activity Log & Quick Action Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Activity Log */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Recent Supply-Side Activity</span>
                    </h3>
                    <span className="text-xs text-slate-400">Live Audit Log</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {facultyRecentActivity.map((act) => (
                      <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{act.action}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {act.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{act.target} • <span className="text-slate-400">{act.course}</span></p>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0 font-medium">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supply Side USP Card */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white rounded-3xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Demo Presentation Note
                    </span>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">
                      Connecting the Supply Side to the Student Experience
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Every material uploaded here is instantly organized by <strong>Course → Week → Day</strong>. 
                      If faculty assigns only a PDF and Video for Day 2, the other 3 tabs on the student side are automatically disabled.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-indigo-100">
                    <Link
                      to="/day/3"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Preview Day 3 as Student</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. Content Upload Section (MAIN SECTION)                                  */}
          {/* ========================================================================= */}
          {activeTab === 'upload' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Header */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Content Management Pipeline
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    Upload & Assign Daily Curriculum
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Select the target exam, week, and day to assign or update study materials.
                  </p>
                </div>

                {/* Cascading Dropdowns: Course -> Week -> Day */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                  
                  {/* 1. Select Course */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      1. Select Course Track
                    </label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    >
                      <option value="neet-pg">🇮🇳 NEET PG & NExT 2026</option>
                      <option value="usmle">🇺🇸 USMLE Step 1 & 2 CK</option>
                      <option value="plab">🇬🇧 PLAB 1 & 2 / UKMLA</option>
                      <option value="europe">🇪🇺 Europe Medical Licensing</option>
                    </select>
                  </div>

                  {/* 2. Select Week */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      2. Select Curriculum Week
                    </label>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    >
                      <option value="1">Week 1: Cardiology & Hemodynamics</option>
                      <option value="2">Week 2: Respiratory & Pulmonology</option>
                      <option value="3">Week 3: Renal & Acid-Base Balance</option>
                      <option value="4">Week 4: Gastroenterology & Liver</option>
                    </select>
                  </div>

                  {/* 3. Select Day */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      3. Select Target Day
                    </label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    >
                      <option value="1">Day 1 — Valvular Heart Diseases & Murmurs</option>
                      <option value="2">Day 2 — Heart Failure & Pharmacotherapy</option>
                      <option value="3">Day 3 — Cardiac Arrhythmias & ECG</option>
                      <option value="4">Day 4 — Acute Coronary Syndromes</option>
                      <option value="5">Day 5 — Congenital Heart Defects</option>
                      <option value="6">Day 6 — Active Recall Flashcards Sprint</option>
                      <option value="7">Day 7 — Subject Grand Mock Test</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Active Day Content Summary Card */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Editing Day {selectedDay}: Clinical Arrhythmias & ECG Interpretation
                    </h4>
                    <p className="text-xs text-slate-500">
                      Currently Assigned: 📄 PDF Notes, 🖼️ 3 Images, 🎥 1 Video, 🗂️ 4 Flashcards, 🔴 Live Session Scheduled
                    </p>
                  </div>
                </div>

                <Link
                  to={`/day/${selectedDay}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                >
                  <span>Verify on Student View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Content Types Upload Workspaces */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. PDF Notes Uploader */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600" />
                      <h3 className="text-sm font-bold text-slate-900">Upload PDF Study Notes</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Active</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Document Title</label>
                    <input
                      type="text"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Drag-and-drop placeholder box */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50/60 cursor-pointer transition-colors">
                    <UploadCloud className="w-8 h-8 text-indigo-600 mx-auto" />
                    <p className="text-xs text-slate-800 font-semibold">{pdfFile}</p>
                    <p className="text-[11px] text-slate-500">Click or drag & drop updated PDF here (max 50 MB)</p>
                  </div>

                  <button
                    onClick={() => triggerUploadSuccess(`PDF "${pdfTitle}" uploaded and assigned to Day ${selectedDay}!`)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Save & Publish PDF Notes
                  </button>
                </div>

                {/* 2. Images & Diagrams Uploader */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900">Upload Clinical Diagrams & ECG Strips</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">3 Active</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Image Caption / Clinical Descriptor</label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50/60 cursor-pointer transition-colors">
                    <ImageIcon className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs text-slate-800 font-semibold">Drop 12-lead ECG strips, Wiggers diagrams, or pathology slides</p>
                    <p className="text-[11px] text-slate-500">PNG, JPG, DICOM supported</p>
                  </div>

                  <button
                    onClick={() => triggerUploadSuccess(`New clinical image uploaded for Day ${selectedDay}!`)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Save Clinical Diagram
                  </button>
                </div>

                {/* 3. Video Lecture Uploader */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-purple-600" />
                      <h3 className="text-sm font-bold text-slate-900">Video Lecture Management</h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">28:40 mins</span>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Lecture Title</label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Streaming URL or Video Cloud ID</label>
                    <input
                      type="text"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => triggerUploadSuccess(`Video lecture updated for Day ${selectedDay}!`)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Update Video Lesson
                  </button>
                </div>

                {/* 4. Flashcards Repeatable Builder */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900">Active Recall Flashcard Deck</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {flashcardList.length} Cards in Deck
                    </span>
                  </div>

                  {/* Existing cards mini-list */}
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {flashcardList.map((fc, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-indigo-700">Q: {fc.question}</span>
                          <p className="text-slate-600 text-[11px]">A: {fc.answer}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFlashcard(i)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Repeatable form to add new card */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Add Card to Day {selectedDay}</span>
                    <input
                      type="text"
                      placeholder="Question prompt..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Clinical answer..."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddFlashcard}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-indigo-700 font-bold text-xs rounded-lg border border-slate-200 flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Another Flashcard</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. Schedule Live Session Section                                          */}
          {/* ========================================================================= */}
          {activeTab === 'live' && (
            <div className="space-y-8 animate-in fade-in">
              
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Interactive Grand Rounds
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    Schedule a Live Faculty Session
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Host clinical case presentations, diagnostic drills, and live doubts for enrolled cohorts.
                  </p>
                </div>
                <button
                  onClick={() => setIsLiveDrawerOpen(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/25 transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule New Live Session</span>
                </button>
              </div>

              {/* Scheduled Sessions Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">All Scheduled Faculty Sessions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60">
                        <th className="py-3 px-4">Topic</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {liveSessionsList.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{s.title}</td>
                          <td className="py-3.5 px-4 text-slate-600">{s.date} • {s.time}</td>
                          <td className="py-3.5 px-4 text-slate-500">75 mins</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => triggerUploadSuccess(`Session link copied to clipboard!`)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                            >
                              Copy Link
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. Manage Tests Section (Phase 6 Detailed Scheduling & Results)           */}
          {/* ========================================================================= */}
          {activeTab === 'tests' && (
            <div className="space-y-8 animate-in fade-in">
              
              {/* Test Creation Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Faculty Assessment Scheduler</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Create & Schedule Examination
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Configure timed assessments tied to specific courses and student package tiers. Scheduled tests immediately reflect on enrolled candidate dashboards.
                  </p>
                </div>

                <form onSubmit={handleCreateTest} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  
                  {/* Course Track */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Select Course Track</label>
                    <select
                      value={testCourse}
                      onChange={(e) => setTestCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    >
                      <option value="NEET PG & NExT 2026">NEET PG & NExT 2026</option>
                      <option value="USMLE Step 1 & 2 CK">USMLE Step 1 & 2 CK</option>
                      <option value="PLAB 1 & 2 / UKMLA">PLAB 1 & 2 / UKMLA</option>
                      <option value="Europe Medical Licensing">Europe Medical Licensing</option>
                    </select>
                  </div>

                  {/* Test Title */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Test Name / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology Mock Test 1"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                      required
                    />
                  </div>

                  {/* Batch / Tier */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Applicable Batch / Tier</label>
                    <select
                      value={testBatchTier}
                      onChange={(e) => setTestBatchTier(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    >
                      <option value="All Students of this Course">All Students of this Course</option>
                      <option value="All Premium Students">All Premium Students</option>
                      <option value="Standard & Premium Students Only">Standard & Premium Students Only</option>
                    </select>
                  </div>

                  {/* Exam Date */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Test Date</label>
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Test Start Time</label>
                    <input
                      type="time"
                      value={testTime}
                      onChange={(e) => setTestTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Duration Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Duration</label>
                    <select
                      value={testDuration}
                      onChange={(e) => setTestDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    >
                      <option value="30 mins">30 mins</option>
                      <option value="45 mins">45 mins</option>
                      <option value="60 mins (1 hr)">60 mins (1 hr)</option>
                      <option value="90 mins (1.5 hr)">90 mins (1.5 hr)</option>
                      <option value="120 mins (2 hr)">120 mins (2 hr)</option>
                      <option value="210 mins (3.5 hr)">210 mins (3.5 hr)</option>
                    </select>
                  </div>

                  {/* Total Marks */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Total Marks</label>
                    <input
                      type="number"
                      value={testTotalMarks}
                      onChange={(e) => setTestTotalMarks(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Number of Questions</label>
                      <span className="text-[10px] text-indigo-600 font-semibold">Linked to Q-Bank</span>
                    </div>
                    <input
                      type="number"
                      value={testQuestionCount}
                      onChange={(e) => setTestQuestionCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
                    />
                  </div>

                  {/* Notice & Submit Action */}
                  <div className="sm:col-span-3 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-500">
                      ℹ️ Questions automatically linked via Question Bank module (vignettes with NExT/USMLE clinical format).
                    </p>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Schedule & Release Test</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Scheduled Tests Table */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Scheduled Assessments Roster</h3>
                    <p className="text-xs text-slate-500">Overview of upcoming, live, and completed examination series.</p>
                  </div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 font-mono font-bold">
                    {testsList.length} Total Tests
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/60">
                        <th className="py-3 px-4">Test Name</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Batch</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {testsList.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{t.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{t.questionsCount || t.questions || 20} Questions • {t.totalMarks || 100} Marks</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">{t.course || 'NEET PG & NExT'}</td>
                          <td className="py-3.5 px-4 text-slate-500">{t.batch || 'All Students'}</td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <div>{t.date}</div>
                            <div className="text-[10px] text-slate-400">{t.time || '18:00 IST'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{t.duration}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                              t.status === 'Live'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                                : t.status === 'Completed'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenResults(t)}
                                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors shadow-xs"
                              >
                                View Results
                              </button>
                              <button
                                onClick={() => triggerUploadSuccess(`Test config editor opened for "${t.name}"`)}
                                className="text-[11px] text-slate-500 hover:text-slate-900 px-2 py-1"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCancelTest(t.id, t.name)}
                                className="text-[11px] text-rose-600 hover:text-rose-700 px-2 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ============================================================= */}
              {/* DRAWER: Cohort Test Results View (Part A.3)                   */}
              {/* ============================================================= */}
              {activeResultsModalTest && cohortResultsData && (
                <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
                    onClick={() => setActiveResultsModalTest(null)}
                  />

                  <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                    <div className="w-screen max-w-3xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
                      
                      {/* Drawer Sticky Header */}
                      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <span>Cohort Examination Performance Report</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900">
                            {activeResultsModalTest.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Track: {activeResultsModalTest.course || 'NEET PG'} • Target Batch: {activeResultsModalTest.batch || 'All Students'}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveResultsModalTest(null)}
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Scrollable Body */}
                      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                        {/* Top Summary Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                            <div className="text-[11px] text-slate-500 font-medium">Average Score</div>
                            <div className="text-xl font-black text-slate-900 mt-1">
                              {cohortResultsData.summary.averageScore}
                            </div>
                            <div className="text-[10px] text-slate-400">Cohort Mean</div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                            <div className="text-[11px] text-slate-500 font-medium">Highest Score</div>
                            <div className="text-xl font-black text-emerald-600 mt-1">
                              {cohortResultsData.summary.highestScore}
                            </div>
                            <div className="text-[10px] text-slate-400">Top Candidate</div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                            <div className="text-[11px] text-slate-500 font-medium">Candidates Attempted</div>
                            <div className="text-xl font-black text-indigo-600 mt-1">
                              {cohortResultsData.summary.attemptedCount} / {cohortResultsData.summary.totalEligible || 450}
                            </div>
                            <div className="text-[10px] text-slate-400">Submissions</div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                            <div className="text-[11px] text-slate-500 font-medium">Cohort Pass Rate</div>
                            <div className="text-xl font-black text-amber-600 mt-1">
                              {cohortResultsData.summary.passRate}
                            </div>
                            <div className="text-[10px] text-slate-400">Threshold: ≥50%</div>
                          </div>
                        </div>

                        {/* Candidate Submissions Table */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Candidate Attempts & Diagnostic Scores
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              {cohortResultsData.students?.length || 0} Submissions Recorded
                            </span>
                          </div>

                          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                  <th className="py-3 px-4">Student Name</th>
                                  <th className="py-3 px-4">Score</th>
                                  <th className="py-3 px-4">Percentage</th>
                                  <th className="py-3 px-4">Time Taken</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4 text-right">Submitted At</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {cohortResultsData.students?.map((s) => {
                                  const isRitik = s.name === 'Dr. Ritik Saini';
                                  return (
                                    <tr 
                                      key={s.id} 
                                      className={`hover:bg-slate-50 transition-colors ${
                                        isRitik ? 'bg-indigo-50/50 border-l-4 border-indigo-600' : ''
                                      }`}
                                    >
                                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                                        <img 
                                          src={s.avatar} 
                                          alt={s.name} 
                                          className="w-7 h-7 rounded-full object-cover border border-slate-200" 
                                        />
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span>{s.name}</span>
                                            {isRitik && (
                                              <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded">
                                                Current Candidate
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-normal">{s.course}</div>
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.score}</td>
                                      <td className="py-3.5 px-4 font-bold text-indigo-600">{s.percentage}</td>
                                      <td className="py-3.5 px-4 text-slate-500">{s.timeTaken}</td>
                                      <td className="py-3.5 px-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          s.status === 'Pass' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}>
                                          {s.status}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                                        {s.submittedAt}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Sticky Footer */}
                      <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-between sticky bottom-0 z-10">
                        <button
                          onClick={() => triggerUploadSuccess('Grade sheet exported in CSV format')}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Export Cohort CSV</span>
                        </button>

                        <button
                          onClick={() => setActiveResultsModalTest(null)}
                          className="px-6 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Close Window
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. My Students Section                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-in fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Enrolled Students Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review candidate milestones, active recall accuracy, and study progress.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search candidate name or track..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <th className="py-3.5 px-4">Student Name</th>
                        <th className="py-3.5 px-4">Enrolled Course</th>
                        <th className="py-3.5 px-4">Package Tier</th>
                        <th className="py-3.5 px-4">Progress %</th>
                        <th className="py-3.5 px-4">Accuracy</th>
                        <th className="py-3.5 px-4">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover border border-indigo-200" />
                              <div>
                                <span className="font-bold text-slate-900 block">{st.name}</span>
                                <span className="text-[10px] text-slate-400">{st.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">{st.course}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {st.packageTier}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${st.progress}%` }} />
                              </div>
                              <span className="font-bold text-emerald-600">{st.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">{st.qbankAccuracy}</td>
                          <td className="py-3.5 px-4 text-slate-500">{st.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. Reports & Analytics                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Cohort Intelligence</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Curriculum Performance Analytics</h2>
                  <p className="text-xs text-slate-500">Aggregated student completion metrics across all 19 medical subjects.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500">Average Grand Test Score</span>
                    <div className="text-2xl font-black text-emerald-600">74.2%</div>
                    <span className="text-[11px] text-emerald-600 font-medium">↑ 4.2% from previous batch</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500">Daily Flashcard Recall Rate</span>
                    <div className="text-2xl font-black text-brand-600">88.6%</div>
                    <span className="text-[11px] text-slate-500">Avg review interval: 4.2 days</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500">Live Grand Round Attendance</span>
                    <div className="text-2xl font-black text-purple-600">91.4%</div>
                    <span className="text-[11px] text-purple-600 font-medium">Over 340 doctors per clinic</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
