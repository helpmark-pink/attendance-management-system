'use client'

import { AttendanceRecord } from '@/types/database'
import { formatTime, formatMinutesToHours } from '@/lib/utils'

interface AdminAttendanceListProps {
  records: any[]
}

export default function AdminAttendanceList({ records }: AdminAttendanceListProps) {
  if (records.length === 0) {
    return (
      <p className="text-center py-8 text-slate-500 dark:text-slate-400">
        本日の勤務記録はありません
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200 dark:border-slate-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              社員名
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              部門
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              出勤時刻
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              退勤時刻
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              勤務時間
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              状態
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {record.employee?.name || '不明'}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {record.employee?.department || '-'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  {formatTime(record.clock_in)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {record.clock_out ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    {formatTime(record.clock_out)}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {record.work_minutes ? formatMinutesToHours(record.work_minutes) : '-'}
              </td>
              <td className="px-4 py-3 text-sm">
                {record.clock_out ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    退勤済み
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold">
                    勤務中
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
