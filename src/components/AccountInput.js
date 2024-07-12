import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountInput = ({ setToken }) => {
  const [accountNumber, setAccountNumberState] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = async () => {
    try {
      if (accountNumber.length < 8) {
        setError('Please Enter the Account Number of Length 8');
        return;
      }
      const response = await fetch('http://localhost:2003/atm/check-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountNumber }),
      });

      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        navigate('/pin');
      } else {
        setToken(null);
        setError('Account not found');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Enter Account Number</h1>
      <input
        type="text"
        className="border p-2"
        placeholder="Account Number"
        value={accountNumber}
        onChange={(e) => setAccountNumberState(e.target.value)}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleNext} className="bg-blue-500 hover:bg-blue-600 font-semibold text-[20px] text-white py-2 px-10 rounded mt-6">
        Next
      </button>
    </div>
  );
};

export default AccountInput;