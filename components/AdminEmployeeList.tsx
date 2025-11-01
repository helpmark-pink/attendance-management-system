'use client'

import { Employee } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface AdminEmployeeListProps {
  employees: Employee[]
}

export default function AdminEmployeeList({ employees }: AdminEmployeeListProps) {
  if (employees.length === 0) {
    return (
      <p className="text-center py-8 text-slate-500 dark:text-slate-400">
        従業員が登録されていません
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200 dark:border-slate-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              社員ID
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              名前
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              メールアドレス
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              部門
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              権限
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              登録日
            </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100">
                {employee.employee_id}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {employee.name}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                {employee.email}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {employee.department}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {employee.role === 'admin' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                    管理者
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    一般
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                {formatDate(employee.created_at, 'yyyy/MM/dd')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
