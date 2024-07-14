import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const TokenCountdown = ({ token, sessionExpired, onSessionExpired }) => {
  const calculateTimeLeft = () => {
    try {
      const decodedToken = jwtDecode(token);
      const exp = decodedToken.exp * 1000;
      const now = Date.now();
      return Math.max(Math.floor((exp - now) / 1000), 0);
    } catch (error) {
      // console.error('Invalid token format', error);
      return 0;
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    if (timeLeft <= 0) {
      onSessionExpired();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          onSessionExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onSessionExpired]);

  return (
    <div className="text-center">
      {timeLeft > 0 && !sessionExpired
        ? <h1 className="text-2xl font-bold text-gray-800">
          Session expires in {timeLeft} {timeLeft === 1 ? 'second' : 'seconds'}
        </h1>
        : <h1 className="text-2xl font-bold text-gray-800">
          Session expired
        </h1>
      }
    </div>
  );
};

export default TokenCountdown;
