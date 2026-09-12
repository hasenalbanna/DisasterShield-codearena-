import { Shield, ShieldCheck, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export function AdminManagementView() {
  const admins = [
    { id: 'ADM-001', name: 'Hasen Albanna', role: 'System Commander', email: 'hasen@disastershield.gov', status: 'ONLINE', lastActive: 'Now' },
    { id: 'ADM-002', name: 'Sarah Connor', role: 'Lead Dispatcher', email: 's.connor@disastershield.gov', status: 'ONLINE', lastActive: '2m ago' },
    { id: 'ADM-003', name: 'Marcus Wright', role: 'AI Analyst', email: 'm.wright@disastershield.gov', status: 'OFFLINE', lastActive: '4h ago' },
    { id: 'ADM-004', name: 'Elena Rodriguez', role: 'Field Coordinator', email: 'e.rodriguez@disastershield.gov', status: 'OFFLINE', lastActive: '1d ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="minimal-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>System Administrators</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Manage platform access levels and administrative roles.</p>
          </div>
          <button className="btn-primary">
            <ShieldCheck style={{ width: '16px', height: '16px' }} />
            <span>Add Administrator</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Admin ID</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{admin.id}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                        <Shield style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                      </div>
                      {admin.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>{admin.role}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{admin.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                      background: admin.status === 'ONLINE' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                      color: admin.status === 'ONLINE' ? '#10B981' : 'var(--text-secondary)',
                      border: `1px solid ${admin.status === 'ONLINE' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-subtle)'}`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: admin.status === 'ONLINE' ? '#10B981' : 'var(--text-muted)' }} />
                      {admin.status} ({admin.lastActive})
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 style={{ width: '16px', height: '16px' }} /></button>
                      <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 style={{ width: '16px', height: '16px' }} /></button>
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
