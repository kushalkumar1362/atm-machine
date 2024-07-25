import React, { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AmountInput = React.memo(({ token }) => {
  const [amount, setAmount] = useState('');
  const [denomination, setDenomination] = useState('');
  const [error, setError] = useState('');
  const [withdrawn, setWithdrawn] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
  const endpoint = '/atm/withdraw';

  const validateInput = useCallback(() => {
    if (!amount) {
      return 'Please enter an amount';
    }
    return '';
  }, [amount]);

  const handleWithdraw = useCallback(async () => {
    const validationError = validateInput();
    if (validationError) {
      return setError(validationError);
    }

    try {
      setLoading(true); // Set loading state while processing
      const response = await axios.post(
        `${baseURL}${endpoint}`,
        { amount, denomination },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message); // Show success message
        setWithdrawn(true); // Set withdrawn state to true
      }
    } catch (error) {
      setError(error?.response.data.message); // Show error message from server
      if (error?.response.data.message === 'Session expired' || error?.response.data.message === 'Insufficient Balance') {
        alert(error?.response.data.message);
        navigate('/'); // Redirect to the start page
      }
    } finally {
      setAmount('');
      setDenomination('');
      setLoading(false); // Reset loading state
    }
  }, [amount, denomination, baseURL, endpoint, token, navigate, validateInput]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleWithdraw(); // Handle Enter key to submit form
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Prevent Tab key to control focus manually
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setError('');
  };

  return (
    <div>
      {!withdrawn ? (
        <div className="flex flex-col items-center justify-center" onKeyDown={handleKeyPress}>
          <h2 className="text-2xl mb-4 text-center">Enter Amount and Denomination</h2>
          <input
            type="number"
            className="border-2 border-gray-500 p-2 focus:outline-none focus:border-teal-500 rounded-lg mb-8"
            placeholder="Amount"
            value={amount}
            onChange={handleInputChange(setAmount)}
            min={10}
            autoFocus
            disabled={loading}
          />
          <select
            className="border-2 border-gray-500 px-[12px] py-2 focus:outline-none focus:border-teal-500 rounded-lg mb-4"
            value={denomination}
            onChange={handleInputChange(setDenomination)}
            disabled={loading}
          >
            <option value="" disabled>Select Denomination</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <button onClick={handleWithdraw}
            className="bg-blue-500 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      ) : (
        <div className="flex gap-20 items-center justify-center">
          <NavLink to={'/receipt'}>
            <div className="bg-blue-500 text-white py-2 px-5 rounded mt-4 border-[2px] border-blue-500 hover:bg-slate-50 hover:text-blue-500 transition-all duration-300 font-semibold">
              Get Receipt
            </div>
          </NavLink>
        </div>
      )}
    </div>
  );
});

export default AmountInput;
