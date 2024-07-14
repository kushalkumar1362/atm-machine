import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const TokenCountdown = ({ token }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const decodedToken = jwtDecode(token);
    const exp = decodedToken.exp * 1000; 
    const now = Date.now();
    return Math.max(Math.floor((exp - now) / 1000), 0);
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      alert('Session expired.');
      window.location.href = '/';
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime < 1) {
          clearInterval(intervalId);
          alert('Session expired.');
          window.location.href = '/'; 
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  return (
    <div className="text-center">
      {timeLeft > 1
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
