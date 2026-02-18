import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  const loadData = useCallback(async (successMsg = null) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [res, bookRes] = await Promise.all([
        axios.get('https://tsbe-production.up.railway.app/api/admin/dashboard', { headers }),
        token ? axios.get('https://tsbe-production.up.railway.app/api/bookings/my-bookings', { headers }) : Promise.resolve({ data: { bookings: [] } })
      ]);

      setPros((res.data.allPros || []).filter(p => p.isVerified && !p.isSuspended));
      setRequests(bookRes.data.bookings || []);

      if (successMsg) showNotification(successMsg, 'success');
    } catch (err) {
      console.error("Error loading marketplace data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  useEffect(() => { 
    loadData(); 
    const interval = setInterval(() => loadData(), 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loaderText}>Opening Marketplace...</p>
    </div>
  );

  return (
    <div style={styles.pageWrapper}>
      {/* SIDEBAR: 15% width with Skill-Specific Tracking */}
      <aside style={styles.sidebar}>
        <div style={styles.hubHeader}>
          <h3 style={styles.hubTitle}>Live Status</h3>
          <div style={styles.liveBadge}>
            <span style={styles.livePulse}></span>
            LIVE
          </div>
        </div>

        <div style={styles.sidebarScrollArea}>
          {requests.length > 0 ? (
            requests.map(req => {
              // Extract skill name (e.g., Plumber)
              const skillName = req.professional?.skills?.[0] || req.professional?.businessCategory || 'Professional';
              const isAccepted = req.status === 'accepted';
              
              return (
                <div key={req._id} style={{
                  ...styles.requestCard,
                  borderLeft: isAccepted ? '4px solid #10b981' : '4px solid #e2e8f0'
                }}>
                  <p style={styles.miniLabel}>{skillName.toUpperCase()}</p>
                  <p style={styles.reqProName}>{req.professional?.name}</p>
                  
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: isAccepted ? '#ecfdf5' : '#f8fafc',
                    color: isAccepted ? '#059669' : '#64748b'
                  }}>
                    {req.status.toUpperCase()}
                  </div>

                  {isAccepted && (
                    <div style={styles.callAlert}>
                      <p style={styles.alertText}>📞 {skillName} calling soon</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>No active requests</p>
            </div>
          )}
        </div>
        
        <div style={styles.sidebarFooter}>
            <p style={styles.footerText}>Secure Marketplace</p>
        </div>
      </aside>

      {/* MAIN CONTENT: 85% width */}
      <main style={styles.mainContent}>
        {notification.msg && (
          <div style={{
            ...styles.notification,
            backgroundColor: notification.type === 'success' ? '#059669' : '#dc2626'
          }}>
            {notification.msg}
          </div>
        )}

        <header style={styles.marketHeader}>
          <h2 style={styles.title}>Find a Local Professional</h2>
          <p style={styles.subtitle}>Trusted plumbers, painters, and experts in Hargeisa.</p>
        </header>
        
        <div style={styles.proGrid}>
          {pros.map(p => (
            <ProCard 
              key={p._id} 
              pro={p} 
              onAction={(msg) => loadData(msg)} 
              userBookings={requests} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: { 
    display: 'flex', 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif"
  },
  sidebar: { 
    width: '15%', 
    minWidth: '200px',
    backgroundColor: '#fff', 
    borderRight: '1px solid #e2e8f0', 
    padding: '24px 15px', 
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 10px rgba(0,0,0,0.02)'
  },
  hubHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: '20px',
    padding: '0 5px' 
  },
  hubTitle: { fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' },
  livePulse: { width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)' },
  sidebarScrollArea: { flex: 1, overflowY: 'auto' },
  requestCard: { 
    padding: '14px', 
    borderRadius: '12px', 
    backgroundColor: '#fff', 
    border: '1px solid #f1f5f9', 
    marginBottom: '12px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px'
  },
  miniLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', margin: 0, letterSpacing: '0.05em' },
  reqProName: { fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  statusBadge: { alignSelf: 'flex-start', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' },
  callAlert: { padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginTop: '4px', border: '1px solid #dcfce7' },
  alertText: { fontSize: '11px', fontWeight: '800', color: '#166534', margin: 0 },
  sidebarFooter: { marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9', textAlign: 'center' },
  footerText: { fontSize: '11px', color: '#94a3b8', fontWeight: '600' },
  mainContent: { flex: 1, padding: '40px 30px', width: '100%', overflowY: 'auto' },
  marketHeader: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '16px', fontWeight: '500' },
  proGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', width: '100%' },
  emptyContainer: { textAlign: 'center', marginTop: '40px', opacity: 0.6 },
  emptyText: { color: '#94a3b8', fontSize: '12px', fontWeight: '600' },
  loaderContainer: { textAlign: 'center', marginTop: '30vh', color: '#64748b' },
  loaderText: { fontSize: '14px', fontWeight: '600', marginTop: '10px' },
  spinner: { width: '35px', height: '35px', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' },
  notification: { position: 'fixed', top: '25px', right: '25px', padding: '14px 24px', color: '#fff', borderRadius: '12px', zIndex: 1000, fontWeight: '700', fontSize: '14px' }
};