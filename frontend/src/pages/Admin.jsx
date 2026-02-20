import React, { useState, useEffect } from 'react';
import {
  fetchDashboard,
  verifyPro,
  suspendPro,
  deleteUser
} from '../services/api';
import AdminCard from '../components/AdminCard';

export default function Admin() {
  const [data, setData] = useState({ allPros: [], stats: {} });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Admin Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id, type) => {
    try {
      if (type === 'verify') {
        await verifyPro(id);
      } 
      else if (type === 'suspend') {
        await suspendPro(id);
      } 
      else if (type === 'delete') {
        if (window.confirm("Permanently delete this professional?")) {
          await deleteUser(id);
        }
      }

      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed!");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading Console...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontWeight: '900', fontSize: '2rem', marginBottom: '30px' }}>
        Management Console
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '25px',
        }}
      >
        {data.allPros.map((pro) => (
          <AdminCard key={pro._id} pro={pro} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
}
