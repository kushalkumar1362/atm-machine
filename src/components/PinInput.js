import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PinInput = React.memo(({ token }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
  const endpoint = '/atm/check-pin';

  const validateInput = useCallback(() => {
    if (pin.length === 0) {
      return 'Please Enter the Pin';
    }
    return '';
  }, [pin]);

  const handleNext = useCallback(async () => {
    const validationError = validateInput();
    if (validationError) {
      return setError(validationError);
    }

    try {
      setLoading(true); // Show loading state while processing
      const response = await axios.post(
        `${baseURL}${endpoint}`,
        { pin },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message); 
        navigate('/balance-or-withdrawal'); 
      } else {
        if (response.data.message === 'Session expired' || response.data.message === 'Invalid Pin') {
          alert(response.data.message); // Alert user if session expired or pin is invalid
          navigate('/'); 
        }
        setError(response.data.message);
      }
      setPin(''); // Clear PIN input after submission
    } catch (error) {
      setError('Failed to connect to the server'); // Handle connection errors
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [pin, baseURL, endpoint, token, navigate, validateInput]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Validate input format: numeric and no more than 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value);
      setError('');
    } else {
      setError('PIN should be numeric and no more than 4 digits.');
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

export default PinInput;
