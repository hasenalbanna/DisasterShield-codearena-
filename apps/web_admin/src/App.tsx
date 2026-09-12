import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Droplets, 
  Zap, 
  FileText, 
  Users, 
  ArrowUpRight,
  Cpu,
  Database,
  RefreshCw
} from 'lucide-react';
import { subscribeToHazards, updateHazardStatus, seedInitialHazards } from './services/hazardService';
import type { HazardDocument } from './types/models';

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
  const [hazards, setHazards] = useState<HazardDocument[]>(initialHazards);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'ai' | 'tickets'>('overview');
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
      console.warn('Updated locally, Firestore update error:', e);
    }
  };

  const getCategoryIcon = (category: HazardDocument['category']) => {
    switch (category) {
      case 'SEVERE_FLOOD':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'POWER_HAZARD':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'FALLEN_TREE':
        return <Flame className="w-5 h-5 text-emerald-400" />;
      case 'BLOCKED_ROAD':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: HazardDocument['status']) => {
    switch (status) {
      case 'AREA_ALERT':
        return <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Area Alert</span>;
      case 'COUNCIL_TICKET':
        return <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Council Ticket</span>;
      case 'PUBLISHED':
        return <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Published</span>;
      case 'NEED_MORE_INFO':
        return <span style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#CBD5E1', border: '1px solid rgba(148, 163, 184, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Need More Info</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-300">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0E17', color: '#F8FAFC' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: '280px', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(59,130,246,0.5)' }}>
            <ShieldAlert style={{ width: '24px', height: '24px', color: '#FFF' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>DisasterShield</h1>
            <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Command Center v6.0</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', 
              background: activeTab === 'overview' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'overview' ? '#60A5FA' : '#94A3B8',
              border: activeTab === 'overview' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              textAlign: 'left', fontWeight: 500
            }}
          >
            <Activity style={{ width: '18px', height: '18px' }} />
            <span>Command Overview</span>
          </button>

          <button 
            onClick={() => setActiveTab('map')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', 
              background: activeTab === 'map' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'map' ? '#60A5FA' : '#94A3B8',
              border: activeTab === 'map' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              textAlign: 'left', fontWeight: 500
            }}
          >
            <MapPin style={{ width: '18px', height: '18px' }} />
            <span>Live Geospatial Map</span>
          </button>

          <button 
            onClick={() => setActiveTab('ai')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', 
              background: activeTab === 'ai' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'ai' ? '#60A5FA' : '#94A3B8',
              border: activeTab === 'ai' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              textAlign: 'left', fontWeight: 500
            }}
          >
            <Cpu style={{ width: '18px', height: '18px' }} />
            <span>Hazard Aggregator AI</span>
          </button>

          <button 
            onClick={() => setActiveTab('tickets')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', 
              background: activeTab === 'tickets' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === 'tickets' ? '#60A5FA' : '#94A3B8',
              border: activeTab === 'tickets' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              textAlign: 'left', fontWeight: 500
            }}
          >
            <FileText style={{ width: '18px', height: '18px' }} />
            <span>Council Tickets & Relief</span>
          </button>
        </nav>

        {/* Cloud & AI Status */}
        <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} className="pulse-emerald" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#34D399' }}>Firebase Firestore</span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 10px 0' }}>Project: disastershield-a23cf</p>
          <button
            onClick={handleSyncToFirebase}
            disabled={isSyncing}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px',
              background: isFirebaseSynced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${isFirebaseSynced ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
              borderRadius: '8px',
              color: isFirebaseSynced ? '#34D399' : '#60A5FA',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
            <span>{isFirebaseSynced ? 'Firebase Synced' : 'Sync Demo Data'}</span>
          </button>
        </div>
      </aside>

      {/* Main Command Console Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header telemetry metrics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>Municipal Emergency Operations</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
              Live Firestore Sync • Storage Bucket: <code style={{ color: '#38BDF8' }}>disastershield-a23cf.firebasestorage.app</code>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', color: '#EF4444', fontWeight: 600 }}>
              <Radio className="w-4 h-4 pulse-crimson" />
              <span>1 Live SOS Signal</span>
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3B82F6', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 600, boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
              <span>Dispatch Field Crew</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>ACTIVE HAZARDS</span>
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>{hazards.length}</div>
            <span style={{ fontSize: '11px', color: '#10B981' }}>Live synchronized</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>AVG AI CONFIDENCE</span>
              <Cpu style={{ width: '18px', height: '18px', color: '#3B82F6' }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>
              {hazards.length > 0 
                ? `${(hazards.reduce((acc, h) => acc + (h.aiAnalysis?.imageConfidence || 0), 0) / hazards.length * 100).toFixed(1)}%` 
                : '92.4%'}
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>DBSCAN & EXIF verified</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>FIELD CREWS ON-SITE</span>
              <Users style={{ width: '18px', height: '18px', color: '#10B981' }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>18 / 24</div>
            <span style={{ fontSize: '11px', color: '#34D399' }}>6 standby teams</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>COUNCIL TICKETS</span>
              <FileText style={{ width: '18px', height: '18px', color: '#06B6D4' }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>
              {hazards.filter((h) => h.status === 'COUNCIL_TICKET').length}
            </div>
            <span style={{ fontSize: '11px', color: '#F59E0B' }}>Auto-routed by AI</span>
          </div>
        </div>

        {/* Hazard Aggregator AI Live Queue */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Hazard Aggregator AI Triage Feed</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                Automated 4-channel routing • Click actions to push Firestore updates
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#94A3B8' }}>
                {isFirebaseSynced ? '🟢 Connected to Firestore' : '🟡 Local Fallback Mode'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hazards.map((h) => (
              <div 
                key={h.hazardId}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px 20px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}>
                    {getCategoryIcon(h.category)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{h.ward}</span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>{h.hazardId}</span>
                      {h.reporterName && (
                        <span style={{ fontSize: '11px', color: '#38BDF8' }}>• by {h.reporterName}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#94A3B8' }}>
                      <span>Urgency: <strong style={{ color: (h.aiAnalysis?.urgencyScore || 0) > 7.5 ? '#EF4444' : '#F59E0B' }}>{h.aiAnalysis?.urgencyScore || 'N/A'}/10</strong></span>
                      <span>AI Conf: <strong style={{ color: '#38BDF8' }}>{((h.aiAnalysis?.imageConfidence || 0) * 100).toFixed(0)}%</strong></span>
                      <span>Cluster: <strong>{h.aiAnalysis?.clusterCount || 1} reports</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} /> {h.createdAt.slice(11, 16)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getStatusBadge(h.status)}
                  {h.status === 'NEED_MORE_INFO' && (
                    <button 
                      onClick={() => handleStatusChange(h.hazardId, 'PUBLISHED')}
                      style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34D399', fontSize: '11px', fontWeight: 600 }}
                    >
                      Approve & Publish
                    </button>
                  )}
                  {h.status === 'PUBLISHED' && (
                    <button 
                      onClick={() => handleStatusChange(h.hazardId, 'COUNCIL_TICKET')}
                      style={{ padding: '6px 12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', color: '#FBBF24', fontSize: '11px', fontWeight: 600 }}
                    >
                      Generate Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
