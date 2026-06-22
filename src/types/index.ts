export type CouponStatus = 'available' | 'used' | 'expired' | 'frozen'
export type CouponType = 'experience' | 'course' | 'gift'
export type AppointmentStatus = 'pending' | 'arrived' | 'completed' | 'cancelled' | 'rescheduled'
export type VerifyStatus = 'success' | 'pending' | 'cancelled' | 'revoked'

export interface Coupon {
  id: string
  code: string
  type: CouponType
  typeName: string
  name: string
  source: string
  customerName: string
  customerPhone: string
  applicableItems: string[]
  totalCount: number
  usedCount: number
  remainingCount: number
  validFrom: string
  validTo: string
  status: CouponStatus
  statusText: string
  freezeReason?: string
  createTime: string
  notes?: string
}

export interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  itemName: string
  itemCategory: string
  appointmentTime: string
  roomNo: string
  doctorName: string
  consultantName: string
  status: AppointmentStatus
  statusText: string
  matchedCoupons?: string[]
  arriveTime?: string
  notes?: string
}

export interface VerifyRecord {
  id: string
  couponId: string
  couponCode: string
  couponName: string
  customerName: string
  customerPhone: string
  itemName: string
  itemPart: string
  verifyCount: number
  doctorName: string
  roomNo: string
  consultantName: string
  operatorName: string
  status: VerifyStatus
  statusText: string
  verifyTime: string
  electronicVoucher?: string
  notes?: string
}

export interface ShiftSummary {
  shiftId: string
  shiftName: string
  operatorName: string
  startTime: string
  endTime?: string
  totalVerifyCount: number
  totalVerifyAmount: number
  verifyByType: { type: string; count: number; amount: number }[]
  consultantPerformance: { consultantName: string; count: number; amount: number }[]
  unVerifiedAppointments: number
  isClosed: boolean
}

export interface VerifyFormData {
  couponId: string
  itemName: string
  itemPart: string
  verifyCount: number
  doctorName: string
  roomNo: string
  consultantName: string
  notes?: string
}

export interface ExceptionInfo {
  type: 'expired' | 'frozen' | 'used' | 'not_found'
  title: string
  reason: string
  suggestion: string
  canReschedule: boolean
  canRevoke: boolean
}

export interface Doctor {
  id: string
  name: string
  department: string
  title: string
}

export interface Room {
  id: string
  name: string
  type: string
}

export interface Consultant {
  id: string
  name: string
  level: string
}
