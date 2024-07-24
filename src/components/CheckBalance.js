import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckBalance = React.memo(({ token }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
        const endpoint = '/atm/check-balance';
        const response = await axios.post(`${baseURL}${endpoint}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          setBalance(response.data.balance);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setError('Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <p className='text-[20px]'>Your current balance is: ₹{balance}</p>
    </div>
  );
});

export default CheckBalance;
