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
  CheckCircle, 
  Filter,
  Truck
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
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'triage' | 'ai' | 'tickets'>('overview');
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar Minimalist */}
      <aside style={{ 
        width: '260px', 
        borderRight: '1px solid var(--border-subtle)', 
        padding: '24px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        backgroundColor: 'var(--bg-secondary)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '6px', 
              background: 'var(--btn-bg)', 
              color: 'var(--btn-text)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <ShieldAlert style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>DisasterShield</h1>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Command v6.0</span>
            </div>
          </div>

          <button 
            onClick={toggleTheme}
            title="Toggle Light / Dark mode"
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '6px', 
              background: 'var(--bg-card)', 
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'light' ? <Moon style={{ width: '15px', height: '15px' }} /> : <Sun style={{ width: '15px', height: '15px' }} />}
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', 
              background: activeTab === 'overview' ? 'var(--btn-bg)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--btn-text)' : 'var(--text-secondary)',
              border: 'none', textAlign: 'left', fontWeight: 600, fontSize: '13px'
            }}
          >
            <Activity style={{ width: '16px', height: '16px' }} />
            <span>Overview</span>
          </button>

          <button 
            onClick={() => setActiveTab('map')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', 
              background: activeTab === 'map' ? 'var(--btn-bg)' : 'transparent',
              color: activeTab === 'map' ? 'var(--btn-text)' : 'var(--text-secondary)',
              border: 'none', textAlign: 'left', fontWeight: 600, fontSize: '13px'
            }}
          >
            <MapPin style={{ width: '16px', height: '16px' }} />
            <span>Geospatial Radar</span>
          </button>

          <button 
            onClick={() => setActiveTab('triage')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', 
              background: activeTab === 'triage' ? 'var(--btn-bg)' : 'transparent',
              color: activeTab === 'triage' ? 'var(--btn-text)' : 'var(--text-secondary)',
              border: 'none', textAlign: 'left', fontWeight: 600, fontSize: '13px'
            }}
          >
            <Truck style={{ width: '16px', height: '16px' }} />
            <span>Ward Triage & Dispatch</span>
          </button>

          <button 
            onClick={() => setActiveTab('ai')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', 
              background: activeTab === 'ai' ? 'var(--btn-bg)' : 'transparent',
              color: activeTab === 'ai' ? 'var(--btn-text)' : 'var(--text-secondary)',
              border: 'none', textAlign: 'left', fontWeight: 600, fontSize: '13px'
            }}
          >
            <Cpu style={{ width: '16px', height: '16px' }} />
            <span>AI Aggregator</span>
          </button>

          <button 
            onClick={() => setActiveTab('tickets')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '6px', 
              background: activeTab === 'tickets' ? 'var(--btn-bg)' : 'transparent',
              color: activeTab === 'tickets' ? 'var(--btn-text)' : 'var(--text-secondary)',
              border: 'none', textAlign: 'left', fontWeight: 600, fontSize: '13px'
            }}
          >
            <FileText style={{ width: '16px', height: '16px' }} />
            <span>Council Tickets</span>
          </button>
        </nav>

        {/* Database & Cloud Sync */}
        <div style={{ marginTop: 'auto', padding: '14px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>Firebase Connected</span>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0 0 10px 0', fontFamily: 'var(--font-mono)' }}>
            disastershield-a23cf
          </p>
          <button
            onClick={handleSyncToFirebase}
            disabled={isSyncing}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isSyncing ? <RefreshCw style={{ width: '12px', height: '12px' }} className="animate-spin" /> : <Database style={{ width: '12px', height: '12px' }} />}
            <span>{isFirebaseSynced ? 'Firebase Synced' : 'Sync Demo Data'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Top Telemetry Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              {activeTab === 'overview' && 'Municipal Emergency Operations'}
              {activeTab === 'map' && 'Geospatial Radar & Live Heatmap'}
              {activeTab === 'triage' && 'Ward Incident Triage & Field Dispatch'}
              {activeTab === 'ai' && 'Hazard Aggregator AI Multi-Layer Engine'}
              {activeTab === 'tickets' && 'Municipal Authority Work Orders'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              AI Aggregator Pipeline • Real-Time Dispatch System • Metropolitan Zone 01
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('map')}
              className="btn-secondary"
            >
              <Radio style={{ width: '14px', height: '14px', color: '#EF4444' }} className="animate-pulse" />
              <span>1 Live SOS Signal</span>
            </button>
            <button 
              onClick={() => {
                const urgent = hazards.find(h => (h.aiAnalysis?.urgencyScore ?? 0) >= 7.5) || hazards[0];
                if (urgent) handleOpenDispatchModal(urgent);
              }}
              className="btn-primary"
            >
              <span>Dispatch Field Crew</span>
              <ArrowUpRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* 4 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <div className="minimal-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Active Hazards</span>
                  <AlertTriangle style={{ width: '16px', height: '16px' }} />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800 }}>{hazards.length}</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Live in Firestore</span>
              </div>

              <div className="minimal-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>AI Confidence Avg</span>
                  <Cpu style={{ width: '16px', height: '16px' }} />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800 }}>
                  {hazards.length > 0 
                    ? `${(hazards.reduce((acc, h) => acc + (h.aiAnalysis?.imageConfidence || 0), 0) / hazards.length * 100).toFixed(1)}%` 
                    : '92.4%'}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EXIF & DBSCAN checked</span>
              </div>

              <div className="minimal-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Active Field Crews</span>
                  <Users style={{ width: '16px', height: '16px' }} />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800 }}>18 / 24</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>6 standby units</span>
              </div>

              <div className="minimal-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Council Tickets</span>
                  <FileText style={{ width: '16px', height: '16px' }} />
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800 }}>
                  {hazards.filter(h => h.status === 'COUNCIL_TICKET').length}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Auto-routed</span>
              </div>
            </div>

            {/* Quick Geospatial Teaser Banner */}
            <div 
              onClick={() => setActiveTab('map')}
              className="minimal-card"
              style={{
                padding: '20px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--btn-bg)', color: 'var(--btn-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0' }}>
                    Open Geospatial Command Radar & Heatmaps
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Visualize spatial density rings, multi-ward geofencing, and standby crew units across metropolitan zone.
                  </p>
                </div>
              </div>
              <button className="btn-primary" style={{ pointerEvents: 'none' }}>
                <span>Launch Map</span>
                <ArrowUpRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>

            {/* Hazard Triage Summary Feed */}
            <section className="minimal-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                    Frontline Hazard Ingestion Feed
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Live AI scoring • 4-channel routing: Need Info • Published • Area Alert • Council Ticket
                  </p>
                </div>

                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <Filter style={{ width: '14px', height: '14px', color: 'var(--text-muted)', marginRight: '4px' }} />
                  {['ALL', 'AREA_ALERT', 'COUNCIL_TICKET', 'PUBLISHED', 'NEED_MORE_INFO'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: selectedFilter === f ? 'var(--btn-bg)' : 'var(--bg-secondary)',
                        color: selectedFilter === f ? 'var(--btn-text)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer'
                      }}
                    >
                      {f === 'ALL' ? 'All' : f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredHazards.map((h) => (
                  <div 
                    key={h.hazardId}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '14px 18px', 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ 
                        padding: '8px', 
                        borderRadius: '6px', 
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border-subtle)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {getCategoryIcon(h.category)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>{h.ward}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{h.hazardId}</span>
                          {h.reporterName && (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>• reported by {h.reporterName}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <span>Urgency: <strong>{h.aiAnalysis?.urgencyScore || 'N/A'}/10</strong></span>
                          <span>AI Confidence: <strong>{((h.aiAnalysis?.imageConfidence || 0) * 100).toFixed(0)}%</strong></span>
                          <span>Cluster: <strong>{h.aiAnalysis?.clusterCount || 1} report(s)</strong></span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock style={{ width: '11px', height: '11px' }} /> {h.createdAt.slice(11, 16)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {getStatusBadge(h.status)}
                      <button 
                        onClick={() => handleOpenDispatchModal(h)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >
                        <Truck style={{ width: '12px', height: '12px' }} />
                        <span>Dispatch</span>
                      </button>
                      <button 
                        onClick={() => handleViewOnMap(h)}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                      >
                        <span>View Map</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: GEOSPATIAL MAP & RADAR */}
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

        {/* TAB 3: WARD TRIAGE & DISPATCH */}
        {activeTab === 'triage' && (
          <WardTriageQueue
            hazards={hazards}
            onOpenDispatchModal={(h) => handleOpenDispatchModal(h)}
            onStatusChange={handleStatusChange}
            onViewOnMap={(h) => handleViewOnMap(h)}
          />
        )}

        {/* TAB 4: AI AGGREGATOR PIPELINE MATRIX */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="minimal-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Cpu style={{ width: '22px', height: '22px' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                    Hazard Aggregator AI Multi-Stage Pipeline
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {"Ingests multi-modal ground evidence and evaluates risk score: Risk(u) = w₁·R_type + w₂·P_risk + w₃·Water_trend"}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>1. Image Authenticity</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>98.2% Pass</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                    MobileNetV2 filters blurry, internet stock photos, or unrelated scenes.
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>2. DBSCAN Spatial Clustering</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#3B82F6' }}>&lt; 200m Radius</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                    Merges co-located citizen reports into unified incident clusters.
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>3. Weather & Sensor AI</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B' }}>14 Gauge Correlated</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                    Cross-references precipitation radar and river sensor surge rates.
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>4. 4-Channel Decision</div>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>Auto-Routed</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                    Need Info (45-75%), Published (&gt;75%), Area Alert, Council Ticket.
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Breakdown Table */}
            <div className="minimal-card" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>
                Recent Automated AI Decisions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {hazards.map((h) => (
                  <div
                    key={h.hazardId}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{h.ward} ({h.hazardId})</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>
                        "{h.aiAnalysis?.reasoning}"
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                        Score: {h.aiAnalysis?.urgencyScore ?? 7}/10
                      </span>
                      {getStatusBadge(h.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COUNCIL TICKETS */}
        {activeTab === 'tickets' && (
          <div className="minimal-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                  Municipal Council Work Orders & Infrastructure Tickets
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Auto-routed to Electrical Grid Authority, Municipal Drainage Works, and Urban Forestry
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {hazards.filter(h => h.status === 'COUNCIL_TICKET').length} Assigned Tickets
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hazards.filter(h => h.status === 'COUNCIL_TICKET').map((h) => (
                <div
                  key={h.hazardId}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px' }}>WO-{h.hazardId.toUpperCase()}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {h.ward}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      Classification: <strong>{h.category.replace('_', ' ')}</strong> — {h.aiAnalysis?.reasoning}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      Assigned: Municipal Engineering Division
                    </span>
                    <button
                      onClick={() => handleStatusChange(h.hazardId, 'RESOLVED')}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      <CheckCircle style={{ width: '12px', height: '12px' }} />
                      <span>Complete Work Order</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Dispatch Crew Modal Dialog */}
      <DispatchCrewModal
        isOpen={isDispatchModalOpen}
        onClose={() => {
          setIsDispatchModalOpen(false);
          setTargetDispatchHazard(null);
        }}
        hazard={targetDispatchHazard}
        onDispatch={handleDispatchCrew}
      />
    </div>
  );
}

export default App;
