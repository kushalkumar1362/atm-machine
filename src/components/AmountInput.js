import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

const AmountInput = ({ token }) => {
  const [amount, setAmount] = useState('');
  const [denomination, setDenomination] = useState('');
  const [error, setError] = useState('');
  const [withdrawn, setWithdrawn] = useState(false);

  const navigate = useNavigate();
  const handleWithdraw = async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/withdraw';

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, amount, denomination }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setWithdrawn(true);
      } else {
        setAmount('');
        setError(data.message);
        if (data.message === 'Session expired' || data.message === 'Insufficient Balance') {
          alert(data.message);
          navigate('/');
        }
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleWithdraw();
    }
    else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <div>
      {
        !withdrawn &&
        <div className="flex flex-col items-center justify-center" onKeyDown={handleKeyPress}>
          <h2 className="text-2xl mb-4">Enter Amount and Denomination</h2>
          <input
            type="number"
            className="border-2 border-gray-500 p-2 focus:outline-none focus:border-teal-500 rounded-lg mb-8"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={10}
            autoFocus
          />
          <select
            className="border-2 border-gray-500 px-[12px] py-2 focus:outline-none focus:border-teal-500 rounded-lg mb-4"
            value={denomination}
            onChange={(e) => setDenomination(e.target.value)}
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
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button onClick={handleWithdraw} className="bg-blue-500 text-white py-2 px-4 rounded">
            Withdraw
          </button>
        </div>
      }

      {
        withdrawn &&
        <div className="flex gap-20 items-center justify-center">
          <NavLink to={'/receipt'}>
            <div className="bg-blue-500 text-white py-2 px-4 rounded mt-4">
              Get Receipt
            </div>
          </NavLink>
        </div>
      }
    </div>
  );
};

export default AmountInput;
