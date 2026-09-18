import React from 'react';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm">Loading records...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-xl">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-5 py-3.5 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
          {data.map((item, rowIdx) => (
            <tr
              key={item.id ?? rowIdx}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick
                  ? 'hover:bg-slate-800/40 cursor-pointer'
                  : 'hover:bg-slate-900/30'
              }`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`px-5 py-4 ${col.className || ''}`}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : col.accessor
                    ? (item[col.accessor] as React.ReactNode)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
