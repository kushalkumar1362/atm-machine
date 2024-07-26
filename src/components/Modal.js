import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { RxCross2 } from "react-icons/rx";

const Modal = ({ onClose }) => {
  const modalRef = useRef();
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
  const endpoint = '/atm/get-accounts';

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Duration of the closing animation
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      modalRef.current.classList.add('opacity-100', 'scale-100');
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}${endpoint}`);
        setAccounts(response.data.accounts);
      } catch (error) {
        setError('Failed to fetch account details');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [baseURL]);

  return (
    <div
      ref={modalRef}
      onClick={closeModal}
      className={`fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center opacity-0 transition-opacity duration-300 ${isClosing ? 'closing' : ''}`}
    >
      <div className={`flex flex-col mt-10 gap-5 text-white transition-transform transform scale-95 duration-300 ${isClosing ? 'scale-0' : 'scale-100'}`}>
        <button className='place-self-end' onClick={handleClose}>
          <RxCross2 size={30} />
        </button>
        <div className='bg-indigo-600 rounded-xl px-20 py-10 flex flex-col gap-5 items-center mx-4'>
          <h1 className='text-3xl font-extrabold'>Account Details</h1>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <table className="min-w-full text-left text-sm font-light">
              <thead className="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" className="px-6 py-4">#</th>
                  <th scope="col" className="px-6 py-4">Account Number</th>
                  <th scope="col" className="px-6 py-4">Pin</th>
                  <th scope="col" className="px-6 py-4">Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => (
                  <tr key={account.accountNumber} className="border-b dark:border-neutral-500">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">{index + 1}</td>
                    <td className="whitespace-nowrap px-6 py-4">{account.accountNumber}</td>
                    <td className="whitespace-nowrap px-6 py-4">{account.pin}</td>
                    <td className="whitespace-nowrap px-6 py-4">{account.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
