export type Priority = 'P0' | 'P1' | 'P2'
export type UseCaseStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Complete'

export interface UseCase {
  id: string
  name: string
  problem: string | null
  solution: string | null
  priority: Priority
  status: UseCaseStatus
  hours_per_week: number
  hours_per_quarter: number
  build_hours: number
  roi: number | null
  confidence: string | null
  type: string | null
  display_order: number
  created_at: string
  updated_at: string
  tasks?: Task[]
}

export interface Task {
  id: string
  use_case_id: string
  name: string
  percent_complete: number
  is_complete: boolean
  category: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      use_cases: {
        Row: UseCase
        Insert: Omit<UseCase, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UseCase, 'id' | 'created_at' | 'updated_at'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
