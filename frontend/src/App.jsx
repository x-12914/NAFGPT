import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  FileText,
  Upload,
  LogOut,
  Shield,
  Activity,
  Menu,
  X,
  Send,
  Zap,
  Info,
} from 'lucide-react';

const API_URL = '/api';

// ─── App Shell ────────────────────────────────────────────────────────────────

function App() {
  const [token, setToken]             = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab]     = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [username, setUsername]       = useState('admin');
  const [password, setPassword]       = useState('naf2026');
  const [loggingIn, setLoggingIn]     = useState(false);
  const [loginError, setLoginError]   = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch {
      setLoginError('Authentication failed. Check credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-cyan-400" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0d1117] block animate-pulse" />
              </div>
            </div>

            <h1 className="text-4xl font-black text-center text-white tracking-tight mb-1">
              NAF<span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-center text-xs text-slate-500 uppercase tracking-[0.25em] font-semibold mb-10">
              Nigerian Air Force Intel Portal
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Service Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Service ID"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Security Passkey
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-4 mt-2 bg-cyan-400 hover:bg-cyan-300 text-[#05070a] font-black rounded-xl transition-all shadow-[0_0_24px_rgba(0,229,255,0.25)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-widest uppercase"
              >
                {loggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#05070a]/30 border-t-[#05070a] rounded-full animate-spin" />
                    Verifying Clearance...
                  </span>
                ) : 'Access Secure Portal'}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/2/26/Coat_of_arms_of_Nigeria.svg"
                alt="NAF Emblem"
                className="h-9 opacity-30 hover:opacity-70 transition-opacity"
              />
              <p className="text-[9px] font-mono text-slate-700 tracking-widest uppercase text-center">
                Secured by Air Force Intelligence Command © 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#05070a] text-slate-100 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 flex flex-col bg-[#0d1117] border-r border-white/5 transition-all duration-300 ease-in-out overflow-hidden`}>
        {/* Logo */}
        <div className="h-20 flex items-center px-5 border-b border-white/5 flex-shrink-0">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-cyan-400 rounded-xl shadow-[0_0_16px_rgba(0,229,255,0.3)]">
            <Zap className="w-5 h-5 text-[#05070a]" />
          </div>
          {sidebarOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="font-black text-base tracking-tighter leading-none whitespace-nowrap">
                NAF<span className="text-cyan-400">ASSIST</span>
              </p>
              <p className="text-[9px] text-cyan-500/70 tracking-[0.3em] uppercase font-bold mt-0.5 whitespace-nowrap">
                Tactical AI
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Tactical Intel"  active={activeTab === 'chat'}      collapsed={!sidebarOpen} onClick={() => setActiveTab('chat')} />
          <NavItem icon={<FileText     className="w-5 h-5" />} label="Briefing Gen"     active={activeTab === 'summarize'} collapsed={!sidebarOpen} onClick={() => setActiveTab('summarize')} />
          <NavItem icon={<Upload       className="w-5 h-5" />} label="Archive Upload"   active={activeTab === 'upload'}    collapsed={!sidebarOpen} onClick={() => setActiveTab('upload')} />
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-white/5 pt-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 py-3 w-full rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group ${sidebarOpen ? 'px-4' : 'justify-center px-0'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="text-sm font-semibold whitespace-nowrap">Terminate Session</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
        </div>

        {/* ── Header ── */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-[#0d1117]/60 backdrop-blur-xl relative z-10">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">System Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                <span className="text-xs font-bold text-emerald-500 tracking-widest">ACTIVE INTERFACE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Authentication Level</span>
              <span className="text-xs font-mono font-bold text-cyan-400">CLEARANCE: TOP SECRET</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[#05070a] font-black text-[10px] flex-shrink-0">
                AF
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-white leading-none">ADMINISTRATOR</span>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">ID: AF-2401</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <div className="flex-1 overflow-y-auto relative z-10">
          {activeTab === 'chat'      && <ChatView token={token} />}
          {activeTab === 'summarize' && <SummarizerView token={token} />}
          {activeTab === 'upload'    && <UploadView token={token} />}
        </div>
      </div>
    </div>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────

function NavItem({ icon, label, active, onClick, collapsed }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 py-3 w-full rounded-xl transition-all group ${collapsed ? 'justify-center px-0' : 'px-4'} ${active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#00e5ff]" />
      )}
      <span className={`flex-shrink-0 transition-colors ${active ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`}>
        {icon}
      </span>
      {!collapsed && <span className="text-sm font-bold tracking-wide whitespace-nowrap">{label}</span>}
    </button>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

function ChatView({ token }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Operational ready. Standing by for intelligence queries or document analysis.' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/chat`, { query: input }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'ERROR: Communication link severed. Intelligence database unreachable.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-cyan-500/15 border border-cyan-500/30'}`}>
                {msg.role === 'user' ? <Shield className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className={`max-w-[75%] px-5 py-4 rounded-2xl shadow-lg ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] font-mono mt-2 opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-cyan-500/15 border border-cyan-500/30">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-6 pb-6 pt-3 border-t border-white/5 bg-[#05070a]/60 backdrop-blur-xl">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3 items-center bg-[#0d1117] border border-white/10 rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query the Intelligence Network..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2 placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-cyan-400 rounded-xl text-[#05070a] hover:bg-cyan-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Summarizer View ──────────────────────────────────────────────────────────

function SummarizerView({ token }) {
  const [text, setText]                   = useState('');
  const [summary, setSummary]             = useState('');
  const [summarizing, setSummarizing]     = useState(false);
  const [extracting, setExtracting]       = useState(false);
  const [fileName, setFileName]           = useState('');
  const [extractError, setExtractError]   = useState('');
  const fileInputRef = useRef(null);

  // Extract text from a PDF file using PDF.js (loaded via CDN)
  const extractPdfText = async (file) => {
    setExtracting(true);
    setExtractError('');
    setFileName(file.name);
    setText('');
    setSummary('');

    try {
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) throw new Error('PDF.js not loaded. Please refresh the page.');

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page    = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageStr = content.items.map((item) => item.str).join(' ');
        fullText += `--- PAGE ${pageNum} ---\n${pageStr}\n\n`;
      }

      if (!fullText.trim()) throw new Error('No readable text found. The PDF may be image-based.');
      setText(fullText.trim());
    } catch (err) {
      setExtractError(err.message || 'Failed to extract text from PDF.');
      setFileName('');
    } finally {
      setExtracting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setExtractError('Only PDF files are supported.');
      return;
    }
    extractPdfText(file);
    e.target.value = ''; // allow re-selecting same file
  };

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setSummarizing(true);
    try {
      const res = await axios.post(`${API_URL}/summarize`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(res.data.summary);
    } catch {
      alert('FAILED: Processing error in summarization module.');
    } finally {
      setSummarizing(false);
    }
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">

        {/* ── Input Column ── */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Intelligence Input</h2>
            </div>
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">PDF / Plain Text</span>
          </div>

          {/* PDF Upload button */}
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={extracting || summarizing}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-cyan-500/40 text-slate-500 hover:text-cyan-400 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {extracting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
                  <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Scanning PDF...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold tracking-widest uppercase">Upload PDF Document</span>
                </>
              )}
            </button>

            {/* File badge */}
            {fileName && !extracting && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-mono text-cyan-300 truncate flex-1">{fileName}</span>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex-shrink-0">✓ Extracted</span>
              </div>
            )}

            {/* Error */}
            {extractError && (
              <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 font-medium">
                {extractError}
              </div>
            )}
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">or paste text</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Textarea */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="PASTE RAW REPORTS, FLIGHT LOGS, OR FIELD BRIEFINGS HERE..."
            className="flex-1 min-h-[260px] bg-[#0d1117] border border-white/5 rounded-2xl p-6 text-slate-300 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-cyan-500/40 transition-colors placeholder:text-slate-700"
          />

          {/* Word / char count */}
          {text && (
            <div className="flex-shrink-0 flex items-center justify-between text-[10px] font-mono text-slate-600 px-1">
              <span>{wordCount.toLocaleString()} words</span>
              <span>{text.length.toLocaleString()} chars</span>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleSummarize}
            disabled={summarizing || extracting || !text.trim()}
            className="flex-shrink-0 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl hover:shadow-[0_0_20px_rgba(0,123,255,0.35)] transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
          >
            {summarizing ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Distilling Intelligence...
              </span>
            ) : 'Generate Executive Briefing'}
          </button>
        </div>

        {/* ── Output Column ── */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Strategic Briefing</h2>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="flex-1 min-h-[260px] bg-[#0d1117] border border-white/5 rounded-2xl p-8 overflow-y-auto">
            {summarizing ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-cyan-400">
                <span className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-xs font-bold tracking-widest uppercase">Analyzing...</p>
              </div>
            ) : summary ? (
              <p className="text-slate-300 text-sm leading-8 whitespace-pre-wrap font-medium">{summary}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
                <Info className="w-14 h-14 opacity-25" />
                <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-50">Awaiting Input Stream</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upload View ──────────────────────────────────────────────────────────────

function UploadView({ token }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]       = useState('');

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setStatus(`Ingesting: ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setStatus('ASSET SUCCESSFULLY ARCHIVED IN THE KNOWLEDGE NETWORK.');
    } catch {
      setStatus('ERROR: UPLOAD INTERRUPTED. SYSTEM OFFLINE.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 flex items-center justify-center min-h-full">
      <div className="w-full max-w-2xl">
        <div className="group relative bg-[#0d1117] border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-3xl p-16 text-center transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/[0.03] transition-colors pointer-events-none rounded-3xl" />

          <div className="mx-auto w-24 h-24 bg-[#05070a] border border-white/10 group-hover:border-cyan-500/30 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl">
            <Upload className="w-10 h-10 text-cyan-400" />
          </div>

          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
            Archive Manuals & SOPs
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-10">
            Securely transmit PDF documentation to the central knowledge repository for automated neural indexing.
          </p>

          <div className="relative inline-block">
            <input
              type="file"
              accept=".pdf"
              onChange={onFileChange}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`px-10 py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-xl ${uploading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-400 text-[#05070a] hover:shadow-[0_0_24px_rgba(0,229,255,0.4)] group-hover:-translate-y-0.5'}`}>
              {uploading ? 'Indexing Asset...' : 'Select Documents for Transfer'}
            </div>
          </div>

          <p className="mt-8 text-[9px] font-mono text-slate-700 uppercase tracking-widest">
            Max Size: 50MB · AES-256 Encrypted Transit
          </p>
        </div>

        {status && (
          <div className={`mt-6 p-5 rounded-2xl border text-center text-xs font-bold tracking-wide ${
            status.includes('SUCCESS') ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
            : status.includes('ERROR') ? 'border-red-500/30 text-red-400 bg-red-500/5'
            : 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5 animate-pulse'
          }`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
