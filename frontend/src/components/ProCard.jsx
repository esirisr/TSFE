import React, { useState } from 'react';
import axios from 'axios';

export default function ProCard({ pro, onAction, userBookings = [] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const data = pro.professional || pro;
  const displayName = data.businessName || data.name || "Provider";
  const displaySkill = (data.skills && data.skills.length > 0) ? data.skills[0] : (data.businessCategory || "Professional");

  // RATING LOGIC: Check if user has an accepted/approved job to rate
  const bookingToRate = userBookings.find(b => 
    b.professional?._id === data._id && 
    (b.status === 'approved' || b.status === 'accepted') && 
    !b.rating
  );
  const canRate = !!bookingToRate;
  const averageRating = data.rating ? Number(data.rating).toFixed(1) : "0.0";

  const handleRate = async (val) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bookings/rate', 
        { bookingId: bookingToRate._id, ratingValue: val }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rating submitted! Thank you.");
      onAction(); 
    } catch (err) {
      alert("Error saving rating.");
    }
  };

  const handleHire = async () => {
    const hasPending = userBookings.some(b => b.professional?._id === data._id && b.status === 'pending');
    if (hasPending) {
      alert(`You already ordered one ${displaySkill.toLowerCase()}! Please wait.`);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Please login first.");
      setIsBooking(true);
      await axios.post('http://localhost:5000/api/bookings/create', { proId: data._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Hiring request sent successfully!");
      onAction();
    } catch (err) {
      const msg = err.response?.data?.message || "";
      alert(msg.includes("limit") ? `Daily limit reached for this ${displaySkill}.` : "Booking failed.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{...styles.card, transform: isHovered ? 'translateY(-10px)' : 'none'}}
    >
      <div style={styles.statusBadge}>● Active & Verified</div>

      <div style={styles.header}>
        <h2 style={styles.name}>{displayName}</h2>
        <div style={styles.skillTag}>{displaySkill}</div>
      </div>

      <div style={styles.infoSection}>
        <div>📍 {data.location || "Laascaanood"}</div>
        <div>📞 {data.phone || "N/A"}</div>
      </div>

      <div style={styles.footer}>
        <div style={styles.availability}>Availability <span>{data.dailyRequestCount || 0}/3</span></div>
        <div style={styles.progressBg}>
          <div style={{...styles.progressFill, width: `${((data.dailyRequestCount || 0) / 3) * 100}%`}} />
        </div>
        
        <button 
          onClick={handleHire}
          disabled={isBooking || data.dailyRequestCount >= 3}
          style={{
            ...styles.hireButton,
            backgroundColor: (isBooking || data.dailyRequestCount >= 3) ? '#94a3b8' : '#4f46e5'
          }}
        >
          {data.dailyRequestCount >= 3 ? 'Limit Reached' : (isBooking ? '...' : `Hire ${displaySkill}`)}
        </button>

        {/* --- RATING SECTION MOVED UNDER HIRE BUTTON --- */}
        <div style={styles.ratingSection}>
          <div style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                onMouseEnter={() => canRate && setHoverStar(s)}
                onMouseLeave={() => canRate && setHoverStar(0)}
                onClick={() => canRate && handleRate(s)}
                style={{
                  fontSize: '24px',
                  cursor: canRate ? 'pointer' : 'default',
                  color: s <= (hoverStar || data.rating) ? '#f59e0b' : '#e2e8f0',
                  padding: '0 2px'
                }}
              >★</span>
            ))}
          </div>
          <div style={styles.ratingLabel}>
            <strong>{averageRating}</strong> ({data.reviewCount || 0} reviews)
          </div>
          {canRate && <div style={styles.rateNowText}>Please rate this professional!</div>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { position: 'relative', padding: '25px', borderRadius: '24px', backgroundColor: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: '0.3s ease', display: 'flex', flexDirection: 'column', border: '1px solid #f1f5f9' },
  statusBadge: { position: 'absolute', top: '15px', right: '15px', backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
  header: { marginBottom: '15px' },
  name: { fontSize: '1.4rem', fontWeight: '900', margin: '0 0 5px 0' },
  skillTag: { fontSize: '11px', color: '#4338ca', fontWeight: 'bold', textTransform: 'uppercase' },
  infoSection: { marginBottom: '20px', fontSize: '14px', color: '#475569', lineHeight: '1.6' },
  footer: { marginTop: 'auto' },
  availability: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: '600' },
  progressBg: { height: '6px', backgroundColor: '#f1f5f9', borderRadius: '10px', marginBottom: '15px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366f1', transition: 'width 0.3s' },
  hireButton: { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' },
  // NEW RATING STYLES
  ratingSection: { 
    borderTop: '1px solid #f1f5f9', 
    paddingTop: '15px', 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  starRow: { display: 'flex', justifyContent: 'center', marginBottom: '5px' },
  ratingLabel: { fontSize: '13px', color: '#64748b' },
  rateNowText: { fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginTop: '5px' }
};