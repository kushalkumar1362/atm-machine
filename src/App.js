import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AccountInput from './components/AccountInput';
import PinInput from './components/PinInput';
import AmountInput from './components/AmountInput';
import Receipt from './components/Receipt';
import TokenCountdown from './components/TokenCountdown';
import CancelSession from './components/CancelSession';

const App = () => {
  const [token, setToken] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();

  const initialTime = 120;

  const handleSessionExpired = () => {
    setSessionExpired(!sessionExpired);
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
        <Route path="/pin" element={<PinInput token={token} />} />
        <Route path="/amount" element={<AmountInput token={token} />} />
        <Route path="/receipt" element={<Receipt token={token} />} />
      </Routes>
      {location.pathname !== '/' && location.pathname !== '/receipt' && (
        <div className="absolute top-4 right-4">
          <TokenCountdown initialTime={initialTime} token={token} sessionExpired={sessionExpired} />
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
