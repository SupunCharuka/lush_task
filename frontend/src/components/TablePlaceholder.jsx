import React from 'react'

export default function TablePlaceholder({columns, rows}){
  return (
    <div className="border rounded-md overflow-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {columns?.map((c) => (
              <th key={c} className="text-left px-3 py-2 border-b text-sm text-gray-600">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? rows.map((r, i) => (
            <tr key={i}>
              {Object.values(r).map((v, j) => (
                <td key={j} className="px-3 py-2 border-b text-sm text-gray-700">{String(v)}</td>
              ))}
            </tr>
          )) : (
            <tr><td className="px-3 py-4">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
