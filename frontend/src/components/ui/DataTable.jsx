import React from 'react';

const DataTable = ({ columns, data, keyField = 'id', onRowClick, emptyMessage = 'No data available' }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-700/50 text-sm text-gray-500 dark:text-gray-400">
            {columns.map((col, index) => (
              <th key={index} className="pb-3 px-4 font-medium whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row[keyField] || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-gray-100 dark:border-slate-800/50 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50' : ''}`}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="py-4 px-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
