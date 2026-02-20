import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function ProDashboard() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [bookingsRes, profileRes] = await Promise.all([
        API.get('/bookings/my-bookings'),
        API.get('/pros/profile')
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setUser(profileRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await API.patch('/bookings/update-status', { bookingId, status: newStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Workspace...</div>;

  const isVerified = user?.isVerified === true || user?.status === 'approved';

  return (
    <div style={dashStyles.container}>
      <header style={dashStyles.header}>
        <h1 style={dashStyles.title}>Professional Workspace</h1>
        <p style={dashStyles.subtitle}>Manage your incoming hire requests below</p>
      </header>

      <div style={dashStyles.grid}>
        {/* Main Card */}
        <div style={dashStyles.mainCard}>
          <h3 style={{ marginBottom: '20px' }}>Incoming Hire Requests</h3>

          {bookings.length > 0 ? bookings.map(req => (
            <div key={req._id} style={{
              ...dashStyles.item,
              borderLeft: req.status === 'approved' ? '5px solid #10b981' :
                          req.status === 'rejected' ? '5px solid #ef4444' :
                          '5px solid #f59e0b'
            }}>
              <div style={dashStyles.itemContent}>
                <div>
                  <p style={dashStyles.clientName}><strong>Customer:</strong> {req.client?.name}</p>
                  <p style={dashStyles.clientInfo}><strong>Email:</strong> {req.client?.email}</p>
                  <p style={dashStyles.statusText}>Status: <span style={{ fontWeight: '800' }}>{req.status.toUpperCase()}</span></p>
                </div>

                {req.status === 'pending' && isVerified && (
                  <div style={dashStyles.actions}>
                    <button onClick={() => handleStatusUpdate(req._id, 'approved')} style={dashStyles.acceptBtn}>Accept</button>
                    <button onClick={() => handleStatusUpdate(req._id, 'rejected')} style={dashStyles.rejectBtn}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No requests yet.</p>
          )}
        </div>

        {/* Side Card */}
        <div style={{
          ...dashStyles.sideCard,
          border: isVerified ? '1px solid #e2e8f0' : '2px solid #fbbf24',
          backgroundColor: isVerified ? '#ffffff' : '#fffdfa'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Profile Status</h3>
          <div style={{
            color: isVerified ? '#10b981' : '#ea580c',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>●</span>
            {isVerified ? 'Active & Approved' : 'Under Review'}
          </div>
          <div style={dashStyles.divider} />
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
            {isVerified
              ? "Tip: Accepting requests quickly improves your ranking."
              : "Your profile is under review. You will be able to accept jobs once an admin approves you."}
          </p>
        </div>
      </div>
    </div>
  );
}

const dashStyles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: '30px' },
  title: { fontSize: '2.5rem', fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: '1.1rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' },
  mainCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  sideCard: { padding: '25px', borderRadius: '20px', height: 'fit-content' },
  item: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '15px' },
  itemContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clientName: { margin: '0', fontSize: '1.1rem' },
  clientInfo: { margin: '5px 0', color: '#64748b', fontSize: '0.9rem' },
  statusText: { margin: '5px 0', fontSize: '0.85rem' },
  actions: { display: 'flex', gap: '10px' },
  acceptBtn: { padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  rejectBtn: { padding: '10px 20px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '15px 0' }
};
