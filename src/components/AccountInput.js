import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AccountInput = ({ setToken }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
  const endpoint = '/atm/check-account';

  const handleNext = async () => {
    // Validate input
    if (!accountNumber) {
      return setError('Please Enter the ATM card Number');
    }
    if (accountNumber.length !== 16) {
      return setError('Please enter a 16-digit ATM card number');
    }

    try {
      setLoading(true); // Show loading state while processing
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountNumber }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message); // Show success message
        setToken(data.token); // Save token
        navigate('/pin'); // Navigate to next step
      } else {
        setToken(null);
        setError(data.message); // Show error message from server
      }
    } catch {
      setError('Failed to connect to the server'); // Handle connection errors
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Ensure input is numeric and no more than 16 digits
    if (/^\d{0,16}$/.test(value)) {
      setAccountNumber(value);
      setError('');
    } else {
      setError('ATM number should be numeric and no more than 16 digits.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNext(); // Handle Enter key to submit form
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Prevent Tab key to control focus manually
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
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleNext}
        className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Next'}
      </button>
    </div>
  );
};

export default AccountInput;
