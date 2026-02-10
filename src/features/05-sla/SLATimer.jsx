import React, { useState, useEffect } from 'react';

const SLATimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft("No Deadline");
      return;
    }

    const timer = setInterval(() => {
      if (!deadline) {
        clearInterval(timer);
        return;
      }
      const deadlineTime = new Date(deadline).getTime();
      if (isNaN(deadlineTime)) {
        setTimeLeft("Invalid Deadline");
        clearInterval(timer);
        return;
      }

      const now = new Date().getTime();
      const distance = deadlineTime - now;

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (distance < 0) {
        setTimeLeft("SLA BREACHED");
        setIsUrgent(true);
        clearInterval(timer);
      } else {
        setTimeLeft(`${hours}h ${minutes}m left`);
        if (hours < 2) setIsUrgent(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <span className={`font-mono font-bold ${isUrgent ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
      {timeLeft}
    </span>
  );
};

export default SLATimer;