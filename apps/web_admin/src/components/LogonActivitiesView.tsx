import { Activity, Clock, ShieldAlert, Monitor, Server } from 'lucide-react';

export function LogonActivitiesView() {
  const logs = [
    { id: 'LOG-9921', timestamp: '2026-09-12 14:22:15', user: 'ADM-001 (Hasen Albanna)', action: 'LOGIN_SUCCESS', ip: '192.168.1.105', device: 'Chrome / Windows', location: 'Command Center A' },
    { id: 'LOG-9920', timestamp: '2026-09-12 14:15:02', user: 'SYSTEM_CRON', action: 'DB_SYNC', ip: 'internal', device: 'Backend Service', location: 'us-central1' },
    { id: 'LOG-9919', timestamp: '2026-09-12 13:45:11', user: 'ADM-003 (Marcus Wright)', action: 'LOGOUT', ip: '10.0.0.52', device: 'Safari / macOS', location: 'Remote (VPN)' },
    { id: 'LOG-9918', timestamp: '2026-09-12 11:30:05', user: 'UNKNOWN', action: 'LOGIN_FAILED', ip: '45.22.19.112', device: 'Unknown', location: 'External Network' },
    { id: 'LOG-9917', timestamp: '2026-09-12 09:00:00', user: 'ADM-002 (Sarah Connor)', action: 'LOGIN_SUCCESS', ip: '192.168.1.106', device: 'Firefox / Windows', location: 'Command Center B' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="minimal-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>Security Audit & Logon Logs</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>System-wide authentication and critical action audit trail.</p>
          </div>
          <button className="btn-secondary">
            <Activity style={{ width: '16px', height: '16px' }} />
            <span>Download Audit Trail</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Event ID</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>User / Principal</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>IP Address</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Device Info</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      {log.timestamp}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{log.id}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{log.user}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                      background: log.action.includes('SUCCESS') ? 'rgba(16, 185, 129, 0.1)' : log.action.includes('FAILED') ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                      color: log.action.includes('SUCCESS') ? '#10B981' : log.action.includes('FAILED') ? '#EF4444' : 'var(--text-secondary)'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{log.ip}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {log.device.includes('Service') ? <Server style={{ width: '14px', height: '14px' }} /> : <Monitor style={{ width: '14px', height: '14px' }} />}
                      {log.device}
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({log.location})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
