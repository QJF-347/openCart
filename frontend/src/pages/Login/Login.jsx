import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  // Preset users
  const presetUsers = {
    octopus: 'octopus1234',
    Mugambi: 'Mugambipass'
  };

  // State for forms
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    newUsername: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [users, setUsers] = useState(presetUsers);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Blue/Green/Dark theme colors
  const theme = {
    background: '#0a192f', // Navy blue
    cardBg: '#172a45', // Dark blue
    text: '#ccd6f6', // Light blue
    primary: '#64ffda', // Teal
    secondary: '#1e90ff', // Dodger blue
    error: '#ff6b6b',
    success: '#4caf50',
    inputBg: '#233554', // Darker blue
    border: '#303f60'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.username || !loginData.password) {
      setError('Both fields required');
      return;
    }

    if (users[loginData.username] === loginData.password) {
      setSuccess('Access granted');
      setTimeout(() => navigate('/products'), 1000);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (registerData.newPassword !== registerData.confirmPassword) {
      setError('Passwords must match');
      return;
    }

    if (users[registerData.newUsername]) {
      setError('Username taken');
      return;
    }

    setUsers(prev => ({ ...prev, [registerData.newUsername]: registerData.newPassword }));
    
    // Auto-fill username and switch to login
    setLoginData({
      username: registerData.newUsername,
      password: ''
    });
    setIsLogin(true);
    setSuccess('Registration successful! Please login');
    setRegisterData({ newUsername: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="auth-container" style={{ backgroundColor: theme.background }}>
      <div className="auth-card" style={{ backgroundColor: theme.cardBg }}>
        <h2 style={{ color: theme.primary }}>
          {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
        </h2>
        
        {error && (
          <div className="alert error" style={{ backgroundColor: theme.error }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert success" style={{ backgroundColor: theme.success }}>
            {success}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                placeholder="Username"
                style={{
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="Password"
                style={{
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </div>
            <button 
              type="submit" 
              className="auth-button"
              style={{
                backgroundColor: theme.primary,
                color: '#0a192f',
                fontWeight: '600'
              }}
            >
              ENTER
            </button>
            <p className="toggle-text" style={{ color: theme.text }}>
              New user?{' '}
              <span 
                onClick={() => setIsLogin(false)}
                style={{ 
                  color: theme.secondary, 
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Register
              </span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <input
                type="text"
                name="newUsername"
                value={registerData.newUsername}
                onChange={(e) => setRegisterData({...registerData, newUsername: e.target.value})}
                placeholder="Choose username"
                style={{
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="newPassword"
                value={registerData.newPassword}
                onChange={(e) => setRegisterData({...registerData, newPassword: e.target.value})}
                placeholder="Create password"
                style={{
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                placeholder="Confirm password"
                style={{
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </div>
            <button 
              type="submit" 
              className="auth-button"
              style={{
                backgroundColor: theme.secondary,
                color: '#0a192f',
                fontWeight: '600'
              }}
            >
              REGISTER
            </button>
            <p className="toggle-text" style={{ color: theme.text }}>
              Have an account?{' '}
              <span 
                onClick={() => setIsLogin(true)}
                style={{ 
                  color: theme.primary, 
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Sign In
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;