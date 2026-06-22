import { create } from 'zustand'
import { Coupon, Appointment, VerifyRecord, VerifyFormData, ExceptionInfo } from '@/types'
import { mockCoupons } from '@/data/coupons'
import { mockAppointments } from '@/data/appointments'
import { mockRecords, mockShiftSummary } from '@/data/records'
import { generateVoucherNo, generateVerifyId } from '@/utils'

interface VerifyState {
  coupons: Coupon[]
  appointments: Appointment[]
  records: VerifyRecord[]
  currentCoupon: Coupon | null
  currentAppointment: Appointment | null
  currentRecord: VerifyRecord | null
  searchKeyword: string
  verifyFormData: Partial<VerifyFormData>
  exceptionInfo: ExceptionInfo | null
  shiftSummary: typeof mockShiftSummary
  isLoading: boolean

  setSearchKeyword: (keyword: string) => void
  scanCoupon: (code: string) => Coupon | null
  searchCouponByPhone: (phone: string) => Coupon[]
  getCouponById: (id: string) => Coupon | null
  getAppointmentById: (id: string) => Appointment | null
  setCurrentCoupon: (coupon: Coupon | null) => void
  setCurrentAppointment: (appointment: Appointment | null) => void
  setVerifyFormData: (data: Partial<VerifyFormData>) => void
  submitVerify: () => VerifyRecord | null
  setExceptionInfo: (info: ExceptionInfo | null) => void
  revokeVerify: (recordId: string) => boolean
  rescheduleAppointment: (appointmentId: string) => boolean
  closeShift: () => boolean
  getTodayStats: () => { total: number; success: number; pending: number; exception: number }
  getMatchedCoupons: (appointmentId: string) => Coupon[]
}

