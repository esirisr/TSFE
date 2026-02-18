import React, { useState, useEffect, useCallback } from 'react';
import API from '../api'; // 👈 IMPORT YOUR CUSTOM API INSTANCE

export default function ProDashboard() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  // ✅ Clean data fetching using centralized API
  const fetchData = useCallback(async () => {
    try {
      // API instance handles the Railway URL and Token automatically
      const [bookingsRes, profileRes] = await Promise.all([
        API.get('/bookings/my-bookings'),
        API.get('/pros/profile')
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setUser(profileRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err.message);
      // If 401, api.js will redirect to login automatically
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // ✅ PATCH request to update booking status
      await API.patch('/bookings/update-status', { 
        bookingId: bookingId, 
        status: newStatus 
      });

      showNotification(`Request ${newStatus} successfully!`);
      fetchData(); // Refresh list to update UI
    } catch (err) {
      console.error("Update Details:", err.response?.data);
      showNotification(err.response?.data?.message || "Update failed", "error");
    }
  };

  if (loading) return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loaderText}>Opening Professional Workspace...</p>
    </div>
  );

  const isVerified = user?.isVerified === true || user?.status === 'approved';

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <h1 style={styles.title}>Professional Workspace</h1>
        <div style={styles.underline}></div>
        <p style={styles.subtitle}>Manage your incoming hire requests and track your status.</p>
      </header>

      {/* Notification Toast */}
      {notification.msg && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981'
        }}>
          {notification.msg}
        </div>
      )}

      <div style={styles.layoutGrid}>
        {/* Main Section: Requests */}
        <div style={styles.mainCard}>
          <h3 style={styles.cardTitle}>Incoming Requests</h3>
          
          {bookings.length > 0 ? (
            bookings.map((req) => (
              <div key={req._id} style={{
                ...styles.requestItem,
                borderLeft: req.status === 'accepted' ? '6px solid #10b981' : req.status === 'rejected' ? '6px solid #ef4444' : '6px solid #f59e0b'
              }}>
                <div style={styles.itemContent}>
                  <div>
                    <p style={styles.clientName}><strong>Customer:</strong> {req.client?.name || 'Client'}</p>
                    <p style={styles.clientEmail}>{req.client?.email}</p>
                    <p style={styles.statusLabel}>
                      Status: <span style={{ color: req.status === 'accepted' ? '#10b981' : '#64748b', fontWeight: '800' }}>
                        {req.status.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div style={styles.actionGroup}>
                      {isVerified ? (
                        <>
                          <button onClick={() => handleStatusUpdate(req._id, 'accepted')} style={styles.btnAccept}>Accept</button>
                          <button onClick={() => handleStatusUpdate(req._id, 'rejected')} style={styles.btnReject}>Reject</button>
                        </>
                      ) : (
                        <span style={styles.lockedBadge}>Pending Verification</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={styles.emptyText}>No requests found at this time.</p>
          )}
        </div>

        {/* Side Section: Account Status */}
        <aside style={{
          ...styles.sideCard,
          border: isVerified ? '1px solid #e2e8f0' : '2px solid #fbbf24',
          backgroundColor: isVerified ? '#ffffff' : '#fffdfa'
        }}>
          <h3 style={styles.sideTitle}>Account Status</h3>
          <div style={{ 
            color: isVerified ? '#10b981' : '#ea580c', 
            fontWeight: '900',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>{isVerified ? '✓' : '●'}</span> 
            {isVerified ? 'VERIFIED' : 'PENDING REVIEW'}
          </div>
          <hr style={styles.divider} />
          <p style={styles.tipText}>
            {isVerified 
              ? "You are live! Customers in Hargeisa can now see your profile and book your services." 
              : "An admin is currently reviewing your documents. You cannot accept requests until verified."}
          </p>
        </aside>
      </div>
    </div>
  );
}

// --- Professional Styles ---
const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '50px' },
  title: { fontSize: '2.8rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' },
  underline: { width: '60px', height: '4px', backgroundColor: '#3b82f6', margin: '12px auto', borderRadius: '10px' },
  subtitle: { color: '#64748b', fontSize: '1.1rem' },
  notification: { position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', padding: '12px 30px', color: '#fff', borderRadius: '50px', zIndex: 1000, fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
  layoutGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px', width: '100%' },
  mainCard: { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  sideCard: { padding: '25px', borderRadius: '24px', height: 'fit-content', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  cardTitle: { margin: '0 0 25px 0', fontSize: '1.4rem', color: '#1e293b', fontWeight: '800' },
  requestItem: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '15px', border: '1px solid #f1f5f9' },
  itemContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clientName: { margin: 0, fontSize: '1.1rem', color: '#1e293b' },
  clientEmail: { margin: '2px 0', fontSize: '0.85rem', color: '#64748b' },
  statusLabel: { margin: '8px 0 0 0', fontSize: '0.85rem' },
  actionGroup: { display: 'flex', gap: '10px' },
  btnAccept: { padding: '10px 24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  btnReject: { padding: '10px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  lockedBadge: { color: '#f59e0b', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', backgroundColor: '#fff7ed', padding: '6px 12px', borderRadius: '6px' },
  sideTitle: { margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '700' },
  divider: { border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' },
  tipText: { fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' },
  emptyText: { textAlign: 'center', color: '#94a3b8', padding: '40px', fontWeight: '500' },
  loaderContainer: { textAlign: 'center', marginTop: '30vh', color: '#64748b' },
  spinner: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' },
  loaderText: { fontSize: '1.1rem', marginTop: '15px', fontWeight: '500' }
};