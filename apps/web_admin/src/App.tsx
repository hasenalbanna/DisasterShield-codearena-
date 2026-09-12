import { useState } from 'react';
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
  Cpu
} from 'lucide-react';

interface HazardItem {
  id: string;
  category: 'SEVERE_FLOOD' | 'FALLEN_TREE' | 'BLOCKED_ROAD' | 'POWER_HAZARD';
  location: string;
  urgency: number;
  confidence: number;
  status: 'PUBLISHED' | 'NEED_MORE_INFO' | 'AREA_ALERT' | 'COUNCIL_TICKET';
  time: string;
  clusterCount: number;
}

const initialHazards: HazardItem[] = [
  {
    id: 'hz_9982341af',
    category: 'SEVERE_FLOOD',
    location: 'Sector 4B - Ward 12 Riverbank',
    urgency: 8.9,
    confidence: 0.94,
    status: 'AREA_ALERT',
    time: '2 mins ago',
    clusterCount: 5,
  },
  {
    id: 'hz_8812903bc',
    category: 'POWER_HAZARD',
    location: 'Crossway Blvd & 5th Ave',
    urgency: 7.6,
    confidence: 0.88,
    status: 'COUNCIL_TICKET',
    time: '8 mins ago',
    clusterCount: 3,
  },
  {
    id: 'hz_7719284cd',
    category: 'BLOCKED_ROAD',
    location: 'North Arterial Bypass - KM 14',
    urgency: 6.4,
    confidence: 0.81,
    status: 'PUBLISHED',
    time: '15 mins ago',
    clusterCount: 2,
  },
  {
    id: 'hz_6601928de',
    category: 'FALLEN_TREE',
    location: 'Highland Ridge Way',
    urgency: 4.8,
    confidence: 0.62,
    status: 'NEED_MORE_INFO',
    time: '22 mins ago',
    clusterCount: 1,
  },
];

export function App() {
  const [hazards] = useState<HazardItem[]>(initialHazards);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'ai' | 'tickets'>('overview');

  const getCategoryIcon = (category: HazardItem['category']) => {
    switch (category) {
      case 'SEVERE_FLOOD':
        return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'POWER_HAZARD':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'FALLEN_TREE':
        return <Flame className="w-5 h-5 text-emerald-400" />;
      case 'BLOCKED_ROAD':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusBadge = (status: HazardItem['status']) => {
    switch (status) {
      case 'AREA_ALERT':
        return <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Area Alert</span>;
      case 'COUNCIL_TICKET':
        return <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Council Ticket</span>;
      case 'PUBLISHED':
        return <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Published</span>;
      case 'NEED_MORE_INFO':
        return <span style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#CBD5E1', border: '1px solid rgba(148, 163, 184, 0.4)' }} className="px-2.5 py-1 rounded-full text-xs font-semibold">Need More Info</span>;
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

        {/* System Health Status */}
        <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} className="pulse-emerald" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#34D399' }}>AI Pipeline Active</span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>All 6 inference stages operational</p>
        </div>
      </aside>

      {/* Main Command Console Content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header telemetry metrics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>Municipal Emergency Operations</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Real-time hazard telemetry & automated AI dispatch stream</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', color: '#EF4444', fontWeight: 600 }}>
              <Radio className="w-4 h-4 pulse-crimson" />
              <span>1 Live SOS Broadcast</span>
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3B82F6', border: 'none', borderRadius: '10px', color: '#FFF', fontWeight: 600, boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}>
              <span>Dispatch Unit</span>
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
            <div style={{ fontSize: '28px', fontWeight: 800 }}>42</div>
            <span style={{ fontSize: '11px', color: '#10B981' }}>+4 verified in last 30m</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>AI CONFIDENCE AVG</span>
              <Cpu style={{ width: '18px', height: '18px', color: '#3B82F6' }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>92.4%</div>
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
              <span style={{ fontSize: '12px', fontWeight: 500 }}>COUNCIL WORK ORDERS</span>
              <FileText style={{ width: '18px', height: '18px', color: '#06B6D4' }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>11</div>
            <span style={{ fontSize: '11px', color: '#F59E0B' }}>3 high priority</span>
          </div>
        </div>

        {/* Hazard Aggregator AI Live Queue */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Hazard Aggregator AI Triage Feed</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>Automated routing across Need Info, Published, Area Alert, and Council Ticket</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ fontSize: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#94A3B8' }}>Live Firestore Stream</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hazards.map((h) => (
              <div 
                key={h.id}
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
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{h.location}</span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>{h.id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#94A3B8' }}>
                      <span>Urgency: <strong style={{ color: h.urgency > 7.5 ? '#EF4444' : '#F59E0B' }}>{h.urgency}/10</strong></span>
                      <span>AI Conf: <strong style={{ color: '#38BDF8' }}>{(h.confidence * 100).toFixed(0)}%</strong></span>
                      <span>Cluster: <strong>{h.clusterCount} reports</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: '12px', height: '12px' }} /> {h.time}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {getStatusBadge(h.status)}
                  <button style={{ padding: '8px 14px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#60A5FA', fontSize: '12px', fontWeight: 600 }}>
                    Inspect
                  </button>
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
