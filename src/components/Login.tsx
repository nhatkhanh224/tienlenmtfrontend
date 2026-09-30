import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import { authenticateSocket } from '../socket';
import { getBackendUrl } from '../config';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const API_URL = `${getBackendUrl()}/api/auth`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setErrorMessage('Mật khẩu xác nhận không trùng khớp!');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Đăng ký không thành công!');
        } else {
          setSuccessMessage('Đăng ký thành công! Nhận 10.000 xu thưởng. Vui lòng đăng nhập.');
          setIsRegister(false);
          setPassword('');
          setConfirmPassword('');
        }
      } catch (err: any) {
        setErrorMessage('Không thể kết nối đến máy chủ Backend!');
      } finally {
        setLoading(false);
      }
    } else {
      // Đăng nhập
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Tài khoản chưa được đăng ký hoặc sai mật khẩu!');
        } else {
          // Lưu token & thông tin đăng nhập
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          sessionStorage.setItem('userId', data.userId);

          // Authenticate Socket.io connection
          authenticateSocket();

          const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectUrl);
          } else {
            navigate('/lobby');
          }
        }
      } catch (err: any) {
        setErrorMessage('Không thể kết nối đến máy chủ Backend!');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', position: 'relative' }}>
      
      <div className="glass-panel animate-pop-in" style={{ width: '100%', maxWidth: '420px', textAlign: 'center', padding: '35px 30px', borderRadius: '20px', background: 'rgba(0,0,0,0.85)', border: '2px solid var(--secondary-color)' }}>
        
        {/* Logo / Mascot */}
        <div className="animate-bounce" style={{ fontSize: '4.5rem', marginBottom: '10px' }}>
          🃏
        </div>

        <h1 style={{ color: 'var(--secondary-color)', marginBottom: '5px', fontSize: '2.4rem', letterSpacing: '1px' }}>
          TIẾN LÊN MIỀN TRUNG
        </h1>
        <p style={{ marginBottom: '25px', opacity: 0.85, fontSize: '1rem', color: '#ccc' }}>
          Cổng Game Bài Realtime Đỉnh Cao
        </p>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', marginBottom: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '4px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: !isRegister ? 'var(--primary-color)' : 'transparent',
              color: 'white', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.3s'
            }}
          >
            🔑 Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMessage(''); setSuccessMessage(''); }}
            style={{
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: isRegister ? 'var(--primary-color)' : 'transparent',
              color: 'white', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.3s'
            }}
          >
            🎁 Đăng Ký (10k Xu)
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div style={{ background: 'rgba(231, 76, 60, 0.25)', border: '1px solid #e74c3c', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.95rem' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: 'rgba(46, 213, 115, 0.25)', border: '1px solid #2ed573', color: '#2ed573', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.95rem' }}>
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            className="input-field" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
            style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem' }}
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            className="input-field" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem' }}
          />

          {isRegister && (
            <input 
              type="password" 
              placeholder="Xác nhận mật khẩu" 
              className="input-field" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '1rem' }}
            />
          )}
          
          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ width: '100%', marginTop: '10px', padding: '12px', fontSize: '1.1rem', background: isRegister ? 'linear-gradient(45deg, #10b981, #059669)' : 'linear-gradient(45deg, #3b82f6, #1d4ed8)' }}
          >
            {loading ? 'Đang xử lý...' : isRegister ? '🎁 TẠO TÀI KHOẢN (TẶNG 10K XU)' : '▶ ĐĂNG NHẬP NGAY'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#ccc' }}>
          {isRegister ? (
            <span>Đã có tài khoản? <strong style={{ color: 'var(--secondary-color)', cursor: 'pointer' }} onClick={() => setIsRegister(false)}>Đăng nhập tại đây</strong></span>
          ) : (
            <span>Chưa có tài khoản? <strong style={{ color: 'var(--secondary-color)', cursor: 'pointer' }} onClick={() => setIsRegister(true)}>Đăng ký tặng 10.000 xu</strong></span>
          )}
        </div>
      </div>

      {/* Trang trí xung quanh */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '4rem', opacity: 0.2, transform: 'rotate(-20deg)', pointerEvents: 'none' }}>♠️</div>
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', fontSize: '5rem', opacity: 0.2, transform: 'rotate(15deg)', pointerEvents: 'none' }}>♥️</div>
      <div style={{ position: 'absolute', top: '20%', right: '10%', fontSize: '3rem', opacity: 0.2, transform: 'rotate(45deg)', pointerEvents: 'none' }}>♦️</div>
    </div>
  );
};

export default Login;
