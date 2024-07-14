import React from 'react';
import { useNavigate } from 'react-router-dom';

const CancelSession = ({ token, onSessionExpired }) => {
  const navigate = useNavigate();

  const handleCancel = async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/invalidate-session';
    
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Session cancelled.');
        onSessionExpired();
        navigate('/');
      } else {
        alert('Failed to cancel session.');
      }
    } catch (error) {
      console.error('Failed to communicate with server.', error);
      alert('Failed to cancel session.');
    }
  };

  return (
    <div>
      <button onClick={handleCancel} className="bg-blue-500 text-white py-2 px-4 rounded mt-4 hover:bg-red-500 transition-all duration-200">
        Cancel
      </button>
    </div>
  );
};

export default CancelSession;