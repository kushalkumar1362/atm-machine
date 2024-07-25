import React, { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const TokenCountdown = ({ token, onSessionExpired }) => {
  const calculateTimeLeft = useCallback(() => {
    if (!token) {
      return 0;
    }
    try {
      const decodedToken = jwtDecode(token);
      const exp = decodedToken.exp * 1000; // Expiry time in milliseconds
      const now = Date.now(); // Current time in milliseconds
      return Math.max(Math.floor((exp - now) / 1000), 0); // Calculate seconds left until expiry
    } catch (error) {
      console.error('Invalid token format', error);
      return 0;
    }
  }, [token]);

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());
  const [alertTriggered, setAlertTriggered] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateCountdown();
      }
    };

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) { // Expiry logic
          clearInterval(intervalId);
          if (!alertTriggered) {
            setAlertTriggered(true);
            alert("Session Expired");
            setTimeout(() => onSessionExpired(), 0);
            return 0;
          }
        }
        return prevTime - 1;
      });
    }, 1000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [calculateTimeLeft, onSessionExpired, alertTriggered]);

  return (
    <div className="text-center">
      {timeLeft > 0 ? (
        <h1 className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-800'}`}>
          Session expires in {timeLeft} {timeLeft === 1 ? 'second' : 'seconds'}
        </h1>
      ) : (
        <h1 className="text-2xl font-bold text-gray-800">
          Session expired
        </h1>
      )}
    </div>
  );
};

export default TokenCountdown;
