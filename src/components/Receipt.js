import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Receipt = ({ token }) => {
  const [receiptData, setReceiptData] = useState({
    accountNumber: '',
    newBalance: '',
    transactionId: '',
    amount: '',
    notesToDispense: {},
    transactionDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to mask account number for privacy
  const maskAccountNumber = (accountNumber) => {
    const last4Digits = accountNumber.slice(-4);
    return '************' + last4Digits;
  };

  // Function to fetch receipt data from the server
  const handleGetReceipt = useCallback(async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/receipt';
    try {
      setLoading(true); // Set loading state while fetching data
      const response = await axios.post(
        `${baseURL}${endpoint}`,
        { },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const { receipt } = response.data;
        // Update receipt data with masked account number and other details
        setReceiptData({
          accountNumber: maskAccountNumber(receipt.accountNumber),
          newBalance: receipt.newBalance,
          transactionId: receipt.transactionId,
          amount: receipt.withdrawalAmount,
          notesToDispense: receipt.notes,
          transactionDate: receipt.transactionDate
        });
      } else {
        setError(response.data.message); // Show error message from the server
        if (response.data.message === 'Session expired') {
          alert('Session Expired'); // Alert user if session expired
          navigate('/'); // Redirect to the start page
        }
      }
    } catch (error) {
      setError('Failed to connect to the server'); // Handle connection errors
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [token, navigate]);

  // Fetch receipt data on component mount
  useEffect(() => {
    handleGetReceipt();
  }, [handleGetReceipt]);

  // Render loading message while fetching data
  if (loading) {
    return <p className='text-center'>Loading receipt...</p>;
  }

  // Destructure receiptData for rendering
  const { accountNumber, newBalance, transactionId, amount, notesToDispense, transactionDate } = receiptData;

  return (
    <div className='flex flex-col items-center justify-center'>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-2 gap-2" >
        <div className="mb-1 font-bold">Card Number:</div>
        <div className="mb-1">{accountNumber}</div>

        <div className="mb-1 font-bold">Transaction ID:</div>
        <div className="mb-1">{transactionId}</div>

        <div className="mb-1 font-bold">Amount:</div>
        <div className="mb-1">{amount}</div>

        <div className="mb-1 font-bold">Date:</div>
        <div className="mb-1">{new Date(transactionDate).toLocaleString()}</div>

        <div className="mb-1 font-bold">New Balance:</div>
        <div className="mb-1">{newBalance}</div>

        <div className="mb-1 font-bold">Notes Dispensed:</div>
        <div className="mb-1">
          <ul className="list-none">
            {Object.entries(notesToDispense).map(([note, count]) => (
              <li key={note}>{note}: {count}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
