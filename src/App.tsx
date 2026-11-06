import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle, Clock, AlertTriangle, Shield, Sparkles, FolderGit2,
  FileSearch, BarChart3, Database, MessageSquare, UserCheck, Play, Pause,
  RefreshCw, Plus, Edit3, Send, Check, X, ChevronRight, ChevronLeft, Download, Share2, ExternalLink,
  Smartphone, Eye, Layers, Copy, Award, BookOpen, AlertCircle,
  Settings, RotateCcw, Key, ArrowRight
} from 'lucide-react';

function PostCarouselViewer({
  slides,
  title,
  imageUrl
}: {
  slides?: string[];
  title: string;
  imageUrl?: string;
}) {
  const allSlides = slides && slides.length > 0 ? slides : (imageUrl ? [imageUrl] : []);
  const [activeSlide, setActiveSlide] = useState(0);

  if (allSlides.length === 0) return null;

  const currentUrl = allSlides[activeSlide] || allSlides[0];

  const slideDescriptions = [
    'Slide 1 of 5 · Cover Hook & Engineering Reality',
    'Slide 2 of 5 · The Problem & Failure Vectors',
    'Slide 3 of 5 · The 3-Step Architecture Pipeline',
    'Slide 4 of 5 · Proven Metrics (789+ Nodes, -30% MTTR)',
    'Slide 5 of 5 · Key Takeaway & Discussion Question'
  ];

  const handleDownloadSlide = (url: string, index: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `carousel_slide_${index + 1}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    allSlides.forEach((url, i) => {
      setTimeout(() => {
        handleDownloadSlide(url, i);
      }, i * 200);
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            5-Slide Technical Picture Carousel
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
            {slideDescriptions[activeSlide] || `Slide ${activeSlide + 1} of ${allSlides.length}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadAll}
            className="text-[11px] text-emerald-300 hover:text-emerald-200 font-mono flex items-center gap-1 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60 transition"
            title="Download all 5 slides for LinkedIn carousel upload"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download 5 Slides</span>
          </button>
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-mono flex items-center gap-1 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/60"
          >
            Open Slide ↗
          </a>
        </div>
      </div>

      {/* Main Slide Display with Prev / Next overlays */}
      <div className="relative group rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 flex items-center justify-center p-2 min-h-[300px]">
        <img
          src={currentUrl}
          alt={`${title} - Slide ${activeSlide + 1}`}
          className="max-h-96 w-auto object-contain rounded-lg shadow-2xl transition-all duration-200"
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.onerror = null;
            el.src = '/media/visual_post-11479d67_why-most-outages-are-process-f.svg';
          }}
        />

        {/* Prev Slide button */}
        {allSlides.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : allSlides.length - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-xl backdrop-blur transition hover:scale-110"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Slide button */}
        {allSlides.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveSlide((prev) => (prev < allSlides.length - 1 ? prev + 1 : 0))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow-xl backdrop-blur transition hover:scale-110"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Slide dots and thumbnail row */}
      {allSlides.length > 1 && (
        <div className="mt-3 flex flex-col gap-2">
          {/* Interactive Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {allSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeSlide ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Miniature Thumbnails */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
            {allSlides.map((slide, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  idx === activeSlide ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={slide} alt={`Thumb ${idx + 1}`} className="w-16 h-16 object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-center font-mono py-0.5 text-slate-300">
                  Slide {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'approval' | 'generator' | 'projects' | 'research' | 'analytics' | 'memory' | 'comments' | 'leads'>('overview');
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [brandMemory, setBrandMemory] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [emergencyPaused, setEmergencyPaused] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [revampModalOpen, setRevampModalOpen] = useState(false);
  const [revampPostTarget, setRevampPostTarget] = useState<any>(null);
  const [revampInstructions, setRevampInstructions] = useState('');
  const [revamping, setRevamping] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishModalData, setPublishModalData] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: string; text: string } | null>(null);
  const [approvalSubView, setApprovalSubView] = useState<'all' | 'pending' | 'approved' | 'published'>('all');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [channelSettings, setChannelSettings] = useState<any>({
    publish_webhook_url: '',
    composio_api_key: '',
    composio_api_key_set: false,
    linkedin_token_set: false,
    composio_account: 'linkedin_semble-tera (takinyemi432@gmail.com)',
    author_urn: 'urn:li:person:-XwFu54idT'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchInitialData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings').then(r => r.json());
      if (res.success && res.settings) {
        setChannelSettings((prev: any) => ({
          ...prev,
          ...res.settings
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publish_webhook_url: channelSettings.publish_webhook_url,
          composio_api_key: channelSettings.composio_api_key
        })
      }).then(r => r.json());

      if (res.success) {
        showFeedback('success', 'Outbound channel settings saved!');
        setSettingsModalOpen(false);
        fetchSettings();
      } else {
        showFeedback('error', res.error || 'Failed to save settings');
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleMoveToPending = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'pending_approval', feedback: 'Moved back to awaiting approval queue.' })
      }).then(r => r.json());

      if (res.success) {
        showFeedback('success', 'Post moved back to Awaiting Approval queue.');
        fetchInitialData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const showFeedback = (type: string, text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ovRes, calRes, projRes, resRes, memRes, cmtRes, leadRes] = await Promise.all([
        fetch('/api/overview').then(r => r.json()),
        fetch('/api/calendar').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/research').then(r => r.json()),
        fetch('/api/brand-memory').then(r => r.json()),
        fetch('/api/comments').then(r => r.json()),
        fetch('/api/leads').then(r => r.json())
      ]);

      if (ovRes.success) {
        setOverviewData(ovRes);
        setEmergencyPaused(Boolean(ovRes.stats.emergency_pause_active));
      }
      if (calRes.success) {
        setPosts(calRes.posts);
        setPillars(calRes.pillars);
      }
      if (projRes.success) {
        setProjects(projRes.projects);
        if (projRes.projects.length > 0) {
          fetchProjectDetails(projRes.projects[0].id);
        }
      }
      if (resRes.success) setSources(resRes.sources);
      if (memRes.success) setBrandMemory(memRes.memory);
      if (cmtRes.success) setComments(cmtRes.comments);
      if (leadRes.success) setLeads(leadRes.leads);
    } catch (err: any) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`).then(r => r.json());
      if (res.success) {
        setSelectedProject(res.project);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleEmergencyPause = async () => {
    const nextState = !emergencyPaused;
    try {
      const res = await fetch('/api/emergency/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: nextState })
      }).then(r => r.json());

      if (res.success) {
        setEmergencyPaused(nextState);
        showFeedback(
          nextState ? 'warning' : 'success',
          nextState ? 'EMERGENCY PAUSE ACTIVATED: All scheduled publishing has been halted.' : 'Automation resumed. Outbound publishing restored.'
        );
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const handleGenerateWeeklyBatch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar/generate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(r => r.json());

      if (res.success) {
        showFeedback('success', `Generated ${res.count} weekly posts across 6 content pillars with human approval lock!`);
        fetchInitialData();
        setActiveTab('approval');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approved', feedback: 'Approved for automated publishing slot.' })
      }).then(r => r.json());

      if (res.success) {
        showFeedback('success', 'Post approved! Scheduled for its assigned publishing slot.');
        fetchInitialData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const handleRejectPost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'rejected', feedback: 'Rejected by reviewer.' })
      }).then(r => r.json());

      if (res.success) {
        if (res.replacementPost) {
          showFeedback('warning', `Post rejected. Replacement post "${res.replacementPost.title.slice(0, 35)}..." was automatically created for approval!`);
          setPosts(prev => [res.replacementPost, ...prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p)]);
        } else {
          showFeedback('warning', 'Post marked as rejected and removed from publishing queue.');
          setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
        }
        fetchInitialData();
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  const openRevampModal = (post: any) => {
    setRevampPostTarget(post);
    setRevampInstructions('');
    setRevampModalOpen(true);
  };

  const handleRevampSubmit = async () => {
    if (!revampPostTarget || !revampInstructions.trim()) return;
    setRevamping(true);
    try {
      const res = await fetch(`/api/posts/${revampPostTarget.id}/revamp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions: revampInstructions })
      }).then(r => r.json());

      if (res.success) {
        if (res.newPost) {
          showFeedback('success', `Post revamped! In addition, another candidate post "${res.newPost.title.slice(0, 35)}..." was automatically created for approval.`);
          setPosts(prev => [res.newPost, ...prev.map(p => p.id === res.post.id ? res.post : p)]);
        } else if (res.post) {
          showFeedback('success', `Post copy revamped successfully! Review the updated copy below.`);
          setPosts(prev => prev.map(p => p.id === res.post.id ? res.post : p));
        }
        setRevampModalOpen(false);
        setRevampInstructions('');
        fetchInitialData();
      } else {
        showFeedback('error', res.error || 'Failed to revamp post');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    } finally {
      setRevamping(false);
    }
  };

  const handlePublishNow = async (post: any) => {
    if (emergencyPaused) {
      showFeedback('error', 'Cannot publish: Emergency automation pause is currently ACTIVE.');
      return;
    }
    const postId = typeof post === 'string' ? post : post.id;
    const targetPost = typeof post === 'object' ? post : posts.find(p => p.id === postId);

    setLoading(true);
    try {
      // 1. Copy complete formatted post to clipboard
      if (targetPost) {
        const fullText = `${targetPost.hook}\n\n${targetPost.content}\n\n${targetPost.hashtags}${targetPost.first_comment ? `\n\n💬 First Comment:\n${targetPost.first_comment}` : ''}`;
        try {
          await navigator.clipboard.writeText(fullText);
        } catch (_) {}
      }

      // 2. Call backend publish
      const res = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(r => r.json());

      if (res.success) {
        showFeedback('success', `Post published! Live Share URN: ${res.result.share_urn}`);
        setPublishModalData({
          post: targetPost,
          result: res.result,
          copied: true
        });
        setPublishModalOpen(true);
        fetchInitialData();
      } else {
        showFeedback('error', res.error || 'Publishing failed');
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverNewProject = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'telecom_ai' })
      }).then(r => r.json());

      if (res.success) {
        showFeedback('success', `Autonomous Project Engine created: "${res.project.title}"!`);
        fetchInitialData();
        setActiveTab('projects');
        fetchProjectDetails(res.project.id);
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerMobileNotificationTest = async (type: string) => {
    try {
      const res = await fetch('/api/notifications/test-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      }).then(r => r.json());

      if (res.success) {
        setActiveNotification(res.notification);
        setNotificationModalOpen(true);
      }
    } catch (e: any) {
      showFeedback('error', e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      {/* Top Banner / Feedback Alert */}
      {feedbackMsg && (
        <div className={`py-2 px-4 text-center font-medium text-sm flex items-center justify-center gap-2 transition-all ${
          feedbackMsg.type === 'error' ? 'bg-rose-950/80 text-rose-300 border-b border-rose-800' :
          feedbackMsg.type === 'warning' ? 'bg-amber-950/80 text-amber-300 border-b border-amber-800' :
          'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800'
        }`}>
          {feedbackMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Emergency Pause Active Warning Header */}
      {emergencyPaused && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-amber-300 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>EMERGENCY AUTOMATION PAUSE ACTIVE: All outbound scheduled publishing actions are frozen.</span>
          </div>
          <button
            onClick={handleToggleEmergencyPause}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition"
          >
            Resume All Workflows
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">Autonomous Brand OS</h1>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-400/30">
                AI Agent v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personal Branding & Content Automation · <span className="text-slate-300 font-semibold">Toluwanimi Akinyemi</span>
            </p>
          </div>
        </div>

        {/* Live Profile & Integration Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">LinkedIn OAuth:</span>
            <span className="font-mono text-cyan-300 font-semibold">urn:li:person:-XwFu54idT</span>
          </div>

          <button
            onClick={() => setNotificationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Mobile Notification Simulator"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Mobile Alerts</span>
          </button>

          {/* Emergency Pause Toggle */}
          <button
            onClick={handleToggleEmergencyPause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              emergencyPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/40'
            }`}
          >
            {emergencyPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5 text-rose-400" />}
            <span>{emergencyPaused ? 'Resume Publishing' : 'Emergency Pause'}</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-header */}
      <nav className="border-b border-slate-800/60 bg-[#0B1120] px-6 overflow-x-auto flex gap-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'approval', label: 'Approval Center', icon: Shield, badge: overviewData?.stats?.pending_approval },
          { id: 'calendar', label: 'Content Calendar', icon: Calendar },
          { id: 'generator', label: 'AI Generator Studio', icon: Sparkles },
          { id: 'projects', label: 'Project Library & Demos', icon: FolderGit2, badge: overviewData?.stats?.projects_count },
          { id: 'research', label: 'Fact-Checker & Sources', icon: FileSearch },
          { id: 'memory', label: 'Brand Memory', icon: Database },
          { id: 'comments', label: 'Comments & Leads', icon: MessageSquare }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold tracking-wide border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  tab.id === 'approval' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {[
                { label: 'Pending Approval', val: overviewData?.stats?.pending_approval ?? 0, color: 'text-amber-400', bg: 'border-amber-500/30' },
                { label: 'Approved & Queued', val: overviewData?.stats?.approved ?? 0, color: 'text-cyan-400', bg: 'border-cyan-500/30' },
                { label: 'Published Posts', val: overviewData?.stats?.published ?? 1, color: 'text-emerald-400', bg: 'border-emerald-500/30' },
                { label: 'Active Projects', val: overviewData?.stats?.projects_count ?? 4, color: 'text-blue-400', bg: 'border-blue-500/30' },
                { label: 'Verified Sources', val: overviewData?.stats?.verified_sources ?? 2, color: 'text-purple-400', bg: 'border-purple-500/30' },
                { label: 'Inbound Leads', val: overviewData?.stats?.leads_count ?? 2, color: 'text-pink-400', bg: 'border-pink-500/30' }
              ].map((kpi, idx) => (
                <div key={idx} className={`bg-[#0F172A] border ${kpi.bg} p-4 rounded-xl shadow-sm flex flex-col justify-between`}>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${kpi.color}`}>{kpi.val}</p>
                </div>
              ))}
            </div>

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-blue-950/50 via-[#0F172A] to-slate-900 border border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
                  Autonomous Content Pipeline
                </span>
                <h2 className="text-xl font-bold text-white mt-2">
                  Generate This Week's 5-Day Content Calendar
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-xl">
                  Researches current telemetry & AI news, queries the Project Library, drafts posts across all 6 pillars in WAT timezone, and submits them to the Approval Center.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleGenerateWeeklyBatch}
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Weekly Batch</span>
                </button>
                <button
                  onClick={handleDiscoverNewProject}
                  disabled={loading}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl text-sm border border-slate-700 flex items-center gap-2 transition"
                >
                  <FolderGit2 className="w-4 h-4 text-cyan-400" />
                  <span>Auto-Prototype Project</span>
                </button>
              </div>
            </div>

            {/* Upcoming Queue & Audit Log Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Queue */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Upcoming Publishing Queue</span>
                  </h3>
                  <button onClick={() => setActiveTab('calendar')} className="text-xs text-cyan-400 hover:underline">
                    View Calendar →
                  </button>
                </div>
                <div className="space-y-3">
                  {posts.slice(0, 4).map(post => (
                    <div key={post.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg border border-slate-700/80 shrink-0 bg-slate-900"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.onerror = null;
                              el.src = '/media/visual_post-11479d67_why-most-outages-are-process-f.svg';
                            }}
                          />
                        )}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded">
                            {post.pillar_name || 'AI & Telecom'}
                          </span>
                          <h4 className="font-semibold text-sm text-slate-200 mt-1 line-clamp-1">{post.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>📅 {post.scheduled_date}</span>
                            <span>⏰ {post.scheduled_time_wat} WAT</span>
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${
                        post.status === 'approved' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        post.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {post.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automation Activity Log */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Autonomous Agent Activity Log</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">Real-Time Audit Trail</span>
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  {overviewData?.recentLogs?.map((log: any) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        log.status === 'error' ? 'bg-rose-500' :
                        log.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-400'
                      }`} />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 text-slate-300 font-bold">
                          <span>{log.agent_name}</span>
                          <span className="text-slate-500 text-[10px]">[{log.action}]</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">{log.details}</p>
                      </div>
                    </div>
                  )) || <p className="text-slate-500 italic">No recent logs recorded.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. APPROVAL & POSTS HUB TAB */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            {/* Header / Command Center */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0F172A] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Post Review & Publishing Hub</span>
                    <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      Human-in-the-Loop
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Both <strong>Awaiting Approval</strong> and <strong>Approved Posts</strong> live here on the same page.
                  </p>
                </div>
              </div>

              {/* Status and Settings Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(true)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition ${
                    channelSettings.composio_api_key_set || channelSettings.publish_webhook_url
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                      : 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/40'
                  }`}
                  title="Configure Composio API or Outbound Webhook"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>
                    {channelSettings.composio_api_key_set
                      ? 'Composio Connected'
                      : channelSettings.publish_webhook_url
                      ? 'Webhook Configured'
                      : 'Connect Composio API'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateWeeklyBatch}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate New Posts</span>
                </button>
              </div>
            </div>

            {/* Quick Filter / Section View Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B1120] p-2 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setApprovalSubView('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition ${
                    approvalSubView === 'all'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Posts on Page</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    approvalSubView === 'all' ? 'bg-slate-950/30 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {posts.filter(p => p.status === 'pending_approval' || p.status === 'approved').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalSubView('pending')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition ${
                    approvalSubView === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting Approval</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    approvalSubView === 'pending' ? 'bg-slate-950/30 text-slate-950 font-extrabold' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {posts.filter(p => p.status === 'pending_approval').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalSubView('approved')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition ${
                    approvalSubView === 'approved'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approved & Scheduled</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    approvalSubView === 'approved' ? 'bg-slate-950/30 text-slate-950 font-extrabold' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {posts.filter(p => p.status === 'approved').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setApprovalSubView('published')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 transition ${
                    approvalSubView === 'published'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Live on LinkedIn</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    approvalSubView === 'published' ? 'bg-blue-950 text-white font-extrabold' : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                  }`}>
                    {posts.filter(p => p.status === 'published').length}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-mono hidden md:flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-cyan-400" />
                <span>Mobile review links available on all cards</span>
              </div>
            </div>

            {/* SECTION 1: ⏳ AWAITING APPROVAL (Visible if subView is 'all' or 'pending') */}
            {(approvalSubView === 'all' || approvalSubView === 'pending') && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                        <span>Awaiting Human Approval Queue</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold">
                          {posts.filter(p => p.status === 'pending_approval').length} Posts
                        </span>
                      </h3>
                      <p className="text-xs text-amber-300/80 mt-0.5">
                        These posts require your review. Tap <strong>Approve</strong> to move them into the Approved queue below, or <strong>Revamp</strong> to adjust copy.
                      </p>
                    </div>
                  </div>
                </div>

                {posts.filter(p => p.status === 'pending_approval').length === 0 ? (
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No Posts Awaiting Review</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All candidate posts have either been approved or published! Click "Generate New Posts" to generate the next batch.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {posts.filter(p => p.status === 'pending_approval').map(post => (
                      <div key={post.id} className="bg-[#0F172A] border border-amber-500/40 rounded-2xl p-6 shadow-xl transition-all hover:border-amber-500/60">
                        {/* Header bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800">
                              {post.pillar_name || 'AI Automation'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Format: <span className="text-slate-200 font-semibold">{post.content_format}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-amber-400" />
                              {post.scheduled_date} at {post.scheduled_time_wat} WAT
                            </span>
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 text-[11px]">
                              QC Score: {post.quality_score}/100
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="mt-4 space-y-4">
                          <h3 className="text-base font-bold text-white">{post.title}</h3>

                          {/* Hook Box */}
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Opening Hook:</p>
                            <p className="text-sm text-slate-200 font-medium whitespace-pre-line">{post.hook}</p>
                          </div>

                          {/* 5-Slide Picture Carousel */}
                          <PostCarouselViewer
                            slides={post.carousel_slides}
                            title={post.title}
                            imageUrl={post.image_url}
                          />

                          {/* Post Body */}
                          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Post Body (Formatted for Mobile):</p>
                            <p className="text-sm text-slate-300 font-sans whitespace-pre-line leading-relaxed">{post.content}</p>
                            <p className="text-xs text-blue-400 font-mono mt-3">{post.hashtags}</p>
                          </div>

                          {/* First Comment & CTA */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                              <span className="font-bold text-slate-400 block mb-1">Suggested Discussion Question:</span>
                              <p className="text-slate-200">{post.audience_question}</p>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                              <span className="font-bold text-slate-400 block mb-1">Pinned First Comment:</span>
                              <p className="text-slate-200">{post.first_comment}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Status: </span>
                            <span className="px-2.5 py-0.5 rounded text-xs font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-600">
                              Awaiting Approval
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const host = window.location.hostname === 'localhost' ? '192.168.1.77' : window.location.hostname;
                                const reviewUrl = `http://${host}:3001/api/mobile-review?id=${post.id}`;
                                const approveUrl = `http://${host}:3001/api/quick-approve?id=${post.id}&action=approved`;
                                navigator.clipboard.writeText(reviewUrl);
                                alert(`📱 Mobile Links for "${post.title.slice(0, 30)}...":\n\n1. Full Phone Review Page (Copied):\n${reviewUrl}\n\n2. 1-Tap Direct Approve Link:\n${approveUrl}\n\nOpen this link on your phone browser, WhatsApp, or Gmail to review and approve without your laptop!`);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
                              title="Copy phone approval link"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Copy Phone Link</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openRevampModal(post)}
                              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-600/80 flex items-center gap-1.5 transition"
                              title="Revamp post copy with specific instructions"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Revamp</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectPost(post.id)}
                              className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-lg border border-rose-800 flex items-center gap-1.5 transition"
                              title="Reject and auto-create a replacement post"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApprovePost(post.id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition"
                              title="Approve and move into the Approved queue below"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve (Move to Scheduled)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePublishNow(post)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition"
                              title="Publish immediately without waiting for scheduled time"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Publish Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: ✅ APPROVED & SCHEDULED (Visible if subView is 'all' or 'approved') */}
            {(approvalSubView === 'all' || approvalSubView === 'approved') && (
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-200 flex items-center gap-2">
                        <span>Approved & Scheduled Posts Queue</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold">
                          {posts.filter(p => p.status === 'approved').length} Posts
                        </span>
                      </h3>
                      <p className="text-xs text-emerald-300/80 mt-0.5">
                        These posts have passed human authorization and are locked in the autonomous schedule to post at their assigned WAT times.
                      </p>
                    </div>
                  </div>
                </div>

                {posts.filter(p => p.status === 'approved').length === 0 ? (
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No Posts Currently Approved</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Approve any post from the "Awaiting Human Approval" section above to lock it into the publishing schedule.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {posts.filter(p => p.status === 'approved').map(post => (
                      <div key={post.id} className="bg-[#0F172A] border border-cyan-500/40 rounded-2xl p-6 shadow-xl transition-all hover:border-cyan-500/70">
                        {/* Auto-Dispatch Schedule Banner */}
                        <div className="mb-4 bg-cyan-950/70 border border-cyan-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
                            <span>⏰ Scheduled Auto-Dispatch: {post.scheduled_date} at {post.scheduled_time_wat} WAT</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-700">
                            Slot Locked
                          </span>
                        </div>

                        {/* Header bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-cyan-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
                              {post.pillar_name || 'AI Automation'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Format: <span className="text-slate-200 font-semibold">{post.content_format}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                              {post.scheduled_date} at {post.scheduled_time_wat} WAT
                            </span>
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 text-[11px]">
                              QC Score: {post.quality_score}/100
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="mt-4 space-y-4">
                          <h3 className="text-base font-bold text-white">{post.title}</h3>

                          {/* Hook Box */}
                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Opening Hook:</p>
                            <p className="text-sm text-slate-200 font-medium whitespace-pre-line">{post.hook}</p>
                          </div>

                          {/* 5-Slide Picture Carousel */}
                          <PostCarouselViewer
                            slides={post.carousel_slides}
                            title={post.title}
                            imageUrl={post.image_url}
                          />

                          {/* Post Body */}
                          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Post Body (Formatted for Mobile):</p>
                            <p className="text-sm text-slate-300 font-sans whitespace-pre-line leading-relaxed">{post.content}</p>
                            <p className="text-xs text-blue-400 font-mono mt-3">{post.hashtags}</p>
                          </div>

                          {/* First Comment & CTA */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                              <span className="font-bold text-slate-400 block mb-1">Suggested Discussion Question:</span>
                              <p className="text-slate-200">{post.audience_question}</p>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                              <span className="font-bold text-slate-400 block mb-1">Pinned First Comment:</span>
                              <p className="text-slate-200">{post.first_comment}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Status: </span>
                            <span className="px-2.5 py-0.5 rounded text-xs font-extrabold uppercase bg-cyan-500 text-slate-950">
                              Approved & Scheduled
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const host = window.location.hostname === 'localhost' ? '192.168.1.77' : window.location.hostname;
                                const reviewUrl = `http://${host}:3001/api/mobile-review?id=${post.id}`;
                                navigator.clipboard.writeText(reviewUrl);
                                alert(`📱 Mobile Review Link for "${post.title.slice(0, 30)}..." copied!\n\n${reviewUrl}`);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
                              title="Copy phone review link"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Copy Phone Link</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openRevampModal(post)}
                              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-600/80 flex items-center gap-1.5 transition"
                              title="Revamp post copy before scheduled dispatch"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Revamp</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveToPending(post.id)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                              title="Move back to Awaiting Approval queue"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                              <span>Move Back to Review</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePublishNow(post)}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition"
                              title="Publish immediately without waiting for scheduled WAT time"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Publish Now</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: 🚀 LIVE ON LINKEDIN (Visible if subView is 'all' or 'published') */}
            {(approvalSubView === 'all' || approvalSubView === 'published') && (
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-200 flex items-center gap-2">
                        <span>Live on LinkedIn</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white font-extrabold">
                          {posts.filter(p => p.status === 'published').length} Live
                        </span>
                      </h3>
                      <p className="text-xs text-blue-300/80 mt-0.5">
                        These posts have been published live to Toluwanimi's LinkedIn profile.
                      </p>
                    </div>
                  </div>
                </div>

                {posts.filter(p => p.status === 'published').length === 0 ? (
                  <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <Send className="w-8 h-8 text-slate-500 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No Published Posts Yet</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Use "Publish Now" on any approved post or allow the scheduled WAT dispatcher to publish automatically.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {posts.filter(p => p.status === 'published').map(post => (
                      <div key={post.id} className="bg-[#0F172A] border border-blue-500/40 rounded-2xl p-6 shadow-xl transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Live on LinkedIn
                            </span>
                            <span className="text-xs text-cyan-400 font-mono bg-blue-950/60 px-2.5 py-0.5 rounded border border-blue-800">
                              {post.pillar_name || 'AI Automation'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={post.permalink || 'https://www.linkedin.com/feed/update/urn:li:share:7523140543560982528/'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Live Post on LinkedIn ↗</span>
                            </a>
                          </div>
                        </div>

                        <div className="mt-4 space-y-4">
                          <h3 className="text-base font-bold text-white">{post.title}</h3>

                          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
                            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Hook:</p>
                            <p className="text-sm text-slate-200 font-medium whitespace-pre-line">{post.hook}</p>
                          </div>

                          <PostCarouselViewer
                            slides={post.carousel_slides}
                            title={post.title}
                            imageUrl={post.image_url}
                          />

                          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Published Text:</p>
                            <p className="text-sm text-slate-300 font-sans whitespace-pre-line leading-relaxed">{post.content}</p>
                            <p className="text-xs text-blue-400 font-mono mt-3">{post.hashtags}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. CONTENT CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0F172A] p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>LinkedIn Weekly Content Calendar</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Default schedule: 5 posts per week (Monday to Friday, 08:15–08:45 WAT).
                </p>
              </div>
              <button
                onClick={handleGenerateWeeklyBatch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Plan Next Week</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, dayIdx) => {
                const dayPosts = posts.filter((_, idx) => idx % 5 === dayIdx);
                return (
                  <div key={day} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-col">
                    <div className="pb-3 border-b border-slate-800/80 mb-3 flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{day}</span>
                      <span className="text-[11px] text-slate-400 font-mono">08:15 WAT</span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {dayPosts.map(p => (
                        <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                              {p.pillar_name || 'AI & Telecom'}
                            </span>
                            <h4 className="font-semibold text-slate-200 line-clamp-2">{p.title}</h4>
                            {p.image_url && (
                              <div className="mt-2 rounded-lg overflow-hidden h-24 bg-slate-950 border border-slate-800">
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const el = e.currentTarget as HTMLImageElement;
                                    el.onerror = null;
                                    el.src = '/media/visual_post-11479d67_why-most-outages-are-process-f.svg';
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              p.status === 'approved' ? 'bg-cyan-950 text-cyan-300' :
                              p.status === 'published' ? 'bg-emerald-950 text-emerald-300' :
                              'bg-amber-950 text-amber-300'
                            }`}>
                              {p.status.replace('_', ' ')}
                            </span>
                            <button
                              onClick={() => setActiveTab('approval')}
                              className="text-cyan-400 hover:underline font-medium"
                            >
                              Review →
                            </button>
                          </div>
                        </div>
                      ))}
                      {dayPosts.length === 0 && (
                        <div className="h-28 flex items-center justify-center text-slate-600 text-xs italic">
                          No post scheduled
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. PROJECT LIBRARY & AUTONOMOUS DEMOS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-cyan-400" />
                  <span>Project Library & Autonomous Prototypes</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Verified real projects and autonomous demonstration prototypes with runnable code, synthetic datasets, and architecture diagrams.
                </p>
              </div>

              <button
                onClick={handleDiscoverNewProject}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-lg shadow-blue-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Autonomously Prototype New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project List */}
              <div className="space-y-3">
                {projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => fetchProjectDetails(proj.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      selectedProject?.id === proj.id
                        ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        proj.type === 'real' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-blue-950 text-cyan-300 border border-blue-800'
                      }`}>
                        {proj.type === 'real' ? 'Verified Project' : 'AI Prototype'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{proj.status}</span>
                    </div>
                    <h3 className="font-bold text-sm text-white mt-2">{proj.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.problem_statement}</p>
                  </div>
                ))}
              </div>

              {/* Project Deep Dive Panel */}
              <div className="lg:col-span-2 bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
                {selectedProject ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-cyan-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                          {selectedProject.category.toUpperCase()}
                        </span>
                        {selectedProject.live_url && (
                          <a
                            href={selectedProject.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>Live Application</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mt-2">{selectedProject.title}</h3>
                    </div>

                    {/* ExpenseIQ Test Login Banner */}
                    {(selectedProject.id === 'proj-expenseiq' || selectedProject.title.toLowerCase().includes('expenseiq')) && (
                      <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            ExpenseIQ Live Sandbox Login Credentials
                          </span>
                          <a
                            href="https://expense-ai-pro-14.lovable.app/login"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>Open Web App</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 text-[10px] block uppercase">Username / Email</span>
                              <span className="text-white font-bold select-all">test@expenseiq.com</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('test@expenseiq.com');
                                showFeedback('success', 'Username test@expenseiq.com copied!');
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          </div>
                          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 text-[10px] block uppercase">Password</span>
                              <span className="text-white font-bold select-all">test@1234</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('test@1234');
                                showFeedback('success', 'Password test@1234 copied!');
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 transition"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Role: <strong className="text-slate-300">Finance Director / Approver Sandbox</strong> · Use these credentials to test live OCR receipt uploads, AI policy audits, and 1-click approvals.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Problem Statement:</span>
                        <p className="text-slate-200">{selectedProject.problem_statement}</p>
                      </div>
                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Business Use Case:</span>
                        <p className="text-slate-200">{selectedProject.business_use_case}</p>
                      </div>
                    </div>

                    {/* Tech Stack Pills */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Technology Stack:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tech_stack.map((t: string) => (
                          <span key={t} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-md font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Runnable Code Snippet */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Implementation Snippet:</span>
                      <pre className="bg-[#090D16] border border-slate-800 text-cyan-300 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                        {Object.values(selectedProject.code_snippets)[0] as string || '// Code implementation ready'}
                      </pre>
                    </div>

                    {/* Synthetic Dataset / Evidence */}
                    {selectedProject.evidence?.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Demonstration Evidence:</span>
                        <div className="space-y-2">
                          {selectedProject.evidence.map((ev: any) => (
                            <div key={ev.id} className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-xs">
                              <span className="font-bold text-white block mb-1">{ev.title}</span>
                              <pre className="text-slate-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                                {ev.data_payload}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Select a project to inspect technical specifications and evidence.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. RESEARCH & FACT CHECKER */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0F172A] p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-cyan-400" />
                  <span>Fact-Checking Agent & Research Repository</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Validates primary citations, publication dates, and empirical claims before any post reaches the Approval Center.
                </p>
              </div>
              <button
                onClick={async () => {
                  setLoading(true);
                  await fetch('/api/research/scan', { method: 'POST' });
                  fetchInitialData();
                  setLoading(false);
                  showFeedback('success', 'Ran weekly technical literature scan!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Run Fact-Check Scan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map(src => (
                <div key={src.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800 uppercase">
                      ✓ {src.verification_grade}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Date: {src.publication_date}</span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{src.title}</h3>
                  <p className="text-xs text-slate-400">{src.publisher}</p>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Verified Claim:</span>
                    {src.factual_claims}
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold pt-1"
                  >
                    <span>View Primary Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. BRAND MEMORY TAB */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span>Persistent Brand Memory & Voice Guardrails</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                The persistent memory repository storing Toluwanimi's core metrics, writing tone, and banned AI expressions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brandMemory.map(mem => (
                <div key={mem.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                      {mem.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{mem.key}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{mem.value}</p>
                  {mem.notes && <p className="text-xs text-slate-400 italic">{mem.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. COMMENTS & LEADS TAB */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inbound Comments */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>AI Comment Response Assistant</span>
                </h3>
                <div className="space-y-3">
                  {comments.map(c => (
                    <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{c.commenter_name}</span>
                        <span className="text-slate-500 text-[10px]">On: {c.post_title}</span>
                      </div>
                      <p className="text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        "{c.comment_text}"
                      </p>
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Suggested AI Reply ({c.reply_style}):</span>
                        <p className="text-slate-200 bg-blue-950/30 p-2.5 rounded-lg border border-blue-900/40">
                          {c.suggested_reply}
                        </p>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={async () => {
                            await fetch(`/api/comments/${c.id}/approve`, { method: 'POST' });
                            showFeedback('success', 'Draft comment response approved!');
                            fetchInitialData();
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs"
                        >
                          Approve Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Leads */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Professional Leads & Opportunities</span>
                </h3>
                <div className="space-y-3">
                  {leads.map(lead => (
                    <div key={lead.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{lead.contact_name}</span>
                        <span className="text-[10px] font-bold uppercase text-cyan-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                          {lead.opportunity_type}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium">{lead.role} · <span className="text-slate-400">{lead.company}</span></p>
                      <p className="text-slate-400 text-xs">{lead.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Notification Simulator Modal */}
      {notificationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Mobile Push Notifications</h3>
              </div>
              <button onClick={() => setNotificationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Simulate Google Gemini & Make.com automated phone alerts across your weekly schedule (West Africa Time):
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => triggerMobileNotificationTest('sun_prep')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl font-medium text-left"
              >
                📅 Sun 6:00 PM WAT
                <span className="block text-[10px] text-slate-500">Weekly Calendar Prep</span>
              </button>
              <button
                onClick={() => triggerMobileNotificationTest('mon_approval')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl font-medium text-left"
              >
                🔔 Mon 8:00 AM WAT
                <span className="block text-[10px] text-slate-500">Approval Reminders</span>
              </button>
              <button
                onClick={() => triggerMobileNotificationTest('wed_midweek')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl font-medium text-left"
              >
                ⚡ Wed 8:00 AM WAT
                <span className="block text-[10px] text-slate-500">Midweek Status</span>
              </button>
              <button
                onClick={() => triggerMobileNotificationTest('fri_review')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl font-medium text-left"
              >
                📊 Fri 4:00 PM WAT
                <span className="block text-[10px] text-slate-500">Performance Review</span>
              </button>
            </div>

            {activeNotification && (
              <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Device Notification Preview:</span>
                <p className="text-xs text-slate-200">{activeNotification.message}</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <a
                    href={`http://${window.location.hostname === 'localhost' ? '192.168.1.77' : window.location.hostname}:3001/api/mobile-review?id=${posts[0]?.id || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>📱 Open Mobile Review Interface →</span>
                  </a>
                  <span className="text-[10px] text-slate-500 font-mono">seun.akin43@gmail.com</span>
                </div>
              </div>
            )}

            {/* Google Gemini Mobile App Setup Box */}
            <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 p-3.5 rounded-xl border border-blue-500/30 text-xs space-y-1.5">
              <span className="font-bold text-cyan-300 block text-[11px] uppercase tracking-wider">
                🤖 Google Gemini Mobile App Voice Prompt:
              </span>
              <p className="text-slate-300 text-[11px]">
                In the Gemini Mobile App with Google Workspace extension enabled, say:
              </p>
              <p className="bg-slate-950/80 p-2 rounded border border-slate-800 font-mono text-[11px] text-cyan-400 select-all">
                "@Gmail check my latest LinkedIn post approval"
              </p>
            </div>

            <button
              onClick={() => setNotificationModalOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Popout Revamp Message Modal */}
      {revampModalOpen && revampPostTarget && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-amber-500/50 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Revamp Post Copy</h3>
              </div>
              <button onClick={() => setRevampModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Post:</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5 line-clamp-1">{revampPostTarget.title}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                What would you like to change?
              </label>
              <textarea
                value={revampInstructions}
                onChange={(e) => setRevampInstructions(e.target.value)}
                placeholder="e.g. Change the hook to focus on 48V power fluctuations, or make the call to action ask other NOC leads about MTTR reduction..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
              />
            </div>

            {/* Quick preset chips */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  '🎯 Punchier, contrarian opening hook',
                  '⚡ Emphasize 789+ nodes NOC operational experience',
                  '⏳ Clarify my recent AI automation learning journey',
                  '💬 Stronger discussion question for telecom engineers'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setRevampInstructions(chip)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-lg text-slate-300 text-[11px] transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRevampModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevampSubmit}
                disabled={revamping || !revampInstructions.trim()}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg flex items-center gap-2 disabled:opacity-50 transition"
              >
                {revamping ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Revamping Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply Revamp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish to LinkedIn Modal */}
      {publishModalOpen && publishModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">LinkedIn Live Publishing</h3>
              </div>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-emerald-950/80 border border-emerald-800 rounded-xl p-3.5 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm">Post Content Copied to Clipboard! 📋</h4>
                  <p className="text-xs text-emerald-400/90 mt-0.5">
                    The complete formatted copy (hook, breakdown, hashtags, and first comment) is in your clipboard.
                  </p>
                </div>
              </div>

              {publishModalData.result?.permalink && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[11px] font-mono text-slate-400 block mb-1">LinkedIn Live Permlink:</span>
                  <a
                    href={publishModalData.result.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline break-all font-mono flex items-center gap-1"
                  >
                    <span>{publishModalData.result.permalink}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-slate-200">How to attach your 5-slide carousel on LinkedIn:</p>
                <p>1. Tap <strong>Open LinkedIn Composer</strong> below.</p>
                <p>2. Paste your clipboard copy (<kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px]">Ctrl+V</kbd>).</p>
                <p>3. Tap <strong>Download 5 Slides</strong> and upload them into LinkedIn as a multi-image or document carousel.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const slides = publishModalData.post?.carousel_slides || [];
                  slides.forEach((url: string, i: number) => {
                    setTimeout(() => {
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `carousel_slide_${i + 1}.svg`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }, i * 200);
                  });
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <Download className="w-4 h-4" />
                <span>Download 5 Slides</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/feed/?shareActive=true"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Open LinkedIn Composer ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Outbound Channel / Composio Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-cyan-500/50 max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Outbound Publishing Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Composio Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">Composio REST API (Recommended)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Account: takinyemi432@gmail.com
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Your Composio account is active and verified on LinkedIn. To allow your standalone Node server or Vercel cloud cron to post autonomously without needing this assistant window, enter your Composio API key below.
                </p>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Composio API Key:
                  </label>
                  <input
                    type="password"
                    value={channelSettings.composio_api_key || ''}
                    onChange={(e) => setChannelSettings({ ...channelSettings, composio_api_key: e.target.value })}
                    placeholder={channelSettings.composio_api_key_set ? '•••••••••••••••• (API Key Active)' : 'Paste your API key from app.composio.dev/settings'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Get your key from: <a href="https://app.composio.dev/settings" target="_blank" rel="noreferrer" className="text-cyan-400 underline">app.composio.dev/settings</a></span>
                    {channelSettings.composio_api_key_set && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Key saved in database
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Webhook Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-sm">Make.com / n8n Webhook (Alternative)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Alternatively, send post JSON payloads directly to a Make.com or n8n Custom Webhook for external automation.
                </p>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Webhook URL:
                  </label>
                  <input
                    type="text"
                    value={channelSettings.publish_webhook_url || ''}
                    onChange={(e) => setChannelSettings({ ...channelSettings, publish_webhook_url: e.target.value })}
                    placeholder="https://hook.eu1.make.com/... or https://n8n.yourdomain.com/webhook/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition disabled:opacity-50"
              >
                {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Channel Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
