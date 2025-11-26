import React from 'react'

export default function StyledInput({ label, icon, type = 'text', value, onChange, placeholder, className = '', ...rest }) {
  return (
    <label className={`relative block ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || ''}
        className={`w-full pl-10 pr-3 py-2 rounded border bg-white/60 backdrop-blur-sm border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow`}
        {...rest}
      />
      {label && (
        <span className="absolute -top-2 left-3 bg-white/90 text-xs px-1 text-gray-600 rounded">
          {label}
        </span>
      )}
    </label>
  )
}
