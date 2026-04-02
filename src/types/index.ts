export interface Profile {
  id: string
  full_name: string
  email: string
  created_at: string
}

export interface Wedding {
  id: string
  owner_id: string
  title: string
  bride_name: string | null
  groom_name: string | null
  wedding_date: string | null
  created_at: string
}

export type EventType = 'mehndi' | 'nikkah' | 'barat' | 'walima' | 'other'

export interface WeddingEvent {
  id: string
  wedding_id: string
  type: EventType
  name: string
  date: string | null
  time: string | null
  venue: string | null
  notes: string | null
  created_at: string
}

export type GuestSide = 'bride' | 'groom' | 'mutual'
export type RSVPStatus = 'pending' | 'confirmed' | 'declined'

export interface Guest {
  id: string
  wedding_id: string
  name: string
  phone: string | null
  email: string | null
  side: GuestSide
  rsvp_status: RSVPStatus
  notes: string | null
  rsvp_token: string | null
  created_at: string
}

export interface GuestEvent {
  id: string
  guest_id: string
  event_id: string
  rsvp_status: RSVPStatus
  table_number: number | null
}

export type VendorType =
  | 'venue' | 'catering' | 'decoration' | 'photography'
  | 'clothing' | 'jewelry' | 'transport' | 'entertainment' | 'other'

export type VendorStatus = 'pending' | 'booked' | 'cancelled'

export interface Vendor {
  id: string
  wedding_id: string
  name: string
  type: VendorType
  phone: string | null
  email: string | null
  service_description: string | null
  total_cost: number | null
  amount_paid: number
  status: VendorStatus
  notes: string | null
  created_at: string
}

export type ExpenseCategory =
  | 'venue' | 'catering' | 'decoration' | 'photography'
  | 'clothing' | 'jewelry' | 'transport' | 'entertainment' | 'other'

export interface Expense {
  id: string
  wedding_id: string
  category: ExpenseCategory
  description: string
  vendor_name: string | null
  amount: number
  paid: boolean
  expense_date: string | null
  created_at: string
}

export interface Budget {
  id: string
  wedding_id: string
  total_budget: number
  created_at: string
}

export type TaskCategory =
  | 'booking' | 'paperwork' | 'shopping' | 'clothing'
  | 'catering' | 'venue' | 'photography' | 'decor' | 'other'

export interface Task {
  id: string
  wedding_id: string
  title: string
  description: string | null
  category: TaskCategory
  due_date: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
}

export interface Note {
  id: string
  wedding_id: string
  event_id: string | null
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

export type CollaboratorRole = 'co-planner' | 'vendor' | 'view-only'
export type CollaboratorStatus = 'pending' | 'accepted'

export interface Collaborator {
  id: string
  wedding_id: string
  invited_email: string
  role: CollaboratorRole
  status: CollaboratorStatus
  user_id: string | null
  invited_at: string
}
