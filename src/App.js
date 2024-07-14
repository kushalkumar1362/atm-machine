import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AccountInput from './components/AccountInput';
import PinInput from './components/PinInput';
import AmountInput from './components/AmountInput';
import Receipt from './components/Receipt';
import TokenCountdown from './components/TokenCountdown';
import CancelSession from './components/CancelSession';
import { jwtDecode } from 'jwt-decode';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [token, setToken] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        jwtDecode(token);
      } catch (error) {
        console.error('Invalid token format', error);
        setSessionExpired(true);
        navigate('/');
      }
    }
  }, [token, navigate]);

  const handleSessionExpired = () => {
    setSessionExpired(true);
    navigate('/');
  };

  const handleLogin = (newToken) => {
    setToken(newToken);
    setSessionExpired(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100 relative">
      <h1 className='bg-gradient-01 bg-clip-text text-transparent text-4xl font-bold mb-10'>ATM Cash Withdrawal</h1>
      <Routes>
        <Route path="/" element={<AccountInput setToken={handleLogin} />} />
        <Route
          path="/pin"
          element={
            <ProtectedRoute token={token}>
              <PinInput token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/amount"
          element={
            <ProtectedRoute token={token}>
              <AmountInput token={token} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipt"
          element={
            <ProtectedRoute token={token}>
              <Receipt token={token} />
            </ProtectedRoute>
          }
        />
      </Routes>
      {location.pathname !== '/' && location.pathname !== '/receipt' && (
        <div className="absolute top-4 right-4">
          <TokenCountdown token={token} sessionExpired={sessionExpired} onSessionExpired={handleSessionExpired} />
        </div>
      )}
      {location.pathname !== '/' && (
        <div>
          <CancelSession token={token} onSessionExpired={handleSessionExpired} />
        </div>
      )}
    </div>
  );
};

export default App;