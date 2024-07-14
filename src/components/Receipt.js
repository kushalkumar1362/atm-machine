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

  const maskAccountNumber = (accountNumber) => {
    const last4Digits = accountNumber.slice(-4);
    return '************' + last4Digits;
  };

  const handleGetReceipt = useCallback(async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/receipt';
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        const { receipt } = data;
        setReceiptData({
          accountNumber: maskAccountNumber(receipt.accountNumber),
          newBalance: receipt.newBalance,
          transactionId: receipt.transactionId,
          amount: receipt.withdrawalAmount,
          notesToDispense: receipt.notes,
          transactionDate: receipt.transactionDate
        });
      } else {
        setError(data.message);
        if (data.message === 'Session expired') {
          alert('Session Expired');
          navigate('/');
        }
      }
    } catch (error) {
      setError('Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    handleGetReceipt();
  }, [handleGetReceipt]);

  if (loading) {
    return <p className='text-center'>Loading receipt...</p>;
  }

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
