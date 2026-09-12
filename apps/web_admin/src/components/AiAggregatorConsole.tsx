import React, { useState } from 'react';
import { 
  Cpu, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  Radio, 
  FileText, 
  Layers, 
  RotateCcw
} from 'lucide-react';
import type { HazardDocument } from '../types/models';

interface AiAggregatorConsoleProps {
  hazards: HazardDocument[];
  onStatusChange: (hazardId: string, status: HazardDocument['status']) => Promise<void>;
}

export const AiAggregatorConsole: React.FC<AiAggregatorConsoleProps> = ({
  hazards,
  onStatusChange,
}) => {
  // MCDA Equation Weights: Risk(u) = w1 * R_type + w2 * P_risk + w3 * Water_trend
  const [w1, setW1] = useState<number>(0.40); // Road & Severity weight
  const [w2, setW2] = useState<number>(0.35); // Population & Infrastructure density
  const [w3, setW3] = useState<number>(0.25); // Hydrological Surge & Rainfall

  // 4-Channel Routing Thresholds
  const [needInfoMin, setNeedInfoMin] = useState<number>(45);
  const [needInfoMax, setNeedInfoMax] = useState<number>(75);
  const [publishMin, setPublishMin] = useState<number>(75);
  const [areaAlertMin, setAreaAlertMin] = useState<number>(8.5);
  const [autoCouncilTicket, setAutoCouncilTicket] = useState<boolean>(true);

  // Scenario Simulator Inputs
  const [simRtype, setSimRtype] = useState<number>(8.5); // 0-10
  const [simPrisk, setSimPrisk] = useState<number>(7.0); // 0-10
  const [simWaterTrend, setSimWaterTrend] = useState<number>(9.0); // 0-10

  // Calculate Normalized Simulated Score
  const totalWeight = w1 + w2 + w3;
  const simulatedScore = Number(((w1 * simRtype + w2 * simPrisk + w3 * simWaterTrend) / (totalWeight || 1)).toFixed(1));

  const getSimulatedChannel = (score: number) => {
    if (score >= areaAlertMin) return { label: 'AREA_ALERT', color: '#DC2626', desc: 'Auto-broadcasts push warning to all ward residents & redirects traffic' };
    if (score >= 6.5) return { label: 'PUBLISHED', color: '#059669', desc: 'Validated & pinned on public citizen live maps with road blockage tag' };
    if (score >= 4.5) return { label: 'NEED_MORE_INFO', color: '#D97706', desc: 'Dispatches targeted verification prompts to nearby registered citizens' };
    return { label: 'LOW_PRIORITY', color: '#6B7280', desc: 'Queued for routine verification check' };
  };

  const simResult = getSimulatedChannel(simedScoreSafe(simulatedScore));

  function simedScoreSafe(val: number) {
    return isNaN(val) ? 0 : val;
  }

  const handleResetWeights = () => {
    setW1(0.40);
    setW2(0.35);
    setW3(0.25);
    setNeedInfoMin(45);
    setNeedInfoMax(75);
    setPublishMin(75);
    setAreaAlertMin(8.5);
    setAutoCouncilTicket(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="minimal-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                backgroundColor: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Hazard Aggregator AI Multi-Layer Engine
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Autonomous decision routing across Image AI, DBSCAN Spatial Clustering, Weather TimeSeries, and Location Matchers
              </p>
            </div>
          </div>

          <button
            onClick={handleResetWeights}
            className="btn-secondary"
            title="Reset AI parameters to calibrated defaults"
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            <RotateCcw style={{ width: '12px', height: '12px' }} />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* 5 Pipeline Stages Indicator */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '24px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>1. Image AI</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>MobileNetV2</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Authenticity: <strong>98.4%</strong> • Latency: 135ms
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>2. DBSCAN Cluster</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>Spatial &lt; 200m</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Window: 3 hours • eps: 0.2km
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>3. Weather Sensor</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>River Regression</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              14 Telemetry Gauges Active
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>4. Location Match</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>EXIF vs GPS</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Accuracy Radius: &plusmn;12m
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>5. Feedback Loop</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>RL Retuning</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Field Photo Verification Active
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Risk Formula Weight Tuner & 4-Channel Routing Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Card: MCDA Risk Formula Interactive Tuner */}
        <div className="minimal-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Sliders style={{ width: '16px', height: '16px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                MCDA Dynamic Risk Weights
              </h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              Risk(u) = w₁·R_type + w₂·P_risk + w₃·Water_trend
            </p>
          </div>

          {/* Slider 1: w1 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span><strong>w₁: Road & Hazard Severity Weight</strong></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{w1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={w1}
              onChange={(e) => setW1(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--btn-bg)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Weights impact on arterial road closures vs. minor residential alleys
            </span>
          </div>

          {/* Slider 2: w2 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span><strong>w₂: Population & Infrastructure Density</strong></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{w2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={w2}
              onChange={(e) => setW2(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--btn-bg)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Scales priority for high-density hospital, school, and bridge corridors
            </span>
          </div>

          {/* Slider 3: w3 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span><strong>w₃: Hydrological Surge & Rainfall Trend</strong></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{w3.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.80"
              step="0.05"
              value={w3}
              onChange={(e) => setW3(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--btn-bg)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Direct sensor coefficient tied to automated Kelani & Kalu river meters
            </span>
          </div>

          {/* Interactive Simulation Sandbox */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              marginTop: '4px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
              Live Score Simulation Sandbox
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>R_type (0-10)</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={simRtype}
                  onChange={(e) => setSimRtype(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>P_risk (0-10)</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={simPrisk}
                  onChange={(e) => setSimPrisk(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Water_trend (0-10)</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={simWaterTrend}
                  onChange={(e) => setSimWaterTrend(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CALCULATED RISK SCORE</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{simulatedScore} / 10</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: simResult.color,
                    border: '1px solid currentColor',
                  }}
                >
                  {simResult.label}
                </span>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '180px' }}>
                  {simResult.desc}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: 4-Channel Automated Routing Thresholds */}
        <div className="minimal-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Layers style={{ width: '16px', height: '16px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                4-Channel Routing Configuration
              </h4>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Defines autonomous execution triggers based on multi-model consensus
            </p>
          </div>

          {/* Channel 1: Need More Info */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle style={{ width: '14px', height: '14px', color: '#D97706' }} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Channel 1: Need More Info</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {needInfoMin}% &ndash; {needInfoMax}%
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
              When AI confidence falls within this range, nearby citizen devices receive quiet verification prompts.
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="range"
                min="30"
                max="60"
                value={needInfoMin}
                onChange={(e) => setNeedInfoMin(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--btn-bg)' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>to</span>
              <input
                type="range"
                min="65"
                max="85"
                value={needInfoMax}
                onChange={(e) => setNeedInfoMax(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--btn-bg)' }}
              />
            </div>
          </div>

          {/* Channel 2: Published */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle style={{ width: '14px', height: '14px', color: '#059669' }} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Channel 2: Auto-Publish to Map</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                &ge; {publishMin}%
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
              Confidence exceeds threshold: automatically pins hazard and alerts open mobile clients within 5km.
            </p>
            <input
              type="range"
              min="65"
              max="90"
              value={publishMin}
              onChange={(e) => setPublishMin(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--btn-bg)' }}
            />
          </div>

          {/* Channel 3: Area Alert */}
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio style={{ width: '14px', height: '14px', color: '#DC2626' }} />
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Channel 3: Ward Area Alert</span>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                Urgency &ge; {areaAlertMin.toFixed(1)}/10
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
              Urgency triggers automated emergency push sirens to all citizens within geofenced ward bounds.
            </p>
            <input
              type="range"
              min="7.0"
              max="9.5"
              step="0.1"
              value={areaAlertMin}
              onChange={(e) => setAreaAlertMin(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#DC2626' }}
            />
          </div>

          {/* Channel 4: Council Ticket Toggle */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText style={{ width: '16px', height: '16px' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>Channel 4: Council Work Orders</div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  Auto-create electronic work orders for power grids, fallen trees, & road collapses
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoCouncilTicket}
              onChange={(e) => setAutoCouncilTicket(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--btn-bg)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Live AI Routing Ingestion Feed */}
      <div className="minimal-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px 0' }}>
          Recent Automated AI Decisions
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {hazards.map((h) => (
            <div
              key={h.hazardId}
              style={{
                padding: '14px 18px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Cpu style={{ width: '16px', height: '16px' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{h.ward}</span>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {h.hazardId}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                    "{h.aiAnalysis?.reasoning}"
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right', fontSize: '11px' }}>
                  <div>Urgency: <strong>{h.aiAnalysis?.urgencyScore ?? 7}/10</strong></div>
                  <div style={{ color: 'var(--text-muted)' }}>Conf: <strong>{((h.aiAnalysis?.imageConfidence ?? 0.85) * 100).toFixed(0)}%</strong></div>
                </div>

                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {h.status}
                </span>

                <button
                  onClick={() => onStatusChange(h.hazardId, h.status === 'AREA_ALERT' ? 'PUBLISHED' : 'AREA_ALERT')}
                  className="btn-secondary"
                  style={{ fontSize: '10px', padding: '4px 8px' }}
                >
                  <span>Toggle Alert</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
