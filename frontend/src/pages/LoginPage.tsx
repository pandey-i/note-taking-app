import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import styles from './LoginPage.module.css';
import { GoogleLogin, googleLogout, CredentialResponse } from '@react-oauth/google';

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  // Handle login form submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      setMessage(res.data.message);
      setStep('otp');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  // Handle OTP form submit
  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp });
      setMessage(res.data.message);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      // Optionally redirect or update UI as logged in
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'OTP verification failed');
    }
  };

  // Handle Google login
  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setApiError('');
    setLoading(true);
    try {
      // Decode Google credential (JWT) to get user info
      const { credential } = credentialResponse;
      if (!credential) throw new Error('No Google credential');
      // Send credential to backend for verification and login/signup
      const res = await api.post('/api/auth/google', { credential });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Replace src with your logo asset if available */}
      <img src={require('../assets/logo.png')} alt="Logo" className={styles.logo} onError={e => (e.currentTarget.style.display = 'none')} />
      {message && <p>{message}</p>}
      {step === 'login' && (
        <form onSubmit={handleLogin} className={styles.form} autoComplete="off">
          <h2 style={{ margin: 0, textAlign: 'center', fontWeight: 700 }}>Login</h2>
          <input
            className={styles.input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <div className={styles.error}>{errors.email?.message}</div>
          <input
            className={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className={styles.error}>{errors.password?.message}</div>
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className={styles.error}>{apiError}</div>
          <div className={styles.divider}>or</div>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setApiError('Google login failed')}
            width="100%"
          />
          <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '1rem' }}>
            Don't have an account?{' '}
            <a href="/signup" style={{ color: '#FFD600', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Sign Up</a>
          </div>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={handleOtp} className={styles.loginForm}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Verify OTP</button>
        </form>
      )}
    </div>
  );
};

export default LoginPage; 