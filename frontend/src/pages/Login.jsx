import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await login({ email, password });

      const { token, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'admin') navigate('/admin');
      else if (role === 'pro') navigate('/pro-dashboard');
      else if (role === 'client') navigate('/client-home');
      else navigate('/');

      alert("Welcome back!");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form
        onSubmit={handleLogin}
        style={{
          padding: '40px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          width: '400px'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={buttonStyle}>
          Sign In
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxSizing: 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#000',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
