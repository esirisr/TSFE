import React, { useState, useEffect } from 'react';
import API from '../api'; // 👈 IMPORT YOUR CUSTOM API INSTANCE
import AdminCard from '../components/AdminCard';

export default function Admin() {
  const [data, setData] = useState({ allPros: [], stats: {} });
  const [loading, setLoading] = useState(true);
  
  // States for UI feedback
  const [notification, setNotification] = useState({ msg: '', type: '' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const loadData = async () => {
    try {
      // API instance handles the Railway URL and Token automatically
      const res = await API.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
      showNotification("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification({ msg: '', type: '' }), 4000);
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id, type) => {
    try {
      if (type === 'verify') {
        await API.patch(`/admin/verify/${id}`);
        showNotification("Professional verified successfully!");
      } else if (type === 'suspend') {
        await API.patch(`/admin/toggle-suspension/${id}`);
        showNotification("Suspension status toggled.");
      } else if (type === 'delete') {
        setConfirmDelete({ show: true, id });
        return; 
      }
      
      loadData(); // Refresh list after action
    } catch (err) {
      showNotification(err.response?.data?.message || "Action failed!", "error");
    }
  };

  const executeDelete = async () => {
    const { id } = confirmDelete;
    try {
      await API.delete(`/admin/user/${id}`);
      showNotification("Account permanently deleted.", "success");
      setConfirmDelete({ show: false, id: null });
      loadData();
    } catch (err) {
      showNotification("Delete failed", "error");
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'100px', color: '#64748b'}}>Loading Console...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', position: 'relative' }}>
      
      {/* --- FLOATING NOTIFICATION --- */}
      {notification.msg && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          padding: '12px 25px', color: '#fff', borderRadius: '8px', zIndex: 2000,
          backgroundColor: notification.type === 'error' ? '#ef4444' : '#0f172a',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', fontWeight: 'bold'
        }}>
          {notification.msg}
        </div>
      )}

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {confirmDelete.show && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h3 style={{marginTop: 0}}>Confirm Deletion</h3>
            <p style={{color: '#64748b'}}>This action cannot be undone. All data for this professional will be wiped. Are you sure?</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button onClick={executeDelete} style={modalStyles.deleteBtn}>Yes, Delete</button>
              <button onClick={() => setConfirmDelete({ show: false, id: null })} style={modalStyles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <header style={{ marginBottom: '40px' }}>
        <h1 style={{fontWeight: '900', fontSize: '2.5rem', margin: 0, color: '#0f172a'}}>Management Console</h1>
        <p style={{color: '#64748b', marginTop: '5px'}}>Control center for vetting and managing platform experts.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
        {data.allPros.length > 0 ? (
          data.allPros.map(pro => (
            <AdminCard key={pro._id} pro={pro} onAction={handleAction} />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
            No accounts found.
          </div>
        )}
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  content: { backgroundColor: '#fff', padding: '35px', borderRadius: '20px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  deleteBtn: { flex: 1, padding: '14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }
};