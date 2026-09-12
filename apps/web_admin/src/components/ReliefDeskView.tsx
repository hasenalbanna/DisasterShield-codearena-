import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Droplets, 
  Utensils, 
  Cross, 
  Zap, 
  Radio, 
  Plus, 
  Minus, 
  Truck, 
  CheckCircle,
  Send
} from 'lucide-react';

interface ShelterItem {
  id: string;
  name: string;
  ward: string;
  coordinates: { lat: number; lng: number };
  maxCapacity: number;
  currentOccupants: number;
  waterLiters: number;
  foodDays: number;
  medicalKits: number;
  generatorKva: number;
  status: 'OPEN_ACCEPTING' | 'NEAR_CAPACITY' | 'AT_CAPACITY' | 'CLOSED';
}

const INITIAL_SHELTERS: ShelterItem[] = [
  {
    id: 'sh_01',
    name: 'Royal College Sports Arena',
    ward: 'Ward 12 - South District',
    coordinates: { lat: 6.9034, lng: 79.8606 },
    maxCapacity: 600,
    currentOccupants: 485,
    waterLiters: 4500,
    foodDays: 4.2,
    medicalKits: 12,
    generatorKva: 85,
    status: 'NEAR_CAPACITY',
  },
  {
    id: 'sh_02',
    name: "St. Peter's Auditorium",
    ward: 'Ward 07 - Wellawatte',
    coordinates: { lat: 6.8850, lng: 79.8600 },
    maxCapacity: 450,
    currentOccupants: 210,
    waterLiters: 3200,
    foodDays: 6.0,
    medicalKits: 8,
    generatorKva: 50,
    status: 'OPEN_ACCEPTING',
  },
  {
    id: 'sh_03',
    name: 'Sugathadasa Indoor Complex',
    ward: 'Ward 04 - Kotahena',
    coordinates: { lat: 6.9460, lng: 79.8690 },
    maxCapacity: 1200,
    currentOccupants: 1180,
    waterLiters: 1200,
    foodDays: 1.5,
    medicalKits: 20,
    generatorKva: 150,
    status: 'AT_CAPACITY',
  },
  {
    id: 'sh_04',
    name: 'Havelock Community Center',
    ward: 'Ward 09 - Havelock Town',
    coordinates: { lat: 6.8890, lng: 79.8730 },
    maxCapacity: 300,
    currentOccupants: 85,
    waterLiters: 2800,
    foodDays: 7.0,
    medicalKits: 6,
    generatorKva: 40,
    status: 'OPEN_ACCEPTING',
  },
];

