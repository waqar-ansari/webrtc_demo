import React from 'react';

export default function DialPad({ onDigitClick }) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="dialpad">
      {digits.map(digit => (
        <button
          key={digit}
          onClick={() => onDigitClick(digit)}
          className="dialpad-button"
        >
          {digit}
        </button>
      ))}
    </div>
  );
}
