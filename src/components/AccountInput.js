import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountInput = ({ setToken }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/check-account';
    try {
      if (accountNumber.length !== 8) {
        setAccountNumber('');
        setError('Please Enter the Account Number of Length 8');
        return;
      }
      const response = await fetch(`${baseURL}${endpoint}`, {
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
        setAccountNumber('');
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAccountNumber(value);
      setError('');
    } else {
      setError('Only numbers are allowed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-4">Enter Account Number</h2>
      <input
        type="text"
        className="border p-2"
        placeholder="Account Number"
        value={accountNumber}
        onChange={handleInputChange}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleNext} className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
        Next
      </button>
    </div>
  );
};

export default AccountInput;
