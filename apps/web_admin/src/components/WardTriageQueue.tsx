import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Search, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Radio, 
  Droplets, 
  Zap, 
  Flame, 
  Clock, 
  ArrowUpDown
} from 'lucide-react';
import type { HazardDocument, HazardCategory, HazardStatus } from '../types/models';

interface WardTriageQueueProps {
  hazards: HazardDocument[];
  onOpenDispatchModal: (hazard: HazardDocument) => void;
  onStatusChange: (hazardId: string, status: HazardStatus) => Promise<void>;
  onViewOnMap: (hazard: HazardDocument) => void;
}

export const WardTriageQueue: React.FC<WardTriageQueueProps> = ({
  hazards,
  onOpenDispatchModal,
  onStatusChange,
  onViewOnMap,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortByUrgency, setSortByUrgency] = useState<boolean>(true);

  // Calculate Ward Aggregates
  const wardAggregates = useMemo(() => {
    const map = new Map<string, { count: number; maxUrgency: number; categories: Set<HazardCategory>; hasDispatched: boolean }>();
    hazards.forEach((h) => {
      const existing = map.get(h.ward) || { count: 0, maxUrgency: 0, categories: new Set<HazardCategory>(), hasDispatched: false };
      existing.count += 1;
      existing.maxUrgency = Math.max(existing.maxUrgency, h.aiAnalysis?.urgencyScore ?? 0);
      existing.categories.add(h.category);
      if (h.status === 'DISPATCHED') existing.hasDispatched = true;
      map.set(h.ward, existing);
    });
    return Array.from(map.entries()).map(([ward, stats]) => ({
      ward,
      count: stats.count,
      maxUrgency: stats.maxUrgency,
      categories: Array.from(stats.categories),
      hasDispatched: stats.hasDispatched,
    }));
  }, [hazards]);

  // Filtered & Sorted Hazards
  const filteredHazards = useMemo(() => {
    return hazards
      .filter((h) => {
        const matchesSearch =
          searchTerm === '' ||
          h.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.hazardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (h.reporterName && h.reporterName.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || h.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortByUrgency) {
          return (b.aiAnalysis?.urgencyScore ?? 0) - (a.aiAnalysis?.urgencyScore ?? 0);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [hazards, searchTerm, statusFilter, categoryFilter, sortByUrgency]);

  const getCategoryIcon = (category: HazardCategory) => {
    switch (category) {
      case 'SEVERE_FLOOD':
        return <Droplets style={{ width: '15px', height: '15px', color: '#3B82F6' }} />;
      case 'POWER_HAZARD':
        return <Zap style={{ width: '15px', height: '15px', color: '#F59E0B' }} />;
      case 'FALLEN_TREE':
        return <Flame style={{ width: '15px', height: '15px', color: '#10B981' }} />;
      case 'BLOCKED_ROAD':
        return <AlertTriangle style={{ width: '15px', height: '15px', color: '#EF4444' }} />;
      default:
        return <AlertTriangle style={{ width: '15px', height: '15px' }} />;
    }
  };

  const getStatusBadge = (status: HazardStatus) => {
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
      label = 'Need Info';
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          border: '1px solid currentColor',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Ward Breakdown Cards Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
              Municipal Ward Incident Densities
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time clustering & risk saturation across jurisdictional boundaries
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {wardAggregates.length} Monitored Wards
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {wardAggregates.map((w) => {
            const isSevere = w.maxUrgency >= 7.5;
            return (
              <div
                key={w.ward}
                className="minimal-card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderLeft: isSevere ? '3px solid #DC2626' : '3px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, maxWidth: '75%' }}>{w.ward}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isSevere ? '#FEE2E2' : 'var(--bg-secondary)',
                      color: isSevere ? '#DC2626' : 'var(--text-secondary)',
                      border: '1px solid currentColor',
                    }}
                  >
                    {w.maxUrgency.toFixed(1)}/10
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>{w.count} Active Case(s)</span>
                  <span style={{ color: w.hasDispatched ? '#10B981' : 'var(--text-muted)' }}>
                    {w.hasDispatched ? 'Unit En Route' : 'Pending Action'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Triage Queue Table Section */}
      <div className="minimal-card" style={{ padding: '20px' }}>
        {/* Filter Controls Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Filter by ward, ID, or citizen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Hazard Categories</option>
              <option value="SEVERE_FLOOD">Severe Flood</option>
              <option value="POWER_HAZARD">Power Hazard</option>
              <option value="BLOCKED_ROAD">Blocked Road</option>
              <option value="FALLEN_TREE">Fallen Tree</option>
              <option value="LANDSLIDE">Landslide</option>
              <option value="STRUCTURE_DAMAGE">Structure Damage</option>
            </select>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <Filter style={{ width: '14px', height: '14px', color: 'var(--text-muted)', marginRight: '2px' }} />
            {['ALL', 'AREA_ALERT', 'COUNCIL_TICKET', 'PUBLISHED', 'DISPATCHED', 'NEED_MORE_INFO', 'RESOLVED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: statusFilter === status ? 'var(--btn-bg)' : 'var(--bg-secondary)',
                  color: statusFilter === status ? 'var(--btn-text)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {status === 'ALL' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}

            <button
              onClick={() => setSortByUrgency(!sortByUrgency)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                marginLeft: '6px',
              }}
              title="Toggle sorting by Urgency or Recency"
            >
              <ArrowUpDown style={{ width: '12px', height: '12px' }} />
              <span>{sortByUrgency ? 'By Urgency' : 'By Recency'}</span>
            </button>
          </div>
        </div>

        {/* Triage Queue Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>HAZARD & LOCATION</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>TYPE</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>AI RISK / CLUSTER</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>ASSIGNMENT</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>COMMAND ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredHazards.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No hazards match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredHazards.map((hazard) => {
                  const urgency = hazard.aiAnalysis?.urgencyScore ?? 5;
                  const isHighRisk = urgency >= 7.5;
                  return (
                    <tr
                      key={hazard.hazardId}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease',
                      }}
                      className="triage-table-row"
                    >
                      {/* Location & ID */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 700 }}>{hazard.ward}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', color: 'var(--text-muted)', fontSize: '11px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{hazard.hazardId}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock style={{ width: '10px', height: '10px' }} />
                            {hazard.createdAt.slice(11, 16)}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          {getCategoryIcon(hazard.category)}
                          <span>{hazard.category.replace('_', ' ')}</span>
                        </div>
                      </td>

                      {/* AI Risk Score Bar & Clusters */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: isHighRisk ? '#DC2626' : 'inherit' }}>
                            {urgency.toFixed(1)}
                          </span>
                          <div
                            style={{
                              width: '60px',
                              height: '5px',
                              borderRadius: '3px',
                              backgroundColor: 'var(--border-subtle)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, urgency * 10)}%`,
                                height: '100%',
                                backgroundColor: isHighRisk ? '#DC2626' : 'var(--text-primary)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            ({hazard.aiAnalysis?.clusterCount ?? 1} clustered)
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '14px' }}>{getStatusBadge(hazard.status)}</td>

                      {/* Crew Assignment */}
                      <td style={{ padding: '14px' }}>
                        {hazard.assignedCrewId ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#10B981' }}>
                            <Truck style={{ width: '13px', height: '13px' }} />
                            <span>{hazard.assignedCrewId.toUpperCase()}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unassigned</span>
                        )}
                      </td>

                      {/* Command Actions */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {/* Dispatch Unit Modal Trigger */}
                          <button
                            onClick={() => onOpenDispatchModal(hazard)}
                            className="btn-primary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            title="Dispatch field crew"
                          >
                            <Truck style={{ width: '12px', height: '12px' }} />
                            <span>Dispatch</span>
                          </button>

                          {/* Quick Escalation Buttons */}
                          {hazard.status === 'NEED_MORE_INFO' && (
                            <button
                              onClick={() => onStatusChange(hazard.hazardId, 'PUBLISHED')}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              title="Approve and Publish to Citizen Maps"
                            >
                              <CheckCircle style={{ width: '12px', height: '12px' }} />
                              <span>Approve</span>
                            </button>
                          )}

                          {hazard.status === 'PUBLISHED' && (
                            <button
                              onClick={() => onStatusChange(hazard.hazardId, 'COUNCIL_TICKET')}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11px' }}
                              title="Assign formal Council Ticket"
                            >
                              <FileText style={{ width: '12px', height: '12px' }} />
                              <span>Ticket</span>
                            </button>
                          )}

                          {hazard.status !== 'AREA_ALERT' && isHighRisk && (
                            <button
                              onClick={() => onStatusChange(hazard.hazardId, 'AREA_ALERT')}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11px', borderColor: '#DC2626', color: '#DC2626' }}
                              title="Broadcast Area Alert Warning"
                            >
                              <Radio style={{ width: '12px', height: '12px' }} />
                              <span>Alert</span>
                            </button>
                          )}

                          {hazard.status !== 'RESOLVED' && hazard.assignedCrewId && (
                            <button
                              onClick={() => onStatusChange(hazard.hazardId, 'RESOLVED')}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '11px', color: '#10B981' }}
                              title="Mark Incident Cleared & Resolved"
                            >
                              <CheckCircle style={{ width: '12px', height: '12px' }} />
                              <span>Resolve</span>
                            </button>
                          )}

                          {/* View on Map */}
                          <button
                            onClick={() => onViewOnMap(hazard)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            title="Locate on Geospatial Command Map"
                          >
                            <span>Map</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
