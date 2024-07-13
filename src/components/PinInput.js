import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PinInput = ({ token }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNext = async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/check-pin';
    try {
      if (pin.length === 0) {
        setPin('');
        setError('Please Enter the Pin');
        return;
      }
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, pin }),
      });
      const data = await response.json();
      if (data.success) {
        console.log(data);
      } else {
        if (data.message === 'Session expired') {
          alert("Session Expired");
          navigate('/');
        }
        else if (data.message === 'Account is blocked for 24 Hours. Try again later.') {
          alert("Account is blocked. Try again later.");
          navigate('/');
        }
        else {
          setError(data.message);
        }
        setPin('');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPin(value);
      setError('');
    } else {
      setError('Only numbers are allowed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-4">Enter PIN</h2>
      <input
        type="password"
        className="border p-2"
        placeholder="PIN"
        value={pin}
        onChange={handleInputChange}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleNext} className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
        Withdraw
      </button>
    </div>
  );
};

export default PinInput;