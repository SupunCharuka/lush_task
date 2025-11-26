import React from 'react'

export default function StyledSelect({ label, options = [], value, onChange, placeholder = 'All Platforms', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {label && <span className="absolute -top-2 left-3 bg-white/90 text-xs px-1 text-gray-600 rounded">{label}</span>}
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none pr-8 pl-3 py-2 rounded border bg-white/60 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {value && (
        <button
          type="button"
          onClick={() => onChange({ target: { value: '' } })}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label="Clear selection"
        >
          ×
        </button>
      )}
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▾</div>
    </div>
  )
}