export const ReliefDeskView: React.FC = () => {
  const [shelters, setShelters] = useState<ShelterItem[]>(INITIAL_SHELTERS);
  const [selectedWardAdvisory, setSelectedWardAdvisory] = useState<string>('Ward 12 - South District');
  const [advisoryType, setAdvisoryType] = useState<'MANDATORY' | 'VOLUNTARY' | 'STANDBY'>('MANDATORY');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'Kelani river level elevated. Evacuate immediately via High-Level corridor towards Sugathadasa or St. Peters shelters.'
  );
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState<boolean>(false);

  // Update shelter occupancy
  const handleUpdateOccupancy = (id: string, delta: number) => {
    setShelters((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newOccupants = Math.max(0, Math.min(s.maxCapacity, s.currentOccupants + delta));
        let newStatus: ShelterItem['status'] = 'OPEN_ACCEPTING';
        if (newOccupants >= s.maxCapacity) newStatus = 'AT_CAPACITY';
        else if (newOccupants / s.maxCapacity >= 0.8) newStatus = 'NEAR_CAPACITY';

        return { ...s, currentOccupants: newOccupants, status: newStatus };
      })
    );
  };

  // Restock supplies
  const handleRestock = (id: string) => {
    setShelters((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              waterLiters: s.waterLiters + 2000,
              foodDays: Math.min(10, s.foodDays + 3),
              medicalKits: s.medicalKits + 10,
            }
          : s
      )
    );
  };

  const handleBroadcastAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);
    }, 800);
  };

  const totalCapacity = shelters.reduce((acc, s) => acc + s.maxCapacity, 0);
  const totalOccupants = shelters.reduce((acc, s) => acc + s.currentOccupants, 0);
  const occupancyPercentage = Math.round((totalOccupants / totalCapacity) * 100);

  const getStatusPill = (status: ShelterItem['status']) => {
    switch (status) {
      case 'OPEN_ACCEPTING':
        return <span style={{ color: '#059669', backgroundColor: '#D1FAE5', border: '1px solid currentColor', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>OPEN ACCEPTING</span>;
      case 'NEAR_CAPACITY':
        return <span style={{ color: '#D97706', backgroundColor: '#FEF3C7', border: '1px solid currentColor', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>NEAR CAPACITY</span>;
      case 'AT_CAPACITY':
        return <span style={{ color: '#DC2626', backgroundColor: '#FEE2E2', border: '1px solid currentColor', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>FULL / REDIRECT</span>;
      case 'CLOSED':
        return <span style={{ color: '#6B7280', backgroundColor: '#F3F4F6', border: '1px solid currentColor', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>CLOSED</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Telemetry Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Total Sheltered</span>
            <Users style={{ width: '16px', height: '16px' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>{totalOccupants.toLocaleString()}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            of {totalCapacity.toLocaleString()} max capacity ({occupancyPercentage}%)
          </span>
        </div>

        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Active Centers</span>
            <Building2 style={{ width: '16px', height: '16px' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>{shelters.filter(s => s.status !== 'CLOSED').length} / {shelters.length}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across 4 metropolitan wards</span>
        </div>

        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Total Potable Water</span>
            <Droplets style={{ width: '16px', height: '16px', color: '#3B82F6' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>
            {(shelters.reduce((acc, s) => acc + s.waterLiters, 0)).toLocaleString()} L
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Purified tank storage</span>
        </div>

        <div className="minimal-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Avg Rations Days</span>
            <Utensils style={{ width: '16px', height: '16px' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800 }}>
            {(shelters.reduce((acc, s) => acc + s.foodDays, 0) / shelters.length).toFixed(1)} Days
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dry meal packs available</span>
        </div>
      </div>

      {/* Main Shelters Inventory Grid */}
      <div className="minimal-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              Designated Emergency Shelters & Evacuation Centers
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Live intake monitoring, emergency supplies inventory, and dispatch restock triggers
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {shelters.map((shelter) => {
            const fillPct = Math.round((shelter.currentOccupants / shelter.maxCapacity) * 100);
            return (
              <div
                key={shelter.id}
                style={{
                  padding: '18px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* Center Title & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px' }}>{shelter.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {shelter.ward}
                    </div>
                  </div>
                  {getStatusPill(shelter.status)}
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Capacity Intake: <strong>{shelter.currentOccupants} / {shelter.maxCapacity}</strong></span>
                    <span style={{ fontWeight: 700 }}>{fillPct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <div
                      style={{
                        width: `${Math.min(100, fillPct)}%`,
                        height: '100%',
                        backgroundColor: fillPct >= 95 ? '#DC2626' : fillPct >= 80 ? '#D97706' : 'var(--btn-bg)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Supply Reserves Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Droplets style={{ width: '13px', height: '13px', color: '#3B82F6' }} />
                    <span>Water: <strong style={{ color: 'var(--text-primary)' }}>{shelter.waterLiters.toLocaleString()} L</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Utensils style={{ width: '13px', height: '13px' }} />
                    <span>Food: <strong style={{ color: 'var(--text-primary)' }}>{shelter.foodDays.toFixed(1)} Days</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cross style={{ width: '13px', height: '13px', color: '#EF4444' }} />
                    <span>Medical: <strong style={{ color: 'var(--text-primary)' }}>{shelter.medicalKits} Kits</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap style={{ width: '13px', height: '13px', color: '#F59E0B' }} />
                    <span>Gen: <strong style={{ color: 'var(--text-primary)' }}>{shelter.generatorKva} kVA</strong></span>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => handleUpdateOccupancy(shelter.id, -10)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      title="Decrement 10 occupants"
                    >
                      <Minus style={{ width: '12px', height: '12px' }} />
                      <span>10</span>
                    </button>
                    <button
                      onClick={() => handleUpdateOccupancy(shelter.id, 10)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      title="Intake 10 occupants"
                    >
                      <Plus style={{ width: '12px', height: '12px' }} />
                      <span>10</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleRestock(shelter.id)}
                    className="btn-primary"
                    style={{ padding: '6px 10px', fontSize: '11px' }}
                  >
                    <Truck style={{ width: '12px', height: '12px' }} />
                    <span>Restock Supplies</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Citizen Evacuation Advisory Broadcaster */}
      <div className="minimal-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Radio style={{ width: '20px', height: '20px', color: '#DC2626' }} className="animate-pulse" />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
              Broadcast Citizen Evacuation Advisory & Safe Corridors
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Transmits push warnings and dynamically updates safe route guidance on citizen mobile apps
            </p>
          </div>
        </div>

        <form onSubmit={handleBroadcastAdvisory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                Target Jurisdictional Ward
              </label>
              <select
                value={selectedWardAdvisory}
                onChange={(e) => setSelectedWardAdvisory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="Ward 12 - South District">Ward 12 - South District (Kelani Riverbank)</option>
                <option value="Ward 04 - Kotahena">Ward 04 - Kotahena Lowlands</option>
                <option value="Ward 07 - Wellawatte">Ward 07 - Wellawatte Canal Zone</option>
                <option value="Ward 09 - Havelock Town">Ward 09 - Havelock Town</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                Evacuation Order Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['MANDATORY', 'VOLUNTARY', 'STANDBY'] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setAdvisoryType(lvl)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: advisoryType === lvl ? 'var(--btn-bg)' : 'var(--border-subtle)',
                      backgroundColor: advisoryType === lvl ? 'var(--btn-bg)' : 'var(--bg-secondary)',
                      color: advisoryType === lvl ? 'var(--btn-text)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              Broadcast Message & Route Corridor
            </label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {broadcastSuccess && (
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                  <CheckCircle style={{ width: '14px', height: '14px' }} />
                  Bulletin transmitted to {selectedWardAdvisory} active devices!
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isBroadcasting}
              className="btn-primary"
              style={{ padding: '10px 20px' }}
            >
              <Send style={{ width: '14px', height: '14px' }} />
              <span>{isBroadcasting ? 'Broadcasting Push...' : 'Broadcast Evacuation Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
