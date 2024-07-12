import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import AccountInput from './components/AccountInput';
import PinInput from './components/PinInput';
import AmountInput from './components/AmountInput';

const App = () => {
  const [token, setToken] = useState('');

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100">
      <h1 className='bg-gradient-01 bg-clip-text text-transparent text-4xl font-bold mb-10'>ATM Cash Withdrawal</h1>
      <Routes>
        <Route path="/" element={<AccountInput setToken={setToken} />} />
        <Route path="/pin" element={<PinInput token={token} />} />
        <Route path="/amount" element={<AmountInput token={token} />} />
      </Routes>
    </div>
  );
};

export default App;