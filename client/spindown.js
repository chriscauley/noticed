import React from 'react'

export default function Spindown({ size, duration, className = '' }) {
  return (
    <svg className={`ur-spindown ${className}`} width={size} height={size}>
      <circle
        stroke="white"
        strokeWidth="10%"
        fill="transparent"
        r="45%"
        cx="50%"
        cy="50%"
        style={{ animationDuration: duration + 's' }}
      />
    </svg>
  )
}
