import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Circle, Send, Calendar, Mail, ClipboardList } from "lucide-react";
import { format } from "date-fns";

// ─── Mock Data ───────────────────────────────────────────────
interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  done: boolean;
  project: string;
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Competitive analysis for Acme Corp", assignee: "Member User", deadline: "2026-03-15", done: false, project: "Acme Corp Due Diligence" },
  { id: "2", title: "Financial model review", assignee: "Member User", deadline: "2026-03-20", done: true, project: "Acme Corp Due Diligence" },
  { id: "3", title: "Market sizing report", assignee: "Member User", deadline: "2026-04-01", done: false, project: "TechStart Evaluation" },
];

const MEMBERS = ["Member User", "Analyst A", "Analyst B"];
const PROJECTS = ["Acme Corp Due Diligence", "TechStart Evaluation", "Series B Pipeline"];

interface ChatMsg { from: string; text: string; time: string; }

// ─── PM View ─────────────────────────────────────────────────
const PMView = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState(MEMBERS[0]);
  const [newDeadline, setNewDeadline] = useState("");
  const [newProject, setNewProject] = useState(PROJECTS[0]);

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks([...tasks, {
      id: Date.now().toString(),
      title: newTitle,
      assignee: newAssignee,
      deadline: newDeadline || "TBD",
      done: false,
      project: newProject,
    }]);
    setNewTitle("");
    toast({ title: "Task Created", description: `"${newTitle}" assigned to ${newAssignee}` });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-primary" /> Your Projects
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {PROJECTS.map((p) => (
            <div key={p} className="border border-border rounded-lg p-4 bg-card glow-border">
              <p className="text-sm font-semibold text-foreground">{p}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tasks.filter((t) => t.project === p).length} tasks
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Create task */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Create Task</h3>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Task title"
          className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
            {MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={newProject} onChange={(e) => setNewProject(e.target.value)} className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
            {PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
        <button onClick={addTask} className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
          Add Task
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card">
            <div className="flex items-center gap-3">
              {t.done ? <CheckCircle size={16} className="text-primary" /> : <Circle size={16} className="text-muted-foreground" />}
              <div>
                <p className={`text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.assignee} · {t.project}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{t.deadline}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Member View ─────────────────────────────────────────────
const MemberView = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const toggle = (id: string) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground mb-4">Your Assigned Tasks</h2>
      {tasks.map((t) => (
        <div key={t.id} className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-card glow-border">
          <button onClick={() => toggle(t.id)} className="shrink-0">
            {t.done ? <CheckCircle size={18} className="text-primary" /> : <Circle size={18} className="text-muted-foreground hover:text-primary transition-colors" />}
          </button>
          <div className="flex-1">
            <p className={`text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</p>
            <p className="text-xs text-muted-foreground">{t.project} · Due {t.deadline}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Client View ─────────────────────────────────────────────
const ClientView = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "PM", text: "Welcome! We've kicked off the due diligence process.", time: "10:00 AM" },
    { from: "Client", text: "Great, looking forward to updates.", time: "10:05 AM" },
  ]);
  const [input, setInput] = useState("");

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "Client", text: input, time: format(new Date(), "h:mm a") }]);
    setInput("");
  };

  const requestUpdate = () => {
    toast({
      title: "Update Requested",
      description: "Simulated email trigger: 'Request XYZ Update' sent to your assigned PM.",
    });
  };

  const deliverables = [
    { name: "Market Analysis", progress: 80 },
    { name: "Financial Model", progress: 45 },
    { name: "Competitive Landscape", progress: 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Progress tracker */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Active Deliverables</h2>
        <div className="space-y-3">
          {deliverables.map((d) => (
            <div key={d.name} className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">{d.name}</p>
                <span className="text-xs text-primary font-bold">{d.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${d.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={requestUpdate} className="flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/10 transition-colors">
        <Mail size={16} />
        Request XYZ Update
      </button>

      {/* Chat */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-bold text-foreground">Direct Message — PM</h3>
        </div>
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "Client" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${m.from === "Client" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <p>{m.text}</p>
                <p className="text-[10px] mt-1 opacity-60">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button onClick={sendMsg} className="text-primary hover:text-primary/80 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Portal Container ────────────────────────────────────────
const Portal = () => {
  const { user, isAuthenticated } = useAuth();
  const allowedRoles = ["PM", "Member", "Client"] as const;
  const [activeTab, setActiveTab] = useState<string>(user?.role || "PM");

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role as any)) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [...allowedRoles];

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Portal</h1>
          <p className="text-muted-foreground mb-8">
            Logged in as <span className="text-primary font-semibold">{user.role}</span>
          </p>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border mb-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "PM" && <PMView />}
          {activeTab === "Member" && <MemberView />}
          {activeTab === "Client" && <ClientView />}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Portal;
