import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-8" }: LogoProps) {
  return (
    <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg" className={className}>
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M 5,5 L 15,16 L 25,5 M 15,16 L 15,26" />
        <path d="M 30,26 L 41,5 L 52,26" />
        <path d="M 57,26 L 57,5 L 67,20 L 77,5 L 77,26" />
      </g>
      <rect x="84" y="11" width="18" height="15" rx="4" fill="currentColor" />
      <text x="93" y="22.5" fill="white" fontFamily="sans-serif" fontWeight="bold" fontSize="11" textAnchor="middle">tv</text>
    </svg>
  );
}
