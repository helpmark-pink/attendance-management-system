import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr: string = 'yyyy年MM月dd日 HH:mm'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: ja })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: ja })
}

export function calculateWorkMinutes(clockIn: string, clockOut: string | null, breakMinutes: number = 0): number | null {
  if (!clockOut) return null
  const start = parseISO(clockIn)
  const end = parseISO(clockOut)
  const totalMinutes = differenceInMinutes(end, start)
  return Math.max(0, totalMinutes - breakMinutes)
}

export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}時間${mins}分`
}
