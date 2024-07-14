import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

const AccountInput = ({ setToken }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/check-account';
    if (accountNumber.length === 0) {
      setAccountNumber('');
      setError('Please Enter the ATM card Number');
      return;
    }
    else if (accountNumber.length !== 16) {
      setAccountNumber('');
      setError('Please enter a 16-digit ATM card number');
      return;
    }
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountNumber }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
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
    if (/^\d*$/.test(value) && value.length <= 16) {
      setAccountNumber(value);
      setError('');
    } else {
      setError('ATM number should be numeric and no more than 16 digits.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
    else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center" onKeyDown={handleKeyPress}>
      <h2 className="text-2xl mb-4">Enter Card Number</h2>
      <input
        type="text"
        className="border-2 border-gray-500 p-2 focus:outline-none focus:border-teal-500 rounded-lg"
        placeholder="Account Number"
        value={accountNumber}
        onChange={handleInputChange}
        autoFocus
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleNext}
        className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
        Next
      </button>
    </div>
  );
};

export default AccountInput;
