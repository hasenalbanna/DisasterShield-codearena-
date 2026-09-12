import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Building, 
  Truck, 
  Download, 
  Zap, 
  Droplets, 
  Flame, 
  AlertTriangle,
  Search
} from 'lucide-react';
import type { HazardDocument } from '../types/models';

interface CouncilTicketsViewProps {
  hazards: HazardDocument[];
  onStatusChange: (hazardId: string, status: HazardDocument['status']) => Promise<void>;
}

interface WorkOrderRecord {
  ticketId: string;
  hazardId: string;
  ward: string;
  department: string;
  category: HazardDocument['category'];
  title: string;
  description: string;
  priority: 'EMERGENCY_4H' | 'URGENT_24H' | 'ROUTINE_48H';
  slaExpires: string;
  assignedUnit: string;
  estimatedCostLkr: number;
  status: 'PENDING_CREW' | 'IN_PROGRESS' | 'COMPLETED';
}

export const CouncilTicketsView: React.FC<CouncilTicketsViewProps> = ({
  hazards,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [workOrders, setWorkOrders] = useState<WorkOrderRecord[]>([
    {
      ticketId: 'WO-8812903',
      hazardId: 'hz_8812903bc',
      ward: 'Crossway Blvd & 5th Ave',
      department: 'Ceylon Electricity Board (Grid Isolation)',
      category: 'POWER_HAZARD',
      title: 'Exposed High-Voltage Cable on Pedestrian Walkway',
      description: 'Secondary distribution cable snapped. Requires boom lift, insulator replacement, and line testing.',
      priority: 'EMERGENCY_4H',
      slaExpires: '1h 45m remaining',
      assignedUnit: 'CEB Emergency Unit 03',
      estimatedCostLkr: 85000,
      status: 'IN_PROGRESS',
    },
    {
      ticketId: 'WO-6601928',
      hazardId: 'hz_6601928de',
      ward: 'Highland Ridge Way',
      department: 'Urban Forestry & Arborist Unit',
      category: 'FALLEN_TREE',
      title: 'Banyan Tree Branch Blocking Dual-Carriageway',
      description: 'Massive limb obstruction. Woodchipper and hydraulic chainsaw team required.',
      priority: 'URGENT_24H',
      slaExpires: '14h 20m remaining',
      assignedUnit: 'Municipal Arborist Team 07',
      estimatedCostLkr: 45000,
      status: 'PENDING_CREW',
    },
    {
      ticketId: 'WO-9982341',
      hazardId: 'hz_9982341af',
      ward: 'Sector 4B - Ward 12 Riverbank',
      department: 'Municipal Drainage & Canal Engineering',
      category: 'SEVERE_FLOOD',
      title: 'Canal Sluice Gate Backflow Obstruction',
      description: 'Riverbank surge causing urban street inundation. Desilt canal bottleneck & deploy trash pumps.',
      priority: 'EMERGENCY_4H',
      slaExpires: '2h 10m remaining',
      assignedUnit: 'Canal Works Crew South 02',
      estimatedCostLkr: 140000,
      status: 'IN_PROGRESS',
    },
    {
      ticketId: 'WO-7719284',
      hazardId: 'hz_7719284cd',
      ward: 'North Arterial Bypass - KM 14',
      department: 'Road Development Authority (Highways)',
      category: 'BLOCKED_ROAD',
      title: 'Sub-base Mudslide & Retaining Wall Scour',
      description: 'Debris blocking both lanes. Backhoe excavator and asphalt clearing needed.',
      priority: 'URGENT_24H',
      slaExpires: '8h 00m remaining',
      assignedUnit: 'RDA Rapid Roadworks 05',
      estimatedCostLkr: 220000,
      status: 'PENDING_CREW',
    },
  ]);

  const handleCompleteWorkOrder = async (ticketId: string, hazardId: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.ticketId === ticketId ? { ...wo, status: 'COMPLETED' } : wo))
    );
    await onStatusChange(hazardId, 'RESOLVED');
  };

  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      searchTerm === '' ||
      wo.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || wo.department.includes(deptFilter);
    return matchesSearch && matchesDept;
  });

  const getPriorityBadge = (priority: WorkOrderRecord['priority']) => {
    switch (priority) {
      case 'EMERGENCY_4H':
        return <span style={{ color: '#DC2626', backgroundColor: '#FEE2E2', border: '1px solid currentColor', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>4H EMERGENCY</span>;
      case 'URGENT_24H':
        return <span style={{ color: '#D97706', backgroundColor: '#FEF3C7', border: '1px solid currentColor', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>24H URGENT</span>;
      case 'ROUTINE_48H':
        return <span style={{ color: '#4B5563', backgroundColor: '#F3F4F6', border: '1px solid currentColor', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>48H ROUTINE</span>;
    }
  };

  const getCategoryIcon = (category: HazardDocument['category']) => {
    switch (category) {
      case 'POWER_HAZARD':
        return <Zap style={{ width: '15px', height: '15px', color: '#F59E0B' }} />;
      case 'SEVERE_FLOOD':
        return <Droplets style={{ width: '15px', height: '15px', color: '#3B82F6' }} />;
      case 'FALLEN_TREE':
        return <Flame style={{ width: '15px', height: '15px', color: '#10B981' }} />;
      case 'BLOCKED_ROAD':
        return <AlertTriangle style={{ width: '15px', height: '15px', color: '#DC2626' }} />;
      default:
        return <AlertTriangle style={{ width: '15px', height: '15px' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Active Work Orders</span>
            <FileText style={{ width: '16px', height: '16px' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>{workOrders.filter(w => w.status !== 'COMPLETED').length}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {hazards.filter(h => h.status === 'COUNCIL_TICKET').length} live tickets in Firestore
          </span>
        </div>

        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Emergency 4H SLAs</span>
            <Clock style={{ width: '16px', height: '16px', color: '#DC2626' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>
            {workOrders.filter(w => w.priority === 'EMERGENCY_4H' && w.status !== 'COMPLETED').length}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Time-critical infrastructure</span>
        </div>

        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Contractor Units</span>
            <Truck style={{ width: '16px', height: '16px' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>4 Active</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CEB, RDA, Forestry & Drainage</span>
        </div>

        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Completed Today</span>
            <CheckCircle style={{ width: '16px', height: '16px', color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>
            {workOrders.filter(w => w.status === 'COMPLETED').length}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Signed off & verified</span>
        </div>
      </div>

      {/* Work Orders Management Table */}
      <div className="minimal-card" style={{ padding: '24px' }}>
        {/* Filters Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              Municipal Infrastructure Work Orders
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Autonomous 4th-channel ticket generation, SLA monitoring, and resolution verification
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search ticket, ward, or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Departments</option>
              <option value="Electricity">Electricity (CEB)</option>
              <option value="Drainage">Drainage & Canals</option>
              <option value="Forestry">Forestry & Arborists</option>
              <option value="Road">Roads & Highways (RDA)</option>
            </select>

            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '11px' }}
              title="Print Work Orders Summary"
            >
              <Download style={{ width: '12px', height: '12px' }} />
              <span>Export Manifest</span>
            </button>
          </div>
        </div>

        {/* Tickets Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map((wo) => {
            const isDone = wo.status === 'COMPLETED';
            return (
              <div
                key={wo.ticketId}
                style={{
                  padding: '18px',
                  borderRadius: '8px',
                  backgroundColor: isDone ? 'var(--bg-card)' : 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  opacity: isDone ? 0.65 : 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '2px',
                    }}
                  >
                    {getCategoryIcon(wo.category)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px' }}>{wo.ticketId}</span>
                      <span>•</span>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{wo.title}</span>
                      <span>•</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{wo.ward}</span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px 0', maxWidth: '650px', lineHeight: 1.4 }}>
                      {wo.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building style={{ width: '12px', height: '12px' }} />
                        {wo.department}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Truck style={{ width: '12px', height: '12px' }} />
                        {wo.assignedUnit}
                      </span>
                      <span>Est: <strong>LKR {wo.estimatedCostLkr.toLocaleString()}</strong></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: wo.priority === 'EMERGENCY_4H' ? '#DC2626' : 'inherit' }}>
                        <Clock style={{ width: '11px', height: '11px' }} />
                        {wo.slaExpires}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {getPriorityBadge(wo.priority)}
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {wo.status}
                    </span>
                  </div>

                  {!isDone ? (
                    <button
                      onClick={() => handleCompleteWorkOrder(wo.ticketId, wo.hazardId)}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '11px' }}
                    >
                      <CheckCircle style={{ width: '12px', height: '12px' }} />
                      <span>Sign Off & Resolve</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle style={{ width: '14px', height: '14px' }} />
                      Work Order Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
