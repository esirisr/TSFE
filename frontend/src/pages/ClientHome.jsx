import React, { useState, useEffect, useCallback } from 'react';
import API from '../api'; // 👈 IMPORT YOUR CUSTOM API INSTANCE
import ProCard from '../components/ProCard';

export default function ClientHome() {
  const [pros, setPros] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  // ✅ Clean data loading using the API instance
  const loadData = useCallback(async (successMsg = null) => {
    try {
      const token = localStorage.getItem('token');
      
      // We fetch pros (marketplace) and bookings (sidebar status) at once
      const [res, bookRes] = await Promise.all([
        API.get('/admin/dashboard'), // Assuming this returns all pros
        token ? API.get('/bookings/my-bookings') : Promise.resolve({ data: { bookings: [] } })
      ]);

      // Filter for verified/active pros only
      const verifiedPros = (res.data.allPros || []).filter(p => p.isVerified && !p.isSuspended);
      setPros(verifiedPros);
      setRequests(bookRes.data.bookings || []);

      if (successMsg) showNotification(successMsg, 'success');
    } catch (err) {
      console.error("Marketplace fetch error:", err);
      // Only show error if it's not a 401 (which api.js handles)
      if (err.response?.status !== 401) {
        showNotification("Could not sync with marketplace", "error");
      }
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
    // Auto-refresh every 20 seconds to catch live status updates
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
      {/* SIDEBAR: Status Tracking */}
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
              const skillName = req.professional?.skills?.[0] || 'Professional';
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
                      <p style={styles.alertText}>📞 Will contact you soon</p>
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

      {/* MAIN CONTENT */}
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
          <h2 style={styles.title}>Professional Marketplace</h2>
          <p style={styles.subtitle}>Verified experts available in Hargeisa</p>
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
  pageWrapper: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  sidebar: { width: '18%', minWidth: '220px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px 15px', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.02)' },
  hubHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  hubTitle: { fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },
  liveBadge: { display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' },
  livePulse: { width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)' },
  sidebarScrollArea: { flex: 1, overflowY: 'auto' },
  requestCard: { padding: '14px', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #f1f5f9', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  miniLabel: { fontSize: '9px', fontWeight: '800', color: '#94a3b8', margin: 0 },
  reqProName: { fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 },
  statusBadge: { alignSelf: 'flex-start', padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '800' },
  callAlert: { padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginTop: '4px' },
  alertText: { fontSize: '10px', fontWeight: '800', color: '#166534', margin: 0 },
  sidebarFooter: { marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9' },
  footerText: { fontSize: '10px', color: '#94a3b8', textAlign: 'center' },
  mainContent: { flex: 1, padding: '40px', overflowY: 'auto' },
  marketHeader: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '900', color: '#0f172a' },
  subtitle: { color: '#64748b', fontSize: '16px' },
  proGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  loaderContainer: { textAlign: 'center', marginTop: '30vh' },
  spinner: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' },
  notification: { position: 'fixed', top: '25px', right: '25px', padding: '14px 24px', color: '#fff', borderRadius: '12px', zIndex: 1000, fontWeight: '700' }
};