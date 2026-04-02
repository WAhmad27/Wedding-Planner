import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  mehndi: 'Mehndi',
  nikkah: 'Nikkah',
  barat: 'Barat',
  walima: 'Walima',
  other: 'Other',
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  mehndi: 'bg-yellow-100 text-yellow-800',
  nikkah: 'bg-emerald-100 text-emerald-800',
  barat: 'bg-rose-100 text-rose-800',
  walima: 'bg-purple-100 text-purple-800',
  other: 'bg-stone-100 text-stone-700',
}

export const CATEGORY_LABELS: Record<string, string> = {
  venue: 'Venue',
  catering: 'Catering',
  decoration: 'Decoration',
  photography: 'Photography',
  clothing: 'Clothing',
  jewelry: 'Jewelry',
  transport: 'Transport',
  entertainment: 'Entertainment',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<string, string> = {
  venue: 'bg-blue-100 text-blue-800',
  catering: 'bg-orange-100 text-orange-800',
  decoration: 'bg-pink-100 text-pink-800',
  photography: 'bg-violet-100 text-violet-800',
  clothing: 'bg-rose-100 text-rose-800',
  jewelry: 'bg-yellow-100 text-yellow-800',
  transport: 'bg-cyan-100 text-cyan-800',
  entertainment: 'bg-emerald-100 text-emerald-800',
  other: 'bg-stone-100 text-stone-700',
}

export const VENDOR_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  booked: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-stone-100 text-stone-600',
}

export const TASK_CATEGORY_LABELS: Record<string, string> = {
  booking: 'Booking',
  paperwork: 'Paperwork',
  shopping: 'Shopping',
  clothing: 'Clothing',
  catering: 'Catering',
  venue: 'Venue',
  photography: 'Photography',
  decor: 'Decor',
  other: 'Other',
}

export const TASK_CATEGORY_COLORS: Record<string, string> = {
  booking: 'bg-blue-100 text-blue-800',
  paperwork: 'bg-orange-100 text-orange-800',
  shopping: 'bg-pink-100 text-pink-800',
  clothing: 'bg-rose-100 text-rose-800',
  catering: 'bg-amber-100 text-amber-800',
  venue: 'bg-violet-100 text-violet-800',
  photography: 'bg-cyan-100 text-cyan-800',
  decor: 'bg-emerald-100 text-emerald-800',
  other: 'bg-stone-100 text-stone-700',
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
