import dayjs from 'dayjs'
import { CouponStatus, AppointmentStatus, VerifyStatus, CouponType } from '@/types'

export const formatPhone = (phone: string): string => {
  if (!phone) return ''
  if (phone.includes('****')) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

export const formatDate = (date: string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export const getCouponStatusColor = (status: CouponStatus): string => {
  const colorMap: Record<CouponStatus, string> = {
    available: '#00B42A',
    used: '#86909C',
    expired: '#F53F3F',
    frozen: '#FF7D00'
  }
  return colorMap[status]
}

export const getCouponStatusBgColor = (status: CouponStatus): string => {
  const colorMap: Record<CouponStatus, string> = {
    available: 'rgba(0, 180, 42, 0.1)',
    used: 'rgba(134, 144, 156, 0.1)',
    expired: 'rgba(245, 63, 63, 0.1)',
    frozen: 'rgba(255, 125, 0, 0.1)'
  }
  return colorMap[status]
}

export const getCouponTypeColor = (type: CouponType): string => {
  const colorMap: Record<CouponType, string> = {
    experience: '#1677FF',
    course: '#36CFC9',
    gift: '#FF7D00'
  }
  return colorMap[type]
}

export const getAppointmentStatusColor = (status: AppointmentStatus): string => {
  const colorMap: Record<AppointmentStatus, string> = {
    pending: '#FF7D00',
    arrived: '#00B42A',
    completed: '#1677FF',
    cancelled: '#86909C',
    rescheduled: '#FF7D00'
  }
  return colorMap[status]
}

export const getVerifyStatusColor = (status: VerifyStatus): string => {
  const colorMap: Record<VerifyStatus, string> = {
    success: '#00B42A',
    pending: '#FF7D00',
    cancelled: '#86909C',
    revoked: '#F53F3F'
  }
  return colorMap[status]
}

export const generateVoucherNo = (): string => {
  const date = dayjs().format('YYYYMMDD')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `EV${date}${random}`
}

export const generateVerifyId = (): string => {
  return `v${Date.now()}${Math.floor(Math.random() * 1000)}`
}

export const checkCouponExpiring = (validTo: string): boolean => {
  const expireDate = dayjs(validTo)
  const now = dayjs()
  const diffDays = expireDate.diff(now, 'day')
  return diffDays <= 7 && diffDays >= 0
}

export const getExpireDaysText = (validTo: string): string => {
  const expireDate = dayjs(validTo)
  const now = dayjs()
  const diffDays = expireDate.diff(now, 'day')
  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今日到期'
  if (diffDays <= 7) return `剩余${diffDays}天`
  return ''
}
