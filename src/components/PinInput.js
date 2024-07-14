import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

const PinInput = ({ token }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
  const endpoint = '/atm/check-pin';

  const handleNext = async () => {
    if (pin.length === 0) {
      setPin('');
      setError('Please Enter the Pin');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, pin }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        navigate('/amount', { replace: true });
      } else {
        if (data.message === 'Session expired' || data.message === "Invalid Pin") {
          alert(data.message);
          navigate('/');
        }
        setError(data.message);
      }
      setPin('');
    } catch (error) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigate(window.location.pathname, { replace: true });
  }, [navigate]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
      setError('');
    } else {
      setError('PIN should be numeric and no more than 4 digits.');
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
      <h2 className="text-2xl mb-4">Enter PIN</h2>
      <input
        type="password"
        className="border-2 border-gray-500 p-2 focus:outline-none focus:border-teal-500 rounded-lg"
        placeholder="PIN"
        value={pin}
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

export default PinInput;