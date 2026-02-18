import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // 👈 IMPORT YOUR CUSTOM API INSTANCE
import ProCard from '../components/ProCard';

export default function Home() {
  const navigate = useNavigate();
  const [pros, setPros] = useState([]);
  const [notification, setNotification] = useState({ msg: '', type: '' });

  const fetchPros = async () => {
    try {
      // ✅ Uses the professional API instance (Railway URL)
      // Even without a token, this request will work for public data
      const res = await API.get('/admin/dashboard');
      
      const publicList = (res.data.allPros || []).filter(
        p => p.isVerified && p.email !== 'himiloone@gmail.com'
      );
      
      // Show top 3 pros on the landing page
      setPros(publicList.slice(0, 3));
    } catch (err) { 
      console.log("Home fetch error:", err); 
    }
  };

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchPros();
  }, []);

  return (
    <div style={styles.pageContainer}>
      
      {/* CSS Animation for Notification */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* --- IN-PAGE NOTIFICATION TOAST --- */}
      {notification.msg && (
        <div style={{
          ...styles.toast,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#3b82f6',
        }}>
          {notification.msg}
        </div>
      )}

      {/* --- HERO SECTION --- */}
      <h1 style={styles.brandTag}>Target Solution</h1>
      
      <h2 style={styles.heroTitle}>
        Ku soo dhawaaw <span style={{ color: '#3b82f6' }}>Target Solution</span>. <br />
        Ku soo biir si aad u hesho xirfadle, <br />
        ama si aad u iibiso xirfadaada.
      </h2>

      <p style={styles.heroSubtitle}>
        Xalka ugu habboon ee lagu xiro macaamiisha iyo xirfadlayaasha Hargeisa.
      </p>
      
      <button 
        onClick={() => navigate('/login')} 
        style={styles.ctaButton}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        Get Started / Ku Biir
      </button>

      {/* --- FEATURED PROS GRID --- */}
      <div style={styles.proGrid}>
        {pros.map(p => (
          <ProCard 
            key={p._id} 
            pro={p} 
            role="guest" 
            onAction={() => showNotification("Fadlan marka hore gal nidaamka (Login) si aad u hesho xirfadlahan.", "error")}
          />
        ))}
      </div>
    </div>
  );
}

// --- Styles Object ---
const styles = {
  pageContainer: { 
    textAlign: 'center', 
    padding: '80px 20px', 
    backgroundColor: '#fff', 
    minHeight: '100vh' 
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    color: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    fontWeight: 'bold',
    animation: 'slideIn 0.3s ease-out'
  },
  brandTag: { 
    fontSize: '14px', 
    letterSpacing: '3px', 
    color: '#3b82f6', 
    fontWeight: '800', 
    textTransform: 'uppercase',
    marginBottom: '10px'
  },
  heroTitle: { 
    fontSize: '2.8rem', 
    fontWeight: '900', 
    margin: '20px 0', 
    lineHeight: '1.2',
    color: '#0f172a'
  },
  heroSubtitle: { 
    color: '#64748b', 
    fontSize: '1.1rem', 
    marginBottom: '40px',
    maxWidth: '700px',
    margin: '0 auto 40px auto'
  },
  ctaButton: { 
    padding: '18px 50px', 
    backgroundColor: '#000', 
    color: '#fff', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    border: 'none', 
    fontSize: '1rem',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.2)'
  },
  proGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '30px', 
    marginTop: '80px', 
    maxWidth: '1200px', 
    marginLeft: 'auto',
    marginRight: 'auto'
  }
};