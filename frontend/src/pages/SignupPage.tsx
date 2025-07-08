import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import styles from './SignupPage.module.css';

interface SignupFormInputs {
  name: string;
  email: string;
  password: string;
}

interface OtpFormInputs {
  email: string;
  otp: string;
}

const SignupPage: React.FC = () => {
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [emailForOtp, setEmailForOtp] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Signup form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>();

  // OTP form
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp },
  } = useForm<OtpFormInputs>();

  // Handle signup submit
  const onSubmit = async (data: SignupFormInputs) => {
    setApiError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', data);
      setEmailForOtp(data.email);
      setStep('otp');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP submit
  const onSubmitOtp = async (data: OtpFormInputs) => {
    setApiError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', data);
      // Save token (localStorage for demo; use httpOnly cookie in production)
      localStorage.setItem('token', res.data.token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Replace src with your logo asset if available */}
      <img src={require('../assets/logo.png')} alt="Logo" className={styles.logo} onError={e => (e.currentTarget.style.display = 'none')} />
      <form
        className={styles.form}
        onSubmit={step === 'signup' ? handleSubmit(onSubmit) : handleSubmitOtp(onSubmitOtp)}
        autoComplete="off"
      >
        {step === 'signup' && (
          <>
            <h2 style={{ margin: 0, textAlign: 'center', fontWeight: 700 }}>Sign Up</h2>
            <input
              className={styles.input}
              placeholder="Name"
              {...register('name', { required: 'Name is required' })}
              autoFocus
            />
            <div className={styles.error}>{errors.name?.message}</div>
            <input
              className={styles.input}
              placeholder="Email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'Invalid email address',
                },
              })}
            />
            <div className={styles.error}>{errors.email?.message}</div>
            <input
              className={styles.input}
              placeholder="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <div className={styles.error}>{errors.password?.message}</div>
            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </>
        )}
        {step === 'otp' && (
          <>
            <h2 style={{ margin: 0, textAlign: 'center', fontWeight: 700 }}>Verify OTP</h2>
            <input
              className={styles.input + ' ' + styles.otp}
              placeholder="Enter OTP"
              maxLength={6}
              {...registerOtp('otp', {
                required: 'OTP is required',
                minLength: { value: 6, message: 'OTP must be 6 digits' },
                maxLength: { value: 6, message: 'OTP must be 6 digits' },
              })}
              autoFocus
            />
            <div className={styles.error}>{errorsOtp.otp?.message}</div>
            <input type="hidden" value={emailForOtp} {...registerOtp('email')} />
            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}
        <div className={styles.error}>{apiError}</div>
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '1rem' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#FFD600', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Sign In</a>
        </div>
      </form>
    </div>
  );
};

export default SignupPage; 