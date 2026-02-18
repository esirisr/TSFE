import React, { useState, useEffect } from 'react';
import API from '../api'; // 👈 IMPORT YOUR CUSTOM API INSTANCE
import AdminCard from '../components/AdminCard';

export default function AdminDashboard() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  // ✅ Clean, centralized fetching logic
  const fetchData = async () => {
    try {
      // API instance handles the BaseURL and the Bearer Token automatically
      const res = await API.get('/admin/dashboard');
      setPros(res.data.allPros || []);
    } catch (err) {
      console.error("Admin fetch failed", err);
      showNotification("Failed to load management data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 3500);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // ✅ Clean action handler using the API instance
  const handleAction = async (id, type) => {
    try {
      // type will be 'verify', 'reject', or 'delete' based on your backend routes
      await API.post(`/admin/${type}`, { id });
      
      const message = type === 'delete' ? "User removed" : `Status updated: ${type}`;
      showNotification(message, "success");
      fetchData(); // Refresh the list
    } catch (err) {
      console.error("Action failed:", err);
      showNotification(err.response?.data?.message || "Action failed", "error");
    }
  };

  if (loading) return (
    <div style={styles.loaderContainer}>
      <div style={styles.loader}>Loading Admin Console...</div>
    </div>
  );

  return (
    <div style={styles.dashboardWrapper}>
      
      {/* --- NOTIFICATION BANNER --- */}
      {notification.msg && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#0f172a',
        }}>
          {notification.type === 'error' ? '⚠️ ' : '✅ '} {notification.msg}
        </div>
      )}

      {/* --- CENTERED HEADER SECTION --- */}
      <header style={styles.header}>
        <h1 style={styles.title}>Management Console</h1>
        <div style={styles.underline}></div>
        <p style={styles.subtitle}>
          Manage registered professionals and verify account credentials.
        </p>
      </header>

      {/* --- CENTERED GRID SYSTEM --- */}
      <div style={styles.gridContainer}>
        {pros.length > 0 ? (
          pros.map((pro) => (
            <AdminCard key={pro._id} pro={pro} onAction={handleAction} />
          ))
        ) : (
          <div style={styles.emptyState}>
            <h3>No professionals found in the database.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES OBJECT ---
const styles = {
  dashboardWrapper: {
    padding: '40px 20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
    width: '100%',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0',
    letterSpacing: '-1px',
  },
  underline: {
    width: '80px',
    height: '5px',
    backgroundColor: '#3b82f6',
    margin: '15px auto',
    borderRadius: '10px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    width: '100%',
    maxWidth: '1300px',
    justifyContent: 'center',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 30px',
    color: '#fff',
    borderRadius: '50px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    fontWeight: '600',
    fontSize: '14px',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '100px',
    color: '#94a3b8',
    border: '2px dashed #e2e8f0',
    borderRadius: '20px',
    width: '100%'
  },
  loaderContainer: {
    textAlign: 'center',
    padding: '100px',
    fontFamily: 'sans-serif',
    backgroundColor: '#f8fafc',
    height: '100vh'
  }
};