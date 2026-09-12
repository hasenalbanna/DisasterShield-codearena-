import { Users, Search, Ban, UserCheck } from 'lucide-react';

export function UserManagementView() {
  const users = [
    { id: 'USR-8821', name: 'David Miller', type: 'Field Inspector', reports: 42, trustScore: 98, status: 'VERIFIED', joinDate: '2025-01-15' },
    { id: 'USR-9932', name: 'Sarah Jenkins', type: 'Citizen', reports: 5, trustScore: 89, status: 'VERIFIED', joinDate: '2025-04-22' },
    { id: 'USR-1145', name: 'Anonymous', type: 'Citizen', reports: 1, trustScore: 45, status: 'PENDING', joinDate: '2026-09-10' },
    { id: 'USR-3329', name: 'John Smith', type: 'Citizen', reports: 12, trustScore: 12, status: 'SUSPENDED', joinDate: '2025-11-05' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="minimal-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>User Management</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Monitor citizen reporters and field inspector accounts.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '8px 12px', background: 'var(--bg-secondary)', 
              borderRadius: '8px', border: '1px solid var(--border-subtle)' 
            }}>
              <Search style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search users..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', width: '200px' }} />
            </div>
            <button className="btn-secondary">
              <Users style={{ width: '16px', height: '16px' }} />
              <span>Export List</span>
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>User ID</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Account Type</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Reports</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Trust Score</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{user.id}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{user.type}</td>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)' }}>{user.reports}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${user.trustScore}%`, 
                          background: user.trustScore > 80 ? '#10B981' : user.trustScore > 50 ? '#F59E0B' : '#EF4444' 
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>{user.trustScore}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                      background: user.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' : user.status === 'SUSPENDED' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                      color: user.status === 'VERIFIED' ? '#10B981' : user.status === 'SUSPENDED' ? '#EF4444' : 'var(--text-secondary)',
                      border: `1px solid ${user.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.2)' : user.status === 'SUSPENDED' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-subtle)'}`
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }} title="Verify User"><UserCheck style={{ width: '16px', height: '16px' }} /></button>
                      <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Suspend User"><Ban style={{ width: '16px', height: '16px' }} /></button>
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
