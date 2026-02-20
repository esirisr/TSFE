import React, { useState } from 'react';

export default function AdminCard({ pro, onAction }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isPending = !pro.isVerified;

  // STRICT RATING LOGIC: Ensures new pros show 0.0, not 5.0
  const isUnrated = !pro.reviewCount || pro.reviewCount === 0;
  const displayRating = isUnrated ? "0.0" : Number(pro.rating).toFixed(1);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        border: isPending ? '2px dashed #3b82f6' : '1px solid #e2e8f0',
      }}
    >
      <div style={{
        ...styles.statusHeader, 
        backgroundColor: isPending ? '#eff6ff' : '#f0f9ff'
      }}>
        <span style={{
          color: isPending ? '#3b82f6' : '#0284c7', 
          fontWeight: 'bold', fontSize: '11px'
        }}>
          {isPending ? '⏳ PENDING APPROVAL' : '✅ LIVE ON PLATFORM'}
        </span>
      </div>

      <div style={styles.content}>
        <h2 style={styles.name}>{pro.name}</h2>
        <p style={styles.email}>{pro.email}</p>
        
        <div style={styles.statsRow}>
          {/* AVAILABILITY SECTION REMOVED FROM HERE */}
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Current Rating</span>
            <span style={{...styles.statValue, color: isUnrated ? '#94a3b8' : '#f59e0b'}}>
              ⭐ {displayRating} ({pro.reviewCount || 0})
            </span>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.buttonGroup}>
          {isPending && (
            <button 
              onClick={() => onAction(pro._id, 'verify')}
              style={{ ...styles.actionBtn, backgroundColor: '#3b82f6' }}
            >
              Approve Professional
            </button>
          )}
          
          <button 
            onClick={() => onAction(pro._id, 'delete')}
            style={{ ...styles.actionBtn, backgroundColor: '#ef4444' }}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  statusHeader: { padding: '10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' },
  content: { padding: '24px' },
  name: { fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0' },
  email: { fontSize: '14px', color: '#64748b', marginBottom: '20px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '20px' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' },
  statValue: { fontSize: '14px', fontWeight: '700' },
  divider: { height: '1px', backgroundColor: '#f1f5f9', marginBottom: '20px' },
  buttonGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  actionBtn: { width: '100%', padding: '12px', borderRadius: '12px', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }
};