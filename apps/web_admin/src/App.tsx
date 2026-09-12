import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  Zap, 
  Flame, 
  FileText, 
  Users, 
  ArrowUpRight,
  Cpu, 
  Database, 
  RefreshCw, 
  Sun, 
  Moon, 
  Filter,
  Truck,
  Building2,
  BarChart2,
  ScanLine,
  Download,
  UserCog,
  ShieldCheck,
  FileClock
} from 'lucide-react';
import { 
  subscribeToHazards, 
  updateHazardStatus, 
  dispatchCrewToHazard,
  seedInitialHazards 
} from './services/hazardService';
import { GeospatialCommandMap } from './components/GeospatialCommandMap';
import { WardTriageQueue } from './components/WardTriageQueue';
import { DispatchCrewModal } from './components/DispatchCrewModal';
import { AiAggregatorConsole } from './components/AiAggregatorConsole';
import { ReliefDeskView } from './components/ReliefDeskView';
import { CouncilTicketsView } from './components/CouncilTicketsView';
import { TacticalRadarView } from './components/TacticalRadarView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminManagementView } from './components/AdminManagementView';
import { UserManagementView } from './components/UserManagementView';
import { LogonActivitiesView } from './components/LogonActivitiesView';
import type { HazardDocument } from './types/models';
import './App.css';

const initialHazards: HazardDocument[] = [
  {
    id: 'hz_9982341af',
    hazardId: 'hz_9982341af',
    reportedBy: 'usr_7726158bc',
    reporterName: 'MRA Hasen',
    reporterTrustScore: 98,
    category: 'SEVERE_FLOOD',
    coordinates: { latitude: 6.9271, longitude: 79.8612 },
    geohash: 'tc3p18u',
    ward: 'Sector 4B - Ward 12 Riverbank',
    mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    aiAnalysis: {
      imageConfidence: 0.94,
      hazardDetected: 'SEVERE_FLOOD',
      isAuthentic: true,
      locationMatch: true,
      weatherSupport: true,
      clusterCount: 5,
      urgencyScore: 8.9,
      assignedStatus: 'AREA_ALERT',
      reasoning: 'Monsoon precipitation models correlate with 5 independent reports within 150m.',
    },
    status: 'AREA_ALERT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hz_8812903bc',
    hazardId: 'hz_8812903bc',
    reportedBy: 'usr_3381921de',
    reporterName: 'Field Inspector David',
    reporterTrustScore: 94,
    category: 'POWER_HAZARD',
    coordinates: { latitude: 6.9312, longitude: 79.8584 },
    geohash: 'tc3p19a',
    ward: 'Crossway Blvd & 5th Ave',
    mediaUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
    aiAnalysis: {
      imageConfidence: 0.88,
      hazardDetected: 'LIVE_POWER_LINE',
      isAuthentic: true,
      locationMatch: true,
      weatherSupport: false,
      clusterCount: 3,
      urgencyScore: 7.6,
      assignedStatus: 'COUNCIL_TICKET',
      reasoning: 'Exposed high-voltage cable detected on pedestrian sidewalk.',
    },
    status: 'COUNCIL_TICKET',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hz_7719284cd',
    hazardId: 'hz_7719284cd',
    reportedBy: 'usr_9918237fa',
    reporterName: 'Citizen Sarah',
    reporterTrustScore: 89,
    category: 'BLOCKED_ROAD',
    coordinates: { latitude: 6.9405, longitude: 79.8701 },
    geohash: 'tc3p20b',
    ward: 'North Arterial Bypass - KM 14',
    mediaUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    aiAnalysis: {
      imageConfidence: 0.81,
      hazardDetected: 'DEBRIS_OBSTRUCTION',
      isAuthentic: true,
      locationMatch: true,
      weatherSupport: true,
      clusterCount: 2,
      urgencyScore: 6.4,
      assignedStatus: 'PUBLISHED',
      reasoning: 'Roadway blocked by fallen mud and debris, diverting commuter traffic.',
    },
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hz_6601928de',
    hazardId: 'hz_6601928de',
    reportedBy: 'usr_1029384bb',
    reporterName: 'Anonymous Citizen',
    reporterTrustScore: 65,
    category: 'FALLEN_TREE',
    coordinates: { latitude: 6.9150, longitude: 79.8650 },
    geohash: 'tc3p12x',
    ward: 'Highland Ridge Way',
    mediaUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    aiAnalysis: {
      imageConfidence: 0.62,
      hazardDetected: 'FALLEN_BRANCH',
      isAuthentic: true,
      locationMatch: false,
      weatherSupport: true,
      clusterCount: 1,
      urgencyScore: 4.8,
      assignedStatus: 'NEED_MORE_INFO',
      reasoning: 'Single report with weak EXIF GPS correlation. Verification dispatched to nearby citizens.',
    },
    status: 'NEED_MORE_INFO',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hazards, setHazards] = useState<HazardDocument[]>(initialHazards);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'triage' | 'ai' | 'relief' | 'tickets' | 'radar' | 'analytics' | 'admins' | 'users' | 'logs'>('overview');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Map and Dispatch selection state
  const [selectedMapHazard, setSelectedMapHazard] = useState<HazardDocument | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [targetDispatchHazard, setTargetDispatchHazard] = useState<HazardDocument | null>(null);

  // Sync theme attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Subscribe to real-time Firestore hazards collection
  useEffect(() => {
    const unsubscribe = subscribeToHazards((remoteHazards) => {
      if (remoteHazards.length > 0) {
        setHazards(remoteHazards);
        setIsFirebaseSynced(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    try {
      await seedInitialHazards(initialHazards);
      setIsFirebaseSynced(true);
    } catch (e) {
      console.error('Firebase sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStatusChange = async (hazardId: string, newStatus: HazardDocument['status']) => {
    setHazards((prev) => 
      prev.map((h) => (h.hazardId === hazardId ? { ...h, status: newStatus } : h))
    );
    try {
      await updateHazardStatus(hazardId, newStatus);
    } catch (e) {
      console.warn('Updated locally, Firestore error:', e);
    }
  };

  const handleOpenDispatchModal = (hazard: HazardDocument) => {
    setTargetDispatchHazard(hazard);
    setIsDispatchModalOpen(true);
  };

  const handleDispatchCrew = async (hazardId: string, crewId: string, notes: string) => {
    setHazards((prev) =>
      prev.map((h) =>
        h.hazardId === hazardId
          ? { ...h, status: 'DISPATCHED', assignedCrewId: crewId, dispatchNotes: notes }
          : h
      )
    );
    try {
      await dispatchCrewToHazard(hazardId, crewId, notes);
    } catch (e) {
      console.warn('Dispatched locally, Firestore error:', e);
    }
  };

  const handleViewOnMap = (hazard: HazardDocument) => {
    setSelectedMapHazard(hazard);
    setActiveTab('map');
  };

  const handleExportCSV = () => {
    const headers = 'Hazard ID,Status,Category,Ward,Reporter,Urgency Score,AI Confidence,Created At\n';
    const rows = hazards.map(h => 
      `${h.hazardId},${h.status},${h.category},"${h.ward}","${h.reporterName || 'Unknown'}",${h.aiAnalysis?.urgencyScore || ''},${h.aiAnalysis?.imageConfidence || ''},${h.createdAt}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `disastershield_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const filteredHazards = selectedFilter === 'ALL' 
    ? hazards 
    : hazards.filter(h => h.status === selectedFilter);

  const getCategoryIcon = (category: HazardDocument['category']) => {
    switch (category) {
      case 'SEVERE_FLOOD':
        return <Droplets style={{ width: '18px', height: '18px', color: '#3B82F6' }} />;
      case 'POWER_HAZARD':
        return <Zap style={{ width: '18px', height: '18px', color: '#F59E0B' }} />;
      case 'FALLEN_TREE':
        return <Flame style={{ width: '18px', height: '18px', color: '#10B981' }} />;
      case 'BLOCKED_ROAD':
        return <AlertTriangle style={{ width: '18px', height: '18px', color: '#EF4444' }} />;
      default:
        return <AlertTriangle style={{ width: '18px', height: '18px' }} />;
    }
  };

  const getStatusBadge = (status: HazardDocument['status']) => {
    let bg = 'var(--badge-info-bg)';
    let color = 'var(--badge-info-text)';
    let label: string = status;

    if (status === 'AREA_ALERT') {
      bg = 'var(--badge-alert-bg)';
      color = 'var(--badge-alert-text)';
      label = 'Area Alert';
    } else if (status === 'COUNCIL_TICKET') {
      bg = 'var(--badge-ticket-bg)';
      color = 'var(--badge-ticket-text)';
      label = 'Council Ticket';
    } else if (status === 'PUBLISHED') {
      bg = 'var(--badge-published-bg)';
      color = 'var(--badge-published-text)';
      label = 'Published';
    } else if (status === 'DISPATCHED') {
      bg = 'var(--btn-bg)';
      color = 'var(--btn-text)';
      label = 'Dispatched';
    } else if (status === 'RESOLVED') {
      bg = '#D1FAE5';
      color = '#059669';
      label = 'Resolved';
    } else if (status === 'NEED_MORE_INFO') {
      bg = 'var(--badge-info-bg)';
      color = 'var(--badge-info-text)';
      label = 'Need More Info';
    }

    return (
      <span style={{ 
        backgroundColor: bg, 
        color: color, 
        padding: '4px 10px', 
        borderRadius: '6px', 
        fontSize: '11px', 
        fontWeight: 700,
        border: '1px solid currentColor',
        whiteSpace: 'nowrap'
      }}>
        {label}
      </span>
    );
  };

  // Helper to build nav button className
  const navClass = (tab: string, special?: string) => {
    if (special === 'radar') return `nav-btn${activeTab === tab ? ' active-radar' : ''}`;
    return `nav-btn${activeTab === tab ? ' active' : ''}`;
  };

  return (
    <div className="app-shell">

      {/* ── SIDEBAR ───────────────────────────────────── */}
      <aside className="sidebar">

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <ShieldAlert style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <div className="logo-text">
              <h1>DisasterShield</h1>
              <span>Command v6.0</span>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Light / Dark mode">
            {theme === 'light'
              ? <Moon style={{ width: '14px', height: '14px' }} />
              : <Sun  style={{ width: '14px', height: '14px' }} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Operations</div>

          <button className={navClass('overview')} onClick={() => setActiveTab('overview')}>
            <Activity style={{ width: '16px', height: '16px' }} /><span>Overview</span>
          </button>
          <button className={navClass('map')} onClick={() => setActiveTab('map')}>
            <MapPin style={{ width: '16px', height: '16px' }} /><span>Geospatial Radar</span>
          </button>
          <button className={navClass('triage')} onClick={() => setActiveTab('triage')}>
            <Truck style={{ width: '16px', height: '16px' }} /><span>Ward Triage &amp; Dispatch</span>
          </button>
          <button className={navClass('ai')} onClick={() => setActiveTab('ai')}>
            <Cpu style={{ width: '16px', height: '16px' }} /><span>AI Aggregator</span>
          </button>
          <button className={navClass('relief')} onClick={() => setActiveTab('relief')}>
            <Building2 style={{ width: '16px', height: '16px' }} /><span>Relief &amp; Shelters</span>
          </button>
          <button className={navClass('tickets')} onClick={() => setActiveTab('tickets')}>
            <FileText style={{ width: '16px', height: '16px' }} /><span>Council Tickets</span>
          </button>

          <div className="nav-divider" />
          <div className="nav-section-label">Intelligence</div>

          <button className={navClass('radar', 'radar')} onClick={() => setActiveTab('radar')}>
            <ScanLine style={{ width: '16px', height: '16px' }} /><span>Tactical Radar</span>
          </button>
          <button className={navClass('analytics')} onClick={() => setActiveTab('analytics')}>
            <BarChart2 style={{ width: '16px', height: '16px' }} /><span>Analytics</span>
          </button>

          <div className="nav-divider" />
          <div className="nav-section-label">System Admin</div>

          <button className={navClass('admins')} onClick={() => setActiveTab('admins')}>
            <ShieldCheck style={{ width: '16px', height: '16px' }} /><span>Administrators</span>
          </button>
          <button className={navClass('users')} onClick={() => setActiveTab('users')}>
            <UserCog style={{ width: '16px', height: '16px' }} /><span>User Management</span>
          </button>
          <button className={navClass('logs')} onClick={() => setActiveTab('logs')}>
            <FileClock style={{ width: '16px', height: '16px' }} /><span>Logon Activities</span>
          </button>
        </nav>

        {/* Firebase Status */}
        <div className="sidebar-footer">
          <div className="db-status-card">
            <div className="db-status-row">
              <span className="db-dot" />
              <span className="db-label">Firebase Connected</span>
            </div>
            <p className="db-id">disastershield-a23cf</p>
            <button
              onClick={handleSyncToFirebase}
              disabled={isSyncing}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isSyncing
                ? <RefreshCw style={{ width: '12px', height: '12px' }} className="animate-spin" />
                : <Database  style={{ width: '12px', height: '12px' }} />}
              <span>{isFirebaseSynced ? 'Synced ✓' : 'Sync Demo Data'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────── */}
      <div className="main-content">

        {/* Sticky Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h2 className="page-title">
              {activeTab === 'overview'  && 'Municipal Emergency Operations'}
              {activeTab === 'map'       && 'Geospatial Radar & Live Heatmap'}
              {activeTab === 'triage'    && 'Ward Incident Triage & Field Dispatch'}
              {activeTab === 'ai'        && 'Hazard Aggregator AI Multi-Layer Engine'}
              {activeTab === 'relief'    && 'Municipal Relief Desk & Shelter Allocations'}
              {activeTab === 'tickets'   && 'Municipal Authority Work Orders'}
              {activeTab === 'radar'     && 'Tactical Radar — Live Contact Tracking'}
              {activeTab === 'analytics' && 'Analytics & Data Intelligence Dashboard'}
              {activeTab === 'admins'    && 'System Administrators'}
              {activeTab === 'users'     && 'User Management & Trust Scores'}
              {activeTab === 'logs'      && 'Security Audit & Logon Activities'}
            </h2>
            <p className="page-subtitle">
              AI Aggregator Pipeline &bull; Real-Time Dispatch System &bull; Metropolitan Zone 01
            </p>
          </div>

          <div className="header-actions">
            <button className="btn-secondary" onClick={handleExportCSV} title="Export as CSV/Excel">
              <Download style={{ width: '14px', height: '14px' }} />
              <span>CSV</span>
            </button>
            <button className="btn-secondary" onClick={handleExportPDF} title="Export as PDF">
              <FileText style={{ width: '14px', height: '14px' }} />
              <span>PDF</span>
            </button>
            <button className="sos-badge" onClick={() => setActiveTab('map')}>
              <Radio style={{ width: '13px', height: '13px' }} className="animate-pulse" />
              <span>1 Live SOS</span>
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                const urgent = hazards.find(h => (h.aiAnalysis?.urgencyScore ?? 0) >= 7.5) || hazards[0];
                if (urgent) handleOpenDispatchModal(urgent);
              }}
            >
              <span>Dispatch Crew</span>
              <ArrowUpRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-area" key={activeTab}>

          {/* ── TAB 1: OVERVIEW ──────────────────────── */}
          {activeTab === 'overview' && (
            <div>
              {/* 4 Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>

                <div className="stat-card animate-fade-up">
                  <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <AlertTriangle style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                  </div>
                  <div className="stat-label">Active Hazards</div>
                  <div className="stat-value" style={{ color: '#EF4444' }}>{hazards.length}</div>
                  <div className="stat-sub">Live in Firestore</div>
                </div>

                <div className="stat-card animate-fade-up anim-delay-1">
                  <div className="stat-icon" style={{ background: 'rgba(91,139,255,0.1)' }}>
                    <Cpu style={{ width: '18px', height: '18px', color: 'var(--accent)' }} />
                  </div>
                  <div className="stat-label">AI Confidence Avg</div>
                  <div className="stat-value" style={{ color: 'var(--accent)' }}>
                    {hazards.length > 0
                      ? `${(hazards.reduce((acc, h) => acc + (h.aiAnalysis?.imageConfidence || 0), 0) / hazards.length * 100).toFixed(1)}%`
                      : '92.4%'}
                  </div>
                  <div className="stat-sub">EXIF &amp; DBSCAN verified</div>
                </div>

                <div className="stat-card animate-fade-up anim-delay-2">
                  <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <Users style={{ width: '18px', height: '18px', color: '#10B981' }} />
                  </div>
                  <div className="stat-label">Active Field Crews</div>
                  <div className="stat-value" style={{ color: '#10B981' }}>18 / 24</div>
                  <div className="stat-sub">6 standby units</div>
                </div>

                <div className="stat-card animate-fade-up anim-delay-3">
                  <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <FileText style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
                  </div>
                  <div className="stat-label">Council Tickets</div>
                  <div className="stat-value" style={{ color: '#F59E0B' }}>
                    {hazards.filter(h => h.status === 'COUNCIL_TICKET').length}
                  </div>
                  <div className="stat-sub">Auto-routed</div>
                </div>
              </div>

              {/* Geospatial Banner */}
              <div
                onClick={() => setActiveTab('map')}
                className="minimal-card animate-fade-up"
                style={{
                  padding: '20px 24px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--accent-light), transparent)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--btn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--accent-glow)' }}>
                    <MapPin style={{ width: '20px', height: '20px', color: '#fff' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                      Open Geospatial Command Radar &amp; Heatmaps
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      Visualize spatial density rings, multi-ward geofencing, and standby crew units.
                    </p>
                  </div>
                </div>
                <button className="btn-primary" style={{ pointerEvents: 'none' }}>
                  <span>Launch Map</span>
                  <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>

              {/* Hazard Feed */}
              <section className="minimal-card animate-fade-up" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
                      Frontline Hazard Ingestion Feed
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Live AI scoring &bull; 4-channel routing: Need Info &bull; Published &bull; Area Alert &bull; Council Ticket
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <Filter style={{ width: '13px', height: '13px', color: 'var(--text-muted)', marginRight: '2px' }} />
                    {['ALL', 'AREA_ALERT', 'COUNCIL_TICKET', 'PUBLISHED', 'NEED_MORE_INFO'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFilter(f)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: selectedFilter === f ? 'var(--btn-bg)' : 'var(--btn-secondary-bg)',
                          color: selectedFilter === f ? 'var(--btn-text)' : 'var(--text-secondary)',
                          border: `1px solid ${selectedFilter === f ? 'transparent' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                        }}
                      >
                        {f === 'ALL' ? 'All' : f.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredHazards.map((h) => (
                    <div key={h.hazardId} className="feed-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          padding: '9px',
                          borderRadius: '10px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {getCategoryIcon(h.category)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>{h.ward}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{h.hazardId}</span>
                            {h.reporterName && (
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>• {h.reporterName}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            <span>Urgency <strong>{h.aiAnalysis?.urgencyScore || 'N/A'}/10</strong></span>
                            <span>AI <strong>{((h.aiAnalysis?.imageConfidence || 0) * 100).toFixed(0)}%</strong></span>
                            <span>Cluster <strong>{h.aiAnalysis?.clusterCount || 1}</strong></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock style={{ width: '10px', height: '10px' }} /> {h.createdAt.slice(11, 16)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusBadge(h.status)}
                        <button onClick={() => handleOpenDispatchModal(h)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>
                          <Truck style={{ width: '12px', height: '12px' }} /><span>Dispatch</span>
                        </button>
                        <button onClick={() => handleViewOnMap(h)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '11px' }}>
                          View Map
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── TAB 2: MAP ───────────────────────────── */}
          {activeTab === 'map' && (
            <GeospatialCommandMap
              hazards={hazards}
              theme={theme}
              onSelectHazard={(h) => setSelectedMapHazard(h)}
              selectedHazard={selectedMapHazard}
              onOpenDispatchModal={(h) => handleOpenDispatchModal(h)}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* ── TAB 3: TRIAGE ────────────────────────── */}
          {activeTab === 'triage' && (
            <WardTriageQueue
              hazards={hazards}
              onOpenDispatchModal={(h) => handleOpenDispatchModal(h)}
              onStatusChange={handleStatusChange}
              onViewOnMap={(h) => handleViewOnMap(h)}
            />
          )}

          {/* ── TAB 4: AI ────────────────────────────── */}
          {activeTab === 'ai' && (
            <AiAggregatorConsole hazards={hazards} onStatusChange={handleStatusChange} />
          )}

          {/* ── TAB 5: RELIEF ────────────────────────── */}
          {activeTab === 'relief' && <ReliefDeskView />}

          {/* ── TAB 6: TICKETS ───────────────────────── */}
          {activeTab === 'tickets' && (
            <CouncilTicketsView hazards={hazards} onStatusChange={handleStatusChange} />
          )}

          {/* ── TAB 7: TACTICAL RADAR ────────────────── */}
          {activeTab === 'radar' && (
            <TacticalRadarView hazards={hazards} theme={theme} />
          )}

          {/* ── TAB 8: ANALYTICS ─────────────────────── */}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard hazards={hazards} theme={theme} />
          )}

          {/* ── TAB 9: ADMINS ────────────────────────── */}
          {activeTab === 'admins' && <AdminManagementView />}

          {/* ── TAB 10: USERS ────────────────────────── */}
          {activeTab === 'users' && <UserManagementView />}

          {/* ── TAB 11: LOGS ─────────────────────────── */}
          {activeTab === 'logs' && <LogonActivitiesView />}

        </main>
      </div>

      {/* Dispatch Modal */}
      <DispatchCrewModal
        isOpen={isDispatchModalOpen}
        onClose={() => { setIsDispatchModalOpen(false); setTargetDispatchHazard(null); }}
        hazard={targetDispatchHazard}
        onDispatch={handleDispatchCrew}
      />
    </div>
  );
}

export default App;
