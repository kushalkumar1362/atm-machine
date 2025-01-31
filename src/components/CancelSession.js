import axios from 'axios';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CancelSession = React.memo(({ token, onSessionExpired }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCancel = useCallback(async () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:2003';
    const endpoint = '/atm/invalidate-session';

    try {
      setLoading(true); // Set loading state while processing
      const response = await axios.post(
        `${baseURL}${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert('Session cancelled.');
        onSessionExpired();
        navigate('/');
      } 
    } catch (error) {
      // console.error('Failed to communicate with server.', error);
      alert('Failed to cancel session.');
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [token, onSessionExpired, navigate]);

  return (
    <div>
      <button
        onClick={handleCancel}
        className={`bg-blue-500 text-white py-2 px-4 rounded mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 transition-all duration-200'}`}
        disabled={loading}
      >
        {loading ? 'Cancelling...' : 'Cancel'}
      </button>
    </div>
  );
});

export default CancelSession;
