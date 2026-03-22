import { useEffect, useMemo, useState, type ChangeEvent, type KeyboardEvent } from "react";
import {
  Menu, X, Home, LayoutDashboard, Upload, MessageSquare,
  FileText, BookOpenCheck, Save, Settings, Search, Bell, UserCircle2,
  Sparkles, Brain, BadgeHelp, Send, Trash2, ChevronRight, Clock3, Plus,
} from "lucide-react";
import logo from "@/assets/logo.png";
import StatCard from "@/components/StatCard";
import FeatureCard from "@/components/FeatureCard";
import SmallToolCard from "@/components/SmallToolCard";
import QuizCard from "@/components/QuizCard";
import AppToast from "@/components/AppToast";

const starterMessage = {
  id: 1,
  type: "ai" as const,
  text: "Hi, I'm StudySprout 🌱 Ask me anything from your notes and I'll explain it in a simple way.",
};

const quizData = [
  { id: 1, question: "Which normal form removes partial dependency?", answer: "2NF" },
  { id: 2, question: "Which scheduling algorithm gives minimum average waiting time?", answer: "SJF" },
  { id: 3, question: "Which data structure is used in BFS?", answer: "Queue" },
];

const recentSessions = [
  { id: 1, subject: "DBMS", topic: "Normalization", time: "Today, 10:20 AM" },
  { id: 2, subject: "Operating Systems", topic: "CPU Scheduling", time: "Yesterday, 7:45 PM" },
  { id: 3, subject: "DAA", topic: "Greedy Algorithms", time: "Yesterday, 4:10 PM" },
];

type Page = "home" | "dashboard" | "upload" | "chat" | "summaries" | "quiz" | "saved" | "settings";
type ToastData = { type: "success" | "error"; text: string } | null;
interface ChatMessage { id: number; type: "ai" | "user"; text: string; }
interface SavedChat { id: number; title: string; question: string; answer: string; time: string; }
interface SummaryData { shortSummary: string; keyPoints: string[]; examTip: string; }
interface AppSettings { username: string; examMode: boolean; compactMode: boolean; }

const defaultSummary: SummaryData = {
  shortSummary: "Your generated summary will appear here.",
  keyPoints: [],
  examTip: "Use this section for quick revision before exams.",
};

const defaultSettings: AppSettings = { username: "Sahithi", examMode: true, compactMode: false };

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
}

const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Home", icon: <Home size={18} /> },
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "upload", label: "Upload Notes", icon: <Upload size={18} /> },
  { key: "chat", label: "Ask AI", icon: <MessageSquare size={18} /> },
  { key: "summaries", label: "Summaries", icon: <FileText size={18} /> },
  { key: "quiz", label: "Quiz", icon: <BookOpenCheck size={18} /> },
  { key: "saved", label: "Saved Chats", icon: <Save size={18} /> },
  { key: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function Index() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadName, setUploadName] = useState(() => localStorage.getItem("studysprout-upload") || "");
  const [notes, setNotes] = useState(() => localStorage.getItem("studysprout-notes") || "");
  const [question, setQuestion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadJSON("studysprout-chats", [starterMessage]));
  const [savedChats, setSavedChats] = useState<SavedChat[]>(() => loadJSON("studysprout-saved", []));
  const [summaryData, setSummaryData] = useState<SummaryData>(() => loadJSON("studysprout-summary", defaultSummary));
  const [settings, setSettings] = useState<AppSettings>(() => loadJSON("studysprout-settings", defaultSettings));
  const [toast, setToast] = useState<ToastData>(null);

  useEffect(() => { localStorage.setItem("studysprout-upload", uploadName); }, [uploadName]);
  useEffect(() => { localStorage.setItem("studysprout-notes", notes); }, [notes]);
  useEffect(() => { localStorage.setItem("studysprout-chats", JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem("studysprout-saved", JSON.stringify(savedChats)); }, [savedChats]);
  useEffect(() => { localStorage.setItem("studysprout-summary", JSON.stringify(summaryData)); }, [summaryData]);
  useEffect(() => { localStorage.setItem("studysprout-settings", JSON.stringify(settings)); }, [settings]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toast]);

  const showToast = (type: "success" | "error", text: string) => setToast({ type, text });

  const stats = useMemo(() => ({
    uploadedNotes: uploadName ? 1 : 0,
    chatCount: chatMessages.filter((m) => m.type === "user").length,
    savedCount: savedChats.length,
    summaryCount: summaryData.keyPoints.length,
  }), [uploadName, chatMessages, savedChats, summaryData]);

  const filteredSavedChats = savedChats.filter((item) => {
    const q = searchTerm.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.question.toLowerCase().includes(q);
  });

  const goToPage = (page: Page) => { setActivePage(page); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadName(file.name);
    showToast("success", "File selected successfully");
  };

  const generateSummary = () => {
    if (!notes.trim()) { showToast("error", "Please paste notes first"); return; }
    const cleaned = notes.replace(/\s+/g, " ").trim();
    const sentences = cleaned.split(/[.?!]/).map((s) => s.trim()).filter(Boolean);
    const words = cleaned.split(" ").filter(Boolean);
    const points: string[] = [];
    for (let i = 0; i < Math.min(words.length, 30); i += 6) {
      const line = words.slice(i, i + 6).join(" ");
      if (line) points.push(line);
      if (points.length === 4) break;
    }
    setSummaryData({
      shortSummary: sentences.slice(0, 2).join(". ") + (sentences.length ? "." : ""),
      keyPoints: points.length ? points : ["Important point 1", "Important point 2"],
      examTip: settings.examMode
        ? "In exams, first define the concept, then write key points, then add one example."
        : "Revise the key ideas slowly and focus on understanding.",
    });
    showToast("success", "Summary generated");
    goToPage("summaries");
  };

  const handleAskAI = () => {
    if (!question.trim()) { showToast("error", "Please type a question"); return; }
    const userMsg: ChatMessage = { id: Date.now(), type: "user", text: question };
    const lower = question.toLowerCase();
    let answer = "I'm currently using demo AI logic. You can later connect OpenAI or Gemini API to make this fully real.";
    if (lower.includes("summary") || lower.includes("summarize")) answer = "Summary:\n• Main points are simplified\n• Important concepts are easier to revise\n• Useful for quick exam preparation";
    else if (lower.includes("mcq")) answer = "MCQ Practice:\n1. Identify the correct definition\n2. Choose the right example\n3. Match the correct feature";
    else if (lower.includes("viva") || lower.includes("question")) answer = "Important Questions:\n1. Define the topic\n2. Write its main features\n3. Explain with one example\n4. State one advantage";
    else if (lower.includes("normalization")) answer = "Normalization is the process of organizing database tables to reduce redundancy and improve consistency.";
    else if (lower.includes("cpu scheduling")) answer = "CPU scheduling decides which process gets CPU time first. Common algorithms are FCFS, SJF, Priority, and Round Robin.";
    else if (notes.trim()) answer = "Your notes are available in the app, so this interface is ready for real AI integration using those notes as context.";
    const aiMsg: ChatMessage = { id: Date.now() + 1, type: "ai", text: answer };
    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setQuestion("");
    showToast("success", "Answer generated");
  };

  const saveLastChat = () => {
    const lastUser = [...chatMessages].reverse().find((m) => m.type === "user");
    const lastAI = [...chatMessages].reverse().find((m) => m.type === "ai");
    if (!lastUser || !lastAI) { showToast("error", "No chat available to save"); return; }
    setSavedChats((prev) => [{ id: Date.now(), title: lastUser.text.slice(0, 42) || "Saved Chat", question: lastUser.text, answer: lastAI.text, time: new Date().toLocaleString() }, ...prev]);
    showToast("success", "Chat saved");
  };

  const deleteSaved = (id: number) => { setSavedChats((prev) => prev.filter((item) => item.id !== id)); showToast("success", "Saved chat deleted"); };
  const clearChat = () => { setChatMessages([starterMessage]); showToast("success", "Chat cleared"); };
  const clearAllData = () => {
    setUploadName(""); setNotes(""); setQuestion(""); setChatMessages([starterMessage]); setSavedChats([]);
    setSummaryData(defaultSummary); showToast("success", "All app data cleared");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col justify-between border-r border-sidebar-border bg-sidebar p-4 transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <img src={logo} alt="StudySprout" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <h1 className="text-base font-bold text-sidebar-foreground leading-tight">StudySprout</h1>
              <p className="text-xs text-muted-foreground">Learn Smart · Grow Fast</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => goToPage(item.key)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activePage === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="rounded-xl bg-accent p-4 mt-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sparkles size={16} />
            <h4 className="text-sm font-semibold">Daily Tip</h4>
          </div>
          <p className="text-xs text-muted-foreground">Revise one small topic daily to reduce exam stress.</p>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenuOpen && <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted shrink-0" onClick={() => setMobileMenuOpen((p) => !p)}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm flex-1 max-w-xs sm:max-w-sm">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-foreground placeholder:text-muted-foreground w-full min-w-0" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 ml-2 shrink-0">
            <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 sm:px-3">
              <UserCircle2 size={20} className="text-primary" />
              <span className="text-sm font-medium text-foreground hidden sm:inline">{settings.username}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8 max-w-6xl mx-auto w-full pb-20 lg:pb-8">
          {/* HOME */}
          {activePage === "home" && (
            <section className="fade-in space-y-6 sm:space-y-8">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div className="flex-1 rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-secondary p-5 sm:p-8 lg:p-10">
                  <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary mb-3 sm:mb-4">AI study assistant for students</span>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground mb-2 sm:mb-3">
                    Make studying easier with <span className="text-primary">StudySprout</span>
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-lg">
                    Upload notes, ask doubts, generate summaries, practice quiz questions, and save useful answers in one clean workspace.
                  </p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button onClick={() => goToPage("upload")} className="flex items-center gap-2 rounded-lg bg-primary px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                      <Plus size={16} /> Start with Notes
                    </button>
                    <button onClick={() => goToPage("chat")} className="rounded-lg border border-border bg-card px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                      Ask AI
                    </button>
                  </div>
                </div>
                <div className="hover-rise lg:w-72 rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent flex items-center justify-center text-primary">
                    <Brain size={24} />
                  </div>
                  <h3 className="font-bold text-foreground">Clear purpose</h3>
                  <p className="text-sm text-muted-foreground">
                    Helps students revise faster, understand concepts, and prepare better for exams.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <FeatureCard title="Upload Notes" icon={<Upload size={22} />} desc="Add notes and organize your study material." />
                <FeatureCard title="Ask AI" icon={<MessageSquare size={22} />} desc="Get simple student-friendly explanations." />
                <FeatureCard title="Generate Summaries" icon={<FileText size={22} />} desc="Turn long notes into quick revision points." />
                <FeatureCard title="Save Useful Chats" icon={<Save size={22} />} desc="Store answers that help in exam revision." />
              </div>
            </section>
          )}

          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <section className="fade-in space-y-6 sm:space-y-8">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <div className="flex-1 rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-secondary p-5 sm:p-8">
                  <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary mb-3">Your study dashboard</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-2">Welcome back, <span className="text-primary">{settings.username}</span></h2>
                  <p className="text-sm sm:text-base text-muted-foreground">Keep everything in one place and build a clean study routine.</p>
                </div>
                <div className="lg:w-64 rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <h4 className="font-bold text-foreground mb-2">Today's Focus</h4>
                  <p className="text-sm text-muted-foreground">Revise one topic, ask 3 doubts, and save 1 useful answer.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatCard title="Uploaded Notes" value={stats.uploadedNotes} />
                <StatCard title="AI Chats" value={stats.chatCount} />
                <StatCard title="Saved Chats" value={stats.savedCount} />
                <StatCard title="Summary Points" value={stats.summaryCount} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                  <h3 className="font-bold text-foreground mb-1">Recent Study Sessions</h3>
                  <p className="text-xs text-muted-foreground mb-4">Continue where you left off</p>
                  <div className="space-y-3">
                    {recentSessions.map((item) => (
                      <div key={item.id} className="hover-rise flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{item.subject}</span>
                          <h4 className="text-sm font-semibold text-foreground mt-1">{item.topic}</h4>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                  <h3 className="font-bold text-foreground mb-1">Smart Tools</h3>
                  <p className="text-xs text-muted-foreground mb-4">Quick actions for students</p>
                  <div className="space-y-3">
                    <SmallToolCard icon={<Sparkles size={20} />} title="Quick Revision" desc="Short exam-focused notes." />
                    <SmallToolCard icon={<Brain size={20} />} title="Explain Simply" desc="Easy understanding of tough topics." />
                    <SmallToolCard icon={<BadgeHelp size={20} />} title="Question Generator" desc="Viva and practice questions." />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* UPLOAD */}
          {activePage === "upload" && (
            <section className="fade-in space-y-4 sm:space-y-6">
              <div><h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Upload Notes</h2><p className="text-sm text-muted-foreground mt-1">Add a file name and paste notes to prepare better.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                  <h3 className="font-bold text-foreground mb-4">Choose File</h3>
                  <label className="hover-rise flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/50 p-6 sm:p-10 cursor-pointer hover:border-primary transition-colors">
                    <Upload size={28} className="text-primary" />
                    <h4 className="font-semibold text-foreground">Click to upload notes</h4>
                    <p className="text-xs text-muted-foreground text-center">PDF/DOC handling can be connected later with backend support.</p>
                    <input type="file" onChange={handleFileChange} hidden />
                  </label>
                  {uploadName && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
                      <span className="text-primary">✓</span> {uploadName}
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                  <h3 className="font-bold text-foreground mb-4">Paste Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Paste your notes here..."
                    className="w-full h-48 rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                    <button onClick={generateSummary} className="rounded-lg bg-primary px-4 sm:px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity w-full sm:w-auto text-center">Generate Summary</button>
                    <button onClick={() => goToPage("chat")} className="rounded-lg border border-border bg-card px-4 sm:px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors w-full sm:w-auto text-center">Go to Ask AI</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CHAT */}
          {activePage === "chat" && (
            <section className="fade-in space-y-4 sm:space-y-6">
              <div><h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Ask AI</h2><p className="text-sm text-muted-foreground mt-1">Ask doubts from your notes and get simple responses.</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 rounded-xl border border-border bg-card flex flex-col" style={{ minHeight: 320 }}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm whitespace-pre-wrap ${
                          msg.type === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border p-2 sm:p-3 flex gap-2">
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleAskAI()}
                      placeholder="Ask a question..."
                      className="flex-1 rounded-lg border border-border bg-muted/30 px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring min-w-0"
                    />
                    <button onClick={handleAskAI} className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-bold text-foreground mb-3">Quick Prompts</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Summarize my notes into quick revision points", "Generate important viva questions", "Create MCQs from this topic", "Explain this topic in very simple words"].map((p) => (
                        <button key={p} onClick={() => setQuestion(p)} className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
                          {p.length > 25 ? p.slice(0, 22) + "…" : p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-bold text-foreground mb-1">Chat Actions</h3>
                    <p className="text-xs text-muted-foreground mb-3">Save or clear your current study conversation.</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={saveLastChat} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">Save Last Chat</button>
                      <button onClick={clearChat} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors">Clear Chat</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SUMMARIES */}
          {activePage === "summaries" && (
            <section className="fade-in space-y-6">
              <div><h2 className="text-2xl font-extrabold text-foreground">Summaries</h2><p className="text-muted-foreground mt-1">Use short summaries and quick points for revision.</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="hover-rise rounded-xl border border-border bg-card p-6">
                  <h3 className="font-bold text-foreground mb-3">Short Summary</h3>
                  <p className="text-sm text-muted-foreground">{summaryData.shortSummary}</p>
                </div>
                <div className="hover-rise rounded-xl border border-border bg-card p-6">
                  <h3 className="font-bold text-foreground mb-3">Key Points</h3>
                  {summaryData.keyPoints.length ? (
                    <ul className="space-y-2">{summaryData.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{point}</li>
                    ))}</ul>
                  ) : <p className="text-sm text-muted-foreground">No key points yet.</p>}
                </div>
                <div className="hover-rise rounded-xl border border-border bg-card p-6">
                  <h3 className="font-bold text-foreground mb-3">Exam Tip</h3>
                  <p className="text-sm text-muted-foreground">{summaryData.examTip}</p>
                </div>
              </div>
            </section>
          )}

          {/* QUIZ */}
          {activePage === "quiz" && (
            <section className="fade-in space-y-6">
              <div><h2 className="text-2xl font-extrabold text-foreground">Quiz Practice</h2><p className="text-muted-foreground mt-1">Practice with simple interactive cards.</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizData.map((item) => <QuizCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          {/* SAVED */}
          {activePage === "saved" && (
            <section className="fade-in space-y-6">
              <div><h2 className="text-2xl font-extrabold text-foreground">Saved Chats</h2><p className="text-muted-foreground mt-1">Keep useful AI answers ready for revision.</p></div>
              {filteredSavedChats.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-10 text-center">
                  <Clock3 size={28} className="mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-bold text-foreground mb-1">No saved chats yet</h3>
                  <p className="text-sm text-muted-foreground">Save important answers from the Ask AI page.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSavedChats.map((item) => (
                    <div key={item.id} className="hover-rise rounded-xl border border-border bg-card p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div><h3 className="font-bold text-foreground">{item.title}</h3><p className="text-xs text-muted-foreground">{item.time}</p></div>
                        <button onClick={() => deleteSaved(item.id)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"><Trash2 size={15} /></button>
                      </div>
                      <p className="text-xs font-semibold text-primary mb-1">Question</p>
                      <p className="text-sm text-muted-foreground mb-3">{item.question}</p>
                      <p className="text-xs font-semibold text-primary mb-1">Answer</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SETTINGS */}
          {activePage === "settings" && (
            <section className="fade-in space-y-6">
              <div><h2 className="text-2xl font-extrabold text-foreground">Settings</h2><p className="text-muted-foreground mt-1">Customize your app experience.</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                  <h3 className="font-bold text-foreground">Profile Settings</h3>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                    <input value={settings.username} onChange={(e) => setSettings((p) => ({ ...p, username: e.target.value }))} placeholder="Enter your name" className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><h4 className="text-sm font-semibold text-foreground">Exam Mode</h4><p className="text-xs text-muted-foreground">Show more exam-oriented tips.</p></div>
                    <button onClick={() => setSettings((p) => ({ ...p, examMode: !p.examMode }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings.examMode ? "bg-primary" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${settings.examMode ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><h4 className="text-sm font-semibold text-foreground">Compact Mode</h4><p className="text-xs text-muted-foreground">Reduce visual spacing slightly.</p></div>
                    <button onClick={() => setSettings((p) => ({ ...p, compactMode: !p.compactMode }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings.compactMode ? "bg-primary" : "bg-muted"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${settings.compactMode ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  <button onClick={() => showToast("success", "Settings saved")} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">Save Settings</button>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-bold text-foreground mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">Clear local app data if you want to reset this demo app.</p>
                  <button onClick={clearAllData} className="rounded-lg bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition-opacity">Clear All Data</button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {toast && <AppToast type={toast.type} text={toast.text} />}
    </div>
  );
}
