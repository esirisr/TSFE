import React, { useState } from 'react';
import API from '../api'; // Ensure your api.js is one folder up

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const [status, setStatus] = useState({ msg: '', isError: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setStatus({ msg: '', isError: false });

    try {
      // ✅ Correct: Uses the API instance which handles the Railway URL
      const res = await API.post('/auth/login', { 
        email: email.toLowerCase().trim(),
        password 
      });

      // ✅ Securely store auth data
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      
      // Handle cases where user object might be nested differently
      const userEmail = res.data.user?.email || email.toLowerCase().trim();
      localStorage.setItem('email', userEmail); 

      setStatus({ msg: "Success! Redirecting to dashboard...", isError: false });

      // Refresh to update App state with new token
      setTimeout(() => {
        window.location.href = '/'; 
      }, 1500);

    } catch (err) {
      console.error("Login Error:", err);
      setStatus({ 
        msg: err.response?.data?.message || "Login failed. Check your internet or credentials.", 
        isError: true 
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={titleStyle}>Welcome Back</h2>
        <p style={subtitleStyle}>Please enter your details to sign in</p>

        {status.msg && (
          <div style={{
            ...messageStyle,
            backgroundColor: status.isError ? '#fee2e2' : '#dcfce7',
            color: status.isError ? '#991b1b' : '#166534',
            border: `1px solid ${status.isError ? '#fecaca' : '#bbf7d0'}`
          }}>
            {status.msg}
          </div>
        )}

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email Address</label>
          <input 
            type="email" 
            placeholder="name@company.com" 
            style={inputStyle} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            style={inputStyle} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            ...buttonStyle, 
            opacity: loading ? 0.7 : 1, 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <p style={footerStyle}>
          Don't have an account? <a href="/register" style={linkStyle}>Register</a>
        </p>
      </form>
    </div>
  );
}

// --- Professional Styles ---
const containerStyle = { 
  height: '90vh', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  backgroundColor: '#f8fafc' 
};

const formStyle = { 
  padding: '40px', 
  backgroundColor: '#fff', 
  borderRadius: '16px', 
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
  width: '100%',
  maxWidth: '400px' 
};

const titleStyle = { textAlign: 'center', margin: '0 0 10px 0', fontWeight: '800', color: '#1e293b' };
const subtitleStyle = { textAlign: 'center', color: '#64748b', marginBottom: '25px', fontSize: '14px' };
const inputGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' };
const buttonStyle = { width: '100%', padding: '14px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s' };
const messageStyle = { padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', fontWeight: '500' };
const footerStyle = { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' };
const linkStyle = { color: '#000', fontWeight: '700', textDecoration: 'none' };