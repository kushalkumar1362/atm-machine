import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Assuming the correct import would be 'jwt_decode' instead of 'jwt-decode'

const TokenCountdown = ({ token, sessionExpired, onSessionExpired }) => {
  // Function to calculate time left until token expiry
  const calculateTimeLeft = () => {
    try {
      const decodedToken = jwtDecode(token);
      const exp = decodedToken.exp * 1000; // Expiry time in milliseconds
      const now = Date.now(); // Current time in milliseconds
      return Math.max(Math.floor((exp - now) / 1000), 0); // Calculate seconds left until expiry
    } catch (error) {
      // Handle invalid token format gracefully
      // console.error('Invalid token format', error);
      return 0; // Return 0 seconds if there's an error
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft); // State to hold time left in seconds

  // Effect to update countdown every second and handle session expiration
  useEffect(() => {
    if (timeLeft <= 0) {
      // If timeLeft is zero or less, session is expired
      onSessionExpired(); // Call callback function to handle session expiration
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId); // Clear interval when countdown reaches zero
          onSessionExpired(); // Call callback function to handle session expiration
          return 0;
        }
        return prevTime - 1; // Decrease time left by one second
      });
    }, 1000); // Update countdown every second

    return () => clearInterval(intervalId); // Clean up interval on component unmount or when timeLeft reaches zero
  }, [timeLeft, onSessionExpired]); // Depend on timeLeft and onSessionExpired function

  return (
    <div className="text-center">
      {/* Conditional rendering based on session expiration */}
      {timeLeft > 0 && !sessionExpired ? (
        <h1 className="text-2xl font-bold text-gray-800">
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