export const useVerifyStore = create<VerifyState>((set, get) => ({
  coupons: mockCoupons,
  appointments: mockAppointments,
  records: mockRecords,
  currentCoupon: null,
  currentAppointment: null,
  currentRecord: null,
  searchKeyword: '',
  verifyFormData: {},
  exceptionInfo: null,
  shiftSummary: mockShiftSummary,
  isLoading: false,

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  scanCoupon: (code) => {
    const { coupons } = get()
    const coupon = coupons.find(c => c.code === code) || null
    console.log('[VerifyStore] scanCoupon', { code, found: !!coupon })

    if (coupon) {
      if (coupon.status === 'expired') {
        set({
          exceptionInfo: {
            type: 'expired',
            title: '卡券已过期',
            reason: `该卡券有效期至 ${coupon.validTo}，现已过期无法使用`,
            suggestion: '建议与客户沟通，可考虑重新购买或申请延期',
            canReschedule: false,
            canRevoke: false
          }
        })
        return null
      }
      if (coupon.status === 'frozen') {
        set({
          exceptionInfo: {
            type: 'frozen',
            title: '卡券已冻结',
            reason: coupon.freezeReason || '该卡券已被冻结，暂无法使用',
            suggestion: '请先联系管理人员解冻后再进行核销',
            canReschedule: true,
            canRevoke: false
          }
        })
        return null
      }
      if (coupon.status === 'used') {
        set({
          exceptionInfo: {
            type: 'used',
            title: '卡券已用完',
            reason: `该卡券共 ${coupon.totalCount} 次，已全部使用完毕`,
            suggestion: '可推荐客户购买新的疗程或体验券',
            canReschedule: false,
            canRevoke: false
          }
        })
        return null
      }
    } else {
      set({
        exceptionInfo: {
          type: 'not_found',
          title: '未找到卡券',
          reason: `未找到编号为 "${code}" 的卡券，请确认卡券编号是否正确`,
          suggestion: '请检查卡券编号或尝试通过手机号查询',
          canReschedule: false,
          canRevoke: false
        }
      })
    }

    if (coupon && coupon.status === 'available') {
      set({ currentCoupon: coupon })
    }
    return coupon
  },

  searchCouponByPhone: (phone) => {
    const { coupons } = get()
    const result = coupons.filter(c =>
      c.customerPhone.includes(phone) && c.status === 'available'
    )
    console.log('[VerifyStore] searchCouponByPhone', { phone, resultCount: result.length })
    return result
  },

  getCouponById: (id) => {
    const { coupons } = get()
    return coupons.find(c => c.id === id) || null
  },

  getAppointmentById: (id) => {
    const { appointments } = get()
    return appointments.find(a => a.id === id) || null
  },

  setCurrentCoupon: (coupon) => set({ currentCoupon: coupon }),

  setCurrentAppointment: (appointment) => set({ currentAppointment: appointment }),

  setVerifyFormData: (data) => set({
    verifyFormData: { ...get().verifyFormData, ...data }
  }),

  submitVerify: () => {
    const { currentCoupon, verifyFormData, coupons, records, shiftSummary } = get()
    if (!currentCoupon) return null

    console.log('[VerifyStore] submitVerify', {
      couponId: currentCoupon.id,
      formData: verifyFormData
    })

    const newRecord: VerifyRecord = {
      id: generateVerifyId(),
      couponId: currentCoupon.id,
      couponCode: currentCoupon.code,
      couponName: currentCoupon.name,
      customerName: currentCoupon.customerName,
      customerPhone: currentCoupon.customerPhone,
      itemName: verifyFormData.itemName || currentCoupon.applicableItems[0],
      itemPart: verifyFormData.itemPart || '面部',
      verifyCount: verifyFormData.verifyCount || 1,
      doctorName: verifyFormData.doctorName || '',
      roomNo: verifyFormData.roomNo || '',
      consultantName: verifyFormData.consultantName || '',
      operatorName: '前台小王',
      status: 'success',
      statusText: '核销成功',
      verifyTime: new Date().toISOString(),
      electronicVoucher: generateVoucherNo(),
      notes: verifyFormData.notes
    }

    const updatedCoupons = coupons.map(c => {
      if (c.id === currentCoupon.id) {
        const newUsedCount = c.usedCount + newRecord.verifyCount
        return {
          ...c,
          usedCount: newUsedCount,
          remainingCount: c.totalCount - newUsedCount,
          status: newUsedCount >= c.totalCount ? 'used' as const : 'available' as const,
          statusText: newUsedCount >= c.totalCount ? '已用完' : '可使用'
        }
      }
      return c
    })

    const updatedShiftSummary = {
      ...shiftSummary,
      totalVerifyCount: shiftSummary.totalVerifyCount + 1
    }

    set({
      records: [newRecord, ...records],
      coupons: updatedCoupons,
      currentRecord: newRecord,
      shiftSummary: updatedShiftSummary,
      currentCoupon: null,
      verifyFormData: {}
    })

    return newRecord
  },

  setExceptionInfo: (info) => set({ exceptionInfo: info }),

  revokeVerify: (recordId) => {
    const { records, coupons } = get()
    const record = records.find(r => r.id === recordId)
    if (!record || record.status !== 'success') return false

    console.log('[VerifyStore] revokeVerify', { recordId })

    const updatedRecords = records.map(r => {
      if (r.id === recordId) {
        return { ...r, status: 'revoked' as const, statusText: '已撤回' }
      }
      return r
    })

    const updatedCoupons = coupons.map(c => {
      if (c.id === record.couponId) {
        const newUsedCount = c.usedCount - record.verifyCount
        return {
          ...c,
          usedCount: newUsedCount,
          remainingCount: c.totalCount - newUsedCount,
          status: 'available' as const,
          statusText: '可使用'
        }
      }
      return c
    })

    set({ records: updatedRecords, coupons: updatedCoupons })
    return true
  },

  rescheduleAppointment: (appointmentId) => {
    const { appointments } = get()
    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment) return false

    console.log('[VerifyStore] rescheduleAppointment', { appointmentId })

    const updatedAppointments = appointments.map(a => {
      if (a.id === appointmentId) {
        return { ...a, status: 'cancelled' as const, statusText: '已改约' }
      }
      return a
    })

    set({ appointments: updatedAppointments })
    return true
  },

  closeShift: () => {
    const { shiftSummary } = get()
    set({
      shiftSummary: {
        ...shiftSummary,
        isClosed: true,
        endTime: new Date().toISOString()
      }
    })
    return true
  },

  getTodayStats: () => {
    const { records } = get()
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = records.filter(r => r.verifyTime.startsWith(today))

    return {
      total: todayRecords.length,
      success: todayRecords.filter(r => r.status === 'success').length,
      pending: todayRecords.filter(r => r.status === 'pending').length,
      exception: todayRecords.filter(r => r.status === 'revoked').length
    }
  },

  getMatchedCoupons: (appointmentId) => {
    const { appointments, coupons } = get()
    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment || !appointment.matchedCoupons) return []

    return coupons.filter(c =>
      appointment.matchedCoupons!.includes(c.id) && c.status === 'available'
    )
  }
}))
