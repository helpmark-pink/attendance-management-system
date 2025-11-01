export interface Employee {
  id: string
  email: string
  name: string
  employee_id: string
  department: string
  role: 'employee' | 'admin'
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  employee_id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number
  work_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AttendanceWithEmployee extends AttendanceRecord {
  employee: Employee
}
