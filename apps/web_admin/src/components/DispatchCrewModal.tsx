import React, { useState } from 'react';
import { X, Send, Truck, Clock, AlertTriangle } from 'lucide-react';
import type { HazardDocument } from '../types/models';

interface DispatchCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hazard: HazardDocument | null;
  onDispatch: (hazardId: string, crewId: string, notes: string) => Promise<void>;
}

interface CrewOption {
  id: string;
  name: string;
  type: string;
  eta: string;
  station: string;
  personnel: number;
  equipment: string;
  available: boolean;
}

const AVAILABLE_CREWS: CrewOption[] = [
  {
    id: 'crew_north_04',
    name: 'Crew North 04',
    type: 'Heavy Response Unit',
    eta: '4 mins',
    station: 'Mattakkuliya Dep.',
    personnel: 5,
    equipment: 'Water pumps, Chainsaws, Winch',
    available: true,
  },
  {
    id: 'crew_south_02',
    name: 'Crew South 02',
    type: 'Urban Drainage & Flood',
    eta: '8 mins',
    station: 'Havelock Outpost',
    personnel: 4,
    equipment: '3x Submersible trash pumps',
    available: true,
  },
  {
    id: 'boat_unit_01',
    name: 'Rapid Boat Unit 01',
    type: 'Inland Water Rescue',
    eta: '6 mins',
    station: 'Kelani River Station',
    personnel: 3,
    equipment: 'Zodiac Rescue Boat, Life vests',
    available: true,
  },
  {
    id: 'utility_03',
    name: 'Emergency Utility 03',
    type: 'High-Voltage Power Isolation',
    eta: '11 mins',
    station: 'Maradana Grid Hub',
    personnel: 2,
    equipment: 'Insulated bucket truck, Megohmmeter',
    available: true,
  },
  {
    id: 'roadworks_05',
    name: 'Council Roadworks 05',
    type: 'Debris & Tree Clearance',
    eta: '14 mins',
    station: 'Colombo Fort Depot',
    personnel: 6,
    equipment: 'Backhoe loader, Chipper',
    available: false,
  },
];

export const DispatchCrewModal: React.FC<DispatchCrewModalProps> = ({
  isOpen,
  onClose,
  hazard,
  onDispatch,
}) => {
  const [selectedCrewId, setSelectedCrewId] = useState<string>('crew_north_04');
  const [urgencyLevel, setUrgencyLevel] = useState<'STANDARD' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [dispatchNotes, setDispatchNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !hazard) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrewId) return;

    setIsSubmitting(true);
    try {
      const fullNotes = `[Priority: ${urgencyLevel}] ${dispatchNotes || 'Standard rapid deployment'}`;
      await onDispatch(hazard.hazardId, selectedCrewId, fullNotes);
      onClose();
    } catch (err) {
      console.error('Failed to dispatch unit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                Field Crew Rapid Dispatch
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Target: {hazard.ward} • {hazard.hazardId}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Target Incident Pill */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                {hazard.category.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Urgency: {hazard.aiAnalysis?.urgencyScore ?? 7.5}/10 • AI Confidence: {((hazard.aiAnalysis?.imageConfidence ?? 0.9) * 100).toFixed(0)}%
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {hazard.coordinates.latitude.toFixed(4)}, {hazard.coordinates.longitude.toFixed(4)}
            </span>
          </div>

          {/* Urgency Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              Dispatch Priority
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['STANDARD', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgencyLevel(lvl)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: urgencyLevel === lvl ? 'var(--btn-bg)' : 'var(--border-subtle)',
                    backgroundColor: urgencyLevel === lvl ? 'var(--btn-bg)' : 'var(--bg-secondary)',
                    color: urgencyLevel === lvl ? 'var(--btn-text)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  {lvl === 'CRITICAL' && <AlertTriangle style={{ width: '12px', height: '12px' }} />}
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Field Crew Unit Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              Select Municipal Unit
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {AVAILABLE_CREWS.map((crew) => (
                <div
                  key={crew.id}
                  onClick={() => crew.available && setSelectedCrewId(crew.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedCrewId === crew.id ? 'var(--btn-bg)' : 'var(--border-subtle)',
                    backgroundColor: selectedCrewId === crew.id ? 'var(--bg-secondary)' : 'var(--bg-card)',
                    opacity: crew.available ? 1 : 0.45,
                    cursor: crew.available ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="crewSelection"
                      checked={selectedCrewId === crew.id}
                      onChange={() => crew.available && setSelectedCrewId(crew.id)}
                      disabled={!crew.available}
                      style={{ accentColor: 'var(--btn-bg)' }}
                    />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700 }}>
                        {crew.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({crew.type})</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {crew.station} • {crew.personnel} personnel • Equip: {crew.equipment}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {crew.eta}
                    </div>
                    <span style={{ fontSize: '10px', color: crew.available ? '#10B981' : 'var(--text-muted)' }}>
                      {crew.available ? 'Standby' : 'Engaged'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Dispatch Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              Command Dispatch Notes & Equipment Request
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approach from South arterial bypass. Deploy pump immediately; high risk of residential backflow."
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ padding: '10px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCrewId}
              className="btn-primary"
              style={{ padding: '10px 20px' }}
            >
              <Send style={{ width: '14px', height: '14px' }} />
              <span>{isSubmitting ? 'Transmitting Order...' : 'Authorize & Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
