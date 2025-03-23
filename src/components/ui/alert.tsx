import React from 'react';

interface AlertProps {
  variant: 'destructive' | 'success' | 'info';
  children: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ variant, children }) => {
  let alertStyle = '';
  switch (variant) {
    case 'destructive':
      alertStyle = 'bg-red-500 text-white';
      break;
    case 'success':
      alertStyle = 'bg-green-500 text-white';
      break;
    case 'info':
      alertStyle = 'bg-blue-500 text-white';
      break;
  }

  return (
    <div className={`p-4 rounded ${alertStyle}`}>
      <p>{children}</p>
    </div>
  );
};

export default Alert;
