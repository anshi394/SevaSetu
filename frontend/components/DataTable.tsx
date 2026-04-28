'use client';

import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import styles from './DataTable.module.css';

interface DataTableProps {
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
  data: any[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  onDelete?: (id: string) => void;
}

export default function DataTable({ columns, data, page, totalPages, onPageChange, loading, onDelete }: DataTableProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map(col => <th key={col.key}>{col.label}</th>)}
              {onDelete && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + (onDelete ? 1 : 0)} className={styles.empty}>Loading data...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length + (onDelete ? 1 : 0)} className={styles.empty}>No records found.</td></tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {onDelete && (
                    <td>
                      <button 
                        onClick={() => onDelete(row._id)} 
                        className={styles.deleteBtn}
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className={styles.pagination}>
        <button 
          onClick={() => onPageChange(page - 1)} 
          disabled={page === 1 || loading}
          className={styles.pageBtn}
        >
          <ChevronLeft size={18} />
        </button>
        <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
        <button 
          onClick={() => onPageChange(page + 1)} 
          disabled={page === totalPages || loading}
          className={styles.pageBtn}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
