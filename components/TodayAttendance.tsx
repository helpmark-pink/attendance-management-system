import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { AttendanceRecord } from '@/types/database'
import { formatTime, formatMinutesToHours } from '@/lib/utils'

interface TodayAttendanceProps {
  todayRecord?: AttendanceRecord | null
}

export default function TodayAttendance({ todayRecord }: TodayAttendanceProps) {
  if (!todayRecord) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">本日の勤務状況</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            まだ出勤していません
          </p>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      label: '出勤時刻',
      value: formatTime(todayRecord.clock_in),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: '退勤時刻',
      value: todayRecord.clock_out ? formatTime(todayRecord.clock_out) : '勤務中',
      color: todayRecord.clock_out ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400',
      bgColor: todayRecord.clock_out ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: '休憩時間',
      value: `${todayRecord.break_minutes}分`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: '勤務時間',
      value: todayRecord.work_minutes ? formatMinutesToHours(todayRecord.work_minutes) : '計算中',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">本日の勤務状況</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
            >
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
