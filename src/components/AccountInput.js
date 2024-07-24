import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AccountInput = React.memo(({ setToken }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
  const endpoint = '/atm/check-account';

  const validateInput = useCallback(() => {
    if (!accountNumber) {
      return 'Please Enter the ATM card Number';
    }
    if (accountNumber.length !== 16) {
      return 'Please enter a 16-digit ATM card number';
    }
    return '';
  }, [accountNumber]);

  const handleNext = useCallback(async () => {
    const validationError = validateInput();
    if (validationError) {
      return setError(validationError);
    }

    try {
      setLoading(true); // Show loading state while processing
      const response = await axios.post(`${baseURL}${endpoint}`, { accountNumber });

      if (response.data.success) {
        toast.success(response.data.message);
        setToken(response.data.token);
        navigate('/pin');
      } else {
        setToken(null);
        setError(response.data.message);
      }
    } catch (error) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  }, [accountNumber, baseURL, endpoint, navigate, setToken, validateInput]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,16}$/.test(value)) {
      setAccountNumber(value);
      setError('');
    } else {
      setError('ATM number should be numeric and no more than 16 digits.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    } else if (e.key === 'Tab') {
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
        disabled={loading}
      />
      {error && <p className="text-red-500 text-center">{error}</p>}
      <button
        onClick={handleNext}
        className="bg-blue-500 text-white py-2 px-5 rounded mt-4 border-[2px] border-blue-500 hover:bg-slate-50 hover:text-blue-500 transition-all duration-300 font-semibold"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Next'}
      </button>
    </div>
  );
});

export default AccountInput;
