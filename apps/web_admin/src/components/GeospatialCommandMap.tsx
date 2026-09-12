import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  AlertTriangle, 
  Cpu, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Radio, 
  Eye, 
  X,
  Crosshair
} from 'lucide-react';
import type { HazardDocument } from '../types/models';

interface GeospatialCommandMapProps {
  hazards: HazardDocument[];
  theme: 'light' | 'dark';
  onSelectHazard: (hazard: HazardDocument) => void;
  selectedHazard: HazardDocument | null;
  onOpenDispatchModal: (hazard: HazardDocument) => void;
  onStatusChange: (hazardId: string, status: HazardDocument['status']) => Promise<void>;
}

// Metropolitan Center Coordinates (Colombo / Municipal HQ)
const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612];

// Standby Field Crew Positions
const CREW_LOCATIONS = [
  { id: 'crew_north_04', name: 'Crew North 04', coords: [6.9480, 79.8630] as [number, number], status: 'Standby' },
  { id: 'crew_south_02', name: 'Crew South 02', coords: [6.8920, 79.8700] as [number, number], status: 'Standby' },
  { id: 'boat_unit_01', name: 'Rapid Boat Unit 01', coords: [6.9380, 79.8820] as [number, number], status: 'Standby' },
];

export const GeospatialCommandMap: React.FC<GeospatialCommandMapProps> = ({
  hazards,
  theme,
  onSelectHazard,
  selectedHazard,
  onOpenDispatchModal,
  onStatusChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const geofenceLayerRef = useRef<L.Circle | null>(null);

  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showCrewMarkers, setShowCrewMarkers] = useState<boolean>(true);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const heatGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    heatLayerRef.current = heatGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const newTileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [theme]);

  // Update Radius Geofence Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (geofenceLayerRef.current) {
      map.removeLayer(geofenceLayerRef.current);
    }

    if (selectedRadiusKm > 0) {
      const circle = L.circle(DEFAULT_CENTER, {
        radius: selectedRadiusKm * 1000,
        color: theme === 'dark' ? '#525252' : '#9CA3AF',
        dashArray: '4, 8',
        weight: 1.5,
        fillColor: theme === 'dark' ? '#FFFFFF' : '#000000',
        fillOpacity: 0.02,
      }).addTo(map);
      geofenceLayerRef.current = circle;
    }
  }, [selectedRadiusKm, theme]);

  // Update Hazard Pins, Crew Pins, and Heatmap Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const heatGroup = heatLayerRef.current;
    if (!map || !markersGroup || !heatGroup) return;

    markersGroup.clearLayers();
    heatGroup.clearLayers();

    // 1. Render Heatmap circles if enabled
    if (showHeatmap) {
      hazards.forEach((hazard) => {
        const urgency = hazard.aiAnalysis?.urgencyScore ?? 5;
        const clusterCount = hazard.aiAnalysis?.clusterCount ?? 1;
        const radius = Math.max(300, clusterCount * 250 + urgency * 40);

        let heatColor = '#3B82F6'; // Default flood blue
        if (hazard.category === 'POWER_HAZARD') heatColor = '#F59E0B';
        if (hazard.status === 'AREA_ALERT' || urgency >= 8.0) heatColor = '#EF4444';

        // Outer ambient heat ring
        L.circle([hazard.coordinates.latitude, hazard.coordinates.longitude], {
          radius: radius,
          stroke: false,
          fillColor: heatColor,
          fillOpacity: theme === 'dark' ? 0.18 : 0.12,
        }).addTo(heatGroup);

        // Core dense heat ring
        L.circle([hazard.coordinates.latitude, hazard.coordinates.longitude], {
          radius: radius * 0.45,
          stroke: false,
          fillColor: heatColor,
          fillOpacity: theme === 'dark' ? 0.35 : 0.25,
        }).addTo(heatGroup);
      });
    }

    // 2. Render Hazard Pins
    hazards.forEach((h) => {
      const isCritical = (h.aiAnalysis?.urgencyScore ?? 0) >= 7.5 || h.status === 'AREA_ALERT';
      const isSelected = selectedHazard?.hazardId === h.hazardId;
      const isDark = theme === 'dark';

      const pinBg = isCritical ? '#DC2626' : isDark ? '#FFFFFF' : '#000000';
      const pinText = isCritical ? '#FFFFFF' : isDark ? '#000000' : '#FFFFFF';
      const pulseRing = isCritical ? `<div class="radar-pulse-ring"></div>` : '';

      const iconHtml = `
        <div class="custom-hazard-marker ${isSelected ? 'marker-selected' : ''}">
          ${pulseRing}
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: ${pinBg};
            color: ${pinText};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 11px;
            border: 2px solid ${isDark ? '#000000' : '#FFFFFF'};
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            cursor: pointer;
            position: relative;
            z-index: 10;
          ">
            ${h.category === 'SEVERE_FLOOD' ? '🌊' : h.category === 'POWER_HAZARD' ? '⚡' : h.category === 'FALLEN_TREE' ? '🌲' : '⚠️'}
          </div>
        </div>
      `;

      const marker = L.marker([h.coordinates.latitude, h.coordinates.longitude], {
        icon: L.divIcon({
          className: 'hazard-pin-container',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        }),
      });

      marker.on('click', () => {
        onSelectHazard(h);
      });

      marker.addTo(markersGroup);
    });

    // 3. Render Standby Field Crew Pins
    if (showCrewMarkers) {
      CREW_LOCATIONS.forEach((crew) => {
        const crewIconHtml = `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background-color: #10B981;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            cursor: pointer;
          " title="${crew.name} (${crew.status})">
            🚒
          </div>
        `;

        const crewMarker = L.marker(crew.coords, {
          icon: L.divIcon({
            className: 'crew-pin-container',
            html: crewIconHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        });

        crewMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px;">
            <strong>${crew.name}</strong><br/>
            <span style="color: #10B981; font-weight: 600;">Status: Standby Unit</span><br/>
            <span style="font-size: 10px; color: #666;">Ready for immediate dispatch</span>
          </div>
        `);

        crewMarker.addTo(markersGroup);
      });
    }
  }, [hazards, showHeatmap, showCrewMarkers, selectedHazard, theme, onSelectHazard]);

  // Center map on selected hazard
  const handleRecenter = (lat: number, lng: number) => {
    mapInstanceRef.current?.flyTo([lat, lng], 15, { duration: 1.2 });
  };

  const handleResetView = () => {
    mapInstanceRef.current?.flyTo(DEFAULT_CENTER, 13, { duration: 1 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 120px)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top Left Command Telemetry Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '300px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio style={{ width: '14px', height: '14px', color: '#EF4444' }} className="animate-pulse" />
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Command Radar Live
            </span>
          </div>
          <button
            onClick={handleResetView}
            title="Reset to Metropolitan Center"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            <Crosshair style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span>Active Pins: <strong>{hazards.length}</strong></span>
          <span>Field Units: <strong>3 Standby</strong></span>
        </div>

        {/* Radius Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginRight: '4px' }}>Radius:</span>
          {[1, 3, 5, 10].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRadiusKm(r)}
              style={{
                padding: '3px 7px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                border: '1px solid var(--border-subtle)',
                backgroundColor: selectedRadiusKm === r ? 'var(--btn-bg)' : 'var(--bg-secondary)',
                color: selectedRadiusKm === r ? 'var(--btn-text)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {r}K
            </button>
          ))}
        </div>
      </div>

      {/* Top Right Map Layers & Toggles */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 1000,
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '11px',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            style={{ accentColor: 'var(--btn-bg)' }}
          />
          <Layers style={{ width: '13px', height: '13px' }} />
          <span>Heatmap Overlay</span>
        </label>

        <span style={{ color: 'var(--border-subtle)' }}>|</span>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={showCrewMarkers}
            onChange={(e) => setShowCrewMarkers(e.target.checked)}
            style={{ accentColor: 'var(--btn-bg)' }}
          />
          <Truck style={{ width: '13px', height: '13px' }} />
          <span>Crew Positions</span>
        </label>
      </div>

      {/* Selected Hazard Inspector Drawer (Slide-Over Card) */}
      {selectedHazard && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '380px',
            maxHeight: 'calc(100% - 40px)',
            overflowY: 'auto',
            zIndex: 1000,
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#DC2626' }}>
                  {selectedHazard.category.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selectedHazard.hazardId}
                </span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>
                {selectedHazard.ward}
              </h4>
            </div>
            <button
              onClick={() => onSelectHazard(null as unknown as HazardDocument)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Media Preview if available */}
          {selectedHazard.mediaUrl && (
            <div style={{ width: '100%', height: '140px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <img
                src={selectedHazard.mediaUrl}
                alt="Hazard scene"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* AI Analysis Grid */}
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <Cpu style={{ width: '13px', height: '13px' }} />
              <span>Multi-Layered AI Verification</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: 'var(--text-secondary)' }}>
              <div>Urgency Score: <strong style={{ color: 'var(--text-primary)' }}>{selectedHazard.aiAnalysis?.urgencyScore ?? 'N/A'}/10</strong></div>
              <div>AI Confidence: <strong style={{ color: 'var(--text-primary)' }}>{((selectedHazard.aiAnalysis?.imageConfidence ?? 0) * 100).toFixed(0)}%</strong></div>
              <div>Cluster Corroboration: <strong style={{ color: 'var(--text-primary)' }}>{selectedHazard.aiAnalysis?.clusterCount ?? 1} report(s)</strong></div>
              <div>Weather Validated: <strong style={{ color: selectedHazard.aiAnalysis?.weatherSupport ? '#10B981' : 'var(--text-muted)' }}>{selectedHazard.aiAnalysis?.weatherSupport ? 'Supported' : 'Neutral'}</strong></div>
            </div>

            {selectedHazard.aiAnalysis?.reasoning && (
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                "{selectedHazard.aiAnalysis.reasoning}"
              </p>
            )}
          </div>

          {/* Reporter Trust & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <ShieldCheck style={{ width: '13px', height: '13px', color: '#10B981' }} />
              <span>Trust: <strong>{selectedHazard.reporterTrustScore ?? 92}/100</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
              <Clock style={{ width: '13px', height: '13px' }} />
              <span>{selectedHazard.createdAt.slice(11, 16)} UTC</span>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
            <button
              onClick={() => onOpenDispatchModal(selectedHazard)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Truck style={{ width: '14px', height: '14px' }} />
              <span>Dispatch Field Crew</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => onStatusChange(selectedHazard.hazardId, 'AREA_ALERT')}
                className="btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                <AlertTriangle style={{ width: '12px', height: '12px', color: '#DC2626' }} />
                <span>Area Alert</span>
              </button>
              <button
                onClick={() => handleRecenter(selectedHazard.coordinates.latitude, selectedHazard.coordinates.longitude)}
                className="btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                <Eye style={{ width: '12px', height: '12px' }} />
                <span>Focus Pin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
