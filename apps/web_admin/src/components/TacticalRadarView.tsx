import { useState, useEffect, useRef } from 'react';
import { Radio, Target, Wifi, AlertTriangle, Clock, Crosshair } from 'lucide-react';
import type { HazardDocument } from '../types/models';

interface TacticalRadarViewProps {
  hazards: HazardDocument[];
  theme: 'light' | 'dark';
}

// Map a hazard status to a radar blip color
function getBlipColor(status: HazardDocument['status']): string {
  switch (status) {
    case 'AREA_ALERT': return '#EF4444';
    case 'COUNCIL_TICKET': return '#F59E0B';
    case 'DISPATCHED': return '#3B82F6';
    case 'RESOLVED': return '#10B981';
    case 'PUBLISHED': return '#8B5CF6';
    default: return '#6B7280';
  }
}

function getCategoryLabel(cat: HazardDocument['category']): string {
  switch (cat) {
    case 'SEVERE_FLOOD': return 'FLOOD';
    case 'POWER_HAZARD': return 'POWER';
    case 'FALLEN_TREE': return 'TREE';
    case 'BLOCKED_ROAD': return 'ROAD';
    case 'LANDSLIDE': return 'SLIDE';
    case 'STRUCTURE_DAMAGE': return 'STRUCT';
    default: return 'UNK';
  }
}

interface BlipPosition {
  x: number;
  y: number;
  hazard: HazardDocument;
  color: string;
}

export function TacticalRadarView({ hazards, theme }: TacticalRadarViewProps) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [selectedBlip, setSelectedBlip] = useState<HazardDocument | null>(null);
  const [pingMap, setPingMap] = useState<Record<string, number>>({}); // hazardId -> alpha
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const sweepRef = useRef<number>(0);

  const isDark = theme === 'dark';
  const radarBg = isDark ? '#030712' : '#0a1628';
  const ringColor = isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.18)';
  const sweepColor = 'rgba(34,197,94,0.85)';
  const gridColor = 'rgba(34,197,94,0.08)';

  // Derive blip positions from hazard GPS coordinates
  // Center of the map region (Colombo area based on seed data)
  const centerLat = 6.928;
  const centerLon = 79.862;
  const rangeKm = 8; // visible radius in km

  // degrees per km (approximate)
  const latPerKm = 1 / 110.574;
  const lonPerKm = 1 / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  const blips: BlipPosition[] = hazards.map((h) => {
    const dLat = h.coordinates.latitude - centerLat;
    const dLon = h.coordinates.longitude - centerLon;
    const dLatKm = dLat / latPerKm;
    const dLonKm = dLon / lonPerKm;

    // Normalized to [-1, 1] range
    const nx = dLonKm / rangeKm;
    const ny = -dLatKm / rangeKm; // invert Y (screen coords)

    return {
      x: nx,
      y: ny,
      hazard: h,
      color: getBlipColor(h.status),
    };
  });

  // Animation loop for sweep
  useEffect(() => {
    const SWEEP_SPEED = 60; // degrees per second
    let lastPingCheck = 0;

    const animate = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;

      sweepRef.current = (sweepRef.current + SWEEP_SPEED * dt) % 360;
      setSweepAngle(sweepRef.current);

      // Check which blips the sweep just crossed — trigger ping
      if (ts - lastPingCheck > 200) {
        lastPingCheck = ts;
        const currentAngle = sweepRef.current;
        setPingMap((prev) => {
          const next = { ...prev };
          blips.forEach(({ hazard, x, y }) => {
            const blipAngle = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
            const angleDiff = Math.abs(((currentAngle - blipAngle + 540) % 360) - 180);
            if (angleDiff < 8) {
              next[hazard.hazardId] = 1.0;
            } else {
              if (next[hazard.hazardId] !== undefined) {
                next[hazard.hazardId] = Math.max(0, (next[hazard.hazardId] ?? 0) - 0.015);
              }
            }
          });
          return next;
        });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hazards.length]);

  const RADAR_SIZE = 500;
  const cx = RADAR_SIZE / 2;
  const cy = RADAR_SIZE / 2;
  const R = RADAR_SIZE / 2 - 12;

  // Build sweep gradient path (trailing arc)
  const sweepRad = (sweepAngle * Math.PI) / 180;
  const trailArcLen = 70; // degrees of trail
  const trailStart = sweepAngle - trailArcLen;
  const trailStartRad = (trailStart * Math.PI) / 180;
  const sweepX = cx + R * Math.cos(sweepRad - Math.PI / 2);
  const sweepY = cy + R * Math.sin(sweepRad - Math.PI / 2);
  const trailX = cx + R * Math.cos(trailStartRad - Math.PI / 2);
  const trailY = cy + R * Math.sin(trailStartRad - Math.PI / 2);
  const largeArc = trailArcLen > 180 ? 1 : 0;

  const now = new Date();

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
      {/* Radar Scope */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* HUD Top Bar */}
        <div style={{
          background: radarBg,
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          gap: '32px',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          color: '#22c55e',
          fontSize: '11px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
            <span>SYS ONLINE</span>
          </div>
          <div><span style={{ color: 'rgba(34,197,94,0.5)' }}>CONTACTS: </span>{hazards.length}</div>
          <div><span style={{ color: 'rgba(34,197,94,0.5)' }}>SWEEP: </span>6 RPM</div>
          <div><span style={{ color: 'rgba(34,197,94,0.5)' }}>RANGE: </span>{rangeKm} KM</div>
          <div><span style={{ color: 'rgba(34,197,94,0.5)' }}>FREQ: </span>9.4 GHz</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock style={{ width: 12, height: 12 }} />
            <span>{now.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* The Radar SVG */}
        <div style={{
          background: radarBg,
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '16px',
          padding: '16px',
          position: 'relative',
          boxShadow: isDark
            ? '0 0 40px rgba(34,197,94,0.08), inset 0 0 80px rgba(0,0,0,0.6)'
            : '0 0 40px rgba(34,197,94,0.05)',
        }}>
          <svg
            width={RADAR_SIZE}
            height={RADAR_SIZE}
            style={{ display: 'block', borderRadius: '50%', overflow: 'hidden' }}
          >
            <defs>
              {/* Radial background gradient */}
              <radialGradient id="radarBgGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0,20,10,0.95)" />
                <stop offset="100%" stopColor="rgba(0,5,2,1)" />
              </radialGradient>
              {/* Sweep trail gradient */}
              <radialGradient id="sweepTrail" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(34,197,94,0)" />
                <stop offset="100%" stopColor="rgba(34,197,94,0.12)" />
              </radialGradient>
              {/* Clip to circle */}
              <clipPath id="radarClip">
                <circle cx={cx} cy={cy} r={R} />
              </clipPath>
            </defs>

            {/* Background */}
            <circle cx={cx} cy={cy} r={R} fill="url(#radarBgGrad)" />

            <g clipPath="url(#radarClip)">
              {/* Grid lines horizontal + vertical */}
              {[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map((f) => (
                <g key={f}>
                  <line
                    x1={cx + f * R} y1={cy - R}
                    x2={cx + f * R} y2={cy + R}
                    stroke={gridColor} strokeWidth={1}
                  />
                  <line
                    x1={cx - R} y1={cy + f * R}
                    x2={cx + R} y2={cy + f * R}
                    stroke={gridColor} strokeWidth={1}
                  />
                </g>
              ))}

              {/* Range rings */}
              {[0.25, 0.5, 0.75, 1.0].map((f, i) => (
                <g key={f}>
                  <circle cx={cx} cy={cy} r={R * f} fill="none" stroke={ringColor} strokeWidth={1.5} />
                  <text
                    x={cx + 4}
                    y={cy - R * f + 12}
                    fill="rgba(34,197,94,0.4)"
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                  >
                    {Math.round(rangeKm * f)}km
                  </text>
                  <text
                    x={cx + 4}
                    y={cy - R * f + 12}
                    fill="rgba(34,197,94,0.35)"
                    fontSize={9}
                    fontFamily="var(--font-mono)"
                  >
                    W{i + 1}
                  </text>
                </g>
              ))}

              {/* Crosshairs */}
              <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="rgba(34,197,94,0.25)" strokeWidth={1} />
              <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="rgba(34,197,94,0.25)" strokeWidth={1} />

              {/* Sweep Trail Arc */}
              <path
                d={`M ${cx} ${cy} L ${trailX} ${trailY} A ${R} ${R} 0 ${largeArc} 1 ${sweepX} ${sweepY} Z`}
                fill="rgba(34,197,94,0.06)"
              />

              {/* Sweep Arm Line */}
              <line
                x1={cx}
                y1={cy}
                x2={sweepX}
                y2={sweepY}
                stroke={sweepColor}
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.9))' }}
              />

              {/* Blips */}
              {blips.map(({ x, y, hazard, color }) => {
                // Only render blips within circle
                if (Math.sqrt(x * x + y * y) > 1) return null;
                const bx = cx + x * R;
                const by = cy + y * R;
                const alpha = pingMap[hazard.hazardId] ?? 0;
                const isSelected = selectedBlip?.hazardId === hazard.hazardId;

                return (
                  <g key={hazard.hazardId} style={{ cursor: 'pointer' }} onClick={() => setSelectedBlip(isSelected ? null : hazard)}>
                    {/* Ping ring (fades out) */}
                    {alpha > 0 && (
                      <circle
                        cx={bx} cy={by}
                        r={14 + (1 - alpha) * 10}
                        fill="none"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={alpha * 0.7}
                      />
                    )}
                    {/* Glow */}
                    <circle
                      cx={bx} cy={by} r={isSelected ? 10 : 6}
                      fill={color}
                      opacity={0.18 + (isSelected ? 0.1 : 0)}
                    />
                    {/* Core blip */}
                    <circle
                      cx={bx} cy={by} r={isSelected ? 5 : 3.5}
                      fill={color}
                      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                    />
                    {/* Label */}
                    <text
                      x={bx + 8} y={by - 6}
                      fill={color}
                      fontSize={8}
                      fontFamily="var(--font-mono)"
                      fontWeight={700}
                      opacity={0.9}
                    >
                      {getCategoryLabel(hazard.category)}
                    </text>
                  </g>
                );
              })}

              {/* Center dot */}
              <circle cx={cx} cy={cy} r={4} fill="#22c55e" style={{ filter: 'drop-shadow(0 0 6px #22c55e)' }} />
              <circle cx={cx} cy={cy} r={8} fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth={1} />
            </g>

            {/* Outer bezel ring */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth={2} />

            {/* Compass labels */}
            {[
              { label: 'N', x: cx, y: 14 },
              { label: 'S', x: cx, y: RADAR_SIZE - 6 },
              { label: 'E', x: RADAR_SIZE - 8, y: cy + 4 },
              { label: 'W', x: 8, y: cy + 4 },
            ].map(({ label, x, y }) => (
              <text key={label} x={x} y={y} textAnchor="middle" fill="rgba(34,197,94,0.6)"
                fontSize={11} fontWeight={700} fontFamily="var(--font-mono)"
              >
                {label}
              </text>
            ))}

            {/* Angle tick marks */}
            {Array.from({ length: 36 }, (_, i) => i * 10).map((deg) => {
              const rad = (deg - 90) * Math.PI / 180;
              const inner = R - (deg % 30 === 0 ? 10 : 5);
              const x1 = cx + inner * Math.cos(rad);
              const y1 = cy + inner * Math.sin(rad);
              const x2 = cx + (R - 1) * Math.cos(rad);
              const y2 = cy + (R - 1) * Math.sin(rad);
              return (
                <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(34,197,94,0.35)" strokeWidth={deg % 30 === 0 ? 1.5 : 0.8}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{
          background: radarBg,
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          gap: '20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          flexWrap: 'wrap',
        }}>
          {[
            { color: '#EF4444', label: 'AREA ALERT' },
            { color: '#F59E0B', label: 'COUNCIL TICKET' },
            { color: '#3B82F6', label: 'DISPATCHED' },
            { color: '#8B5CF6', label: 'PUBLISHED' },
            { color: '#10B981', label: 'RESOLVED' },
            { color: '#6B7280', label: 'OTHER' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(34,197,94,0.7)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 4px ${color}` }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Target List + Selected Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Selected Blip Info */}
        {selectedBlip ? (
          <div style={{
            background: radarBg,
            border: `1px solid ${getBlipColor(selectedBlip.status)}`,
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'var(--font-mono)',
            boxShadow: `0 0 20px ${getBlipColor(selectedBlip.status)}22`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Target style={{ width: 18, height: 18, color: getBlipColor(selectedBlip.status) }} />
              <span style={{ color: getBlipColor(selectedBlip.status), fontWeight: 700, fontSize: '13px' }}>
                TARGET LOCK — {getCategoryLabel(selectedBlip.category)}
              </span>
              <button
                onClick={() => setSelectedBlip(null)}
                style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                RELEASE
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                ['HAZARD ID', selectedBlip.hazardId],
                ['STATUS', selectedBlip.status],
                ['WARD', selectedBlip.ward],
                ['REPORTER', selectedBlip.reporterName || 'Anonymous'],
                ['URGENCY', `${selectedBlip.aiAnalysis?.urgencyScore}/10`],
                ['AI CONF', `${((selectedBlip.aiAnalysis?.imageConfidence ?? 0) * 100).toFixed(0)}%`],
                ['CLUSTER', `${selectedBlip.aiAnalysis?.clusterCount} reports`],
                ['COORDS', `${selectedBlip.coordinates.latitude.toFixed(4)}, ${selectedBlip.coordinates.longitude.toFixed(4)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(34,197,94,0.04)', borderRadius: '6px', padding: '8px 10px', border: '1px solid rgba(34,197,94,0.1)' }}>
                  <div style={{ color: 'rgba(34,197,94,0.45)', fontSize: '9px', marginBottom: '2px' }}>{k}</div>
                  <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600, wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>
            {selectedBlip.aiAnalysis?.reasoning && (
              <div style={{ marginTop: '12px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: '6px', padding: '10px', color: 'rgba(34,197,94,0.7)', fontSize: '10px', lineHeight: 1.6 }}>
                <span style={{ color: 'rgba(34,197,94,0.4)', display: 'block', marginBottom: '4px' }}>AI REASONING</span>
                {selectedBlip.aiAnalysis.reasoning}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: radarBg,
            border: '1px solid rgba(34,197,94,0.15)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'rgba(34,197,94,0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
          }}>
            <Crosshair style={{ width: 20, height: 20 }} />
            <span>Click any blip on the radar to lock and inspect the target</span>
          </div>
        )}

        {/* Active Contacts Table */}
        <div style={{
          background: radarBg,
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '12px',
          padding: '16px',
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Wifi style={{ width: 14, height: 14, color: '#22c55e' }} />
            <span style={{ color: '#22c55e', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              ACTIVE CONTACTS ({hazards.length})
            </span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {hazards.map((h) => (
              <div
                key={h.hazardId}
                onClick={() => setSelectedBlip(selectedBlip?.hazardId === h.hazardId ? null : h)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${selectedBlip?.hazardId === h.hazardId ? getBlipColor(h.status) : 'rgba(34,197,94,0.1)'}`,
                  background: selectedBlip?.hazardId === h.hazardId ? `${getBlipColor(h.status)}10` : 'rgba(34,197,94,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: getBlipColor(h.status),
                  flexShrink: 0,
                  boxShadow: `0 0 4px ${getBlipColor(h.status)}`,
                  animation: h.status === 'AREA_ALERT' ? 'blipPulse 1.2s infinite' : undefined,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#22c55e', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getCategoryLabel(h.category)} — {h.ward}
                  </div>
                  <div style={{ color: 'rgba(34,197,94,0.45)', fontSize: '9px' }}>{h.hazardId}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: getBlipColor(h.status), fontSize: '10px', fontWeight: 600 }}>
                    {h.aiAnalysis?.urgencyScore?.toFixed(1) ?? '--'}/10
                  </div>
                  <div style={{ color: 'rgba(34,197,94,0.4)', fontSize: '9px' }}>urgency</div>
                </div>
                <AlertTriangle style={{ width: 12, height: 12, color: getBlipColor(h.status), flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Signal Strength Bars */}
        <div style={{
          background: radarBg,
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontFamily: 'var(--font-mono)',
        }}>
          <Radio style={{ width: 14, height: 14, color: '#22c55e' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
            {[4, 7, 11, 15, 18, 14, 10, 8, 13, 17, 19, 16].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: `${h}px`,
                  background: '#22c55e',
                  borderRadius: '1px',
                  opacity: 0.3 + (i % 3) * 0.23,
                  animation: `signalBounce ${0.8 + i * 0.07}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
          <span style={{ color: 'rgba(34,197,94,0.55)', fontSize: '10px' }}>SIGNAL STRONG — 9.4 GHz BAND CLEAR</span>
          <span style={{ color: '#22c55e', fontSize: '10px', marginLeft: 'auto', fontWeight: 700 }}>
            {Math.round(sweepAngle)}°
          </span>
        </div>
      </div>
    </div>
  );
}
