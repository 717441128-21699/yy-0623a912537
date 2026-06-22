import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useVerifyStore } from '@/store/useVerifyStore'
import StatCard from '@/components/StatCard'
import AppointmentCard from '@/components/AppointmentCard'
import { Appointment, Coupon } from '@/types'
import styles from './index.module.scss'

type FilterType = 'all' | 'pending' | 'arrived' | 'completed' | 'cancelled' | 'warning'

const AppointmentPage: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>('all')

  const { appointments, coupons, getMatchedCoupons, setCurrentCoupon, getCouponById } = useVerifyStore()

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.filter(a =>
      a.appointmentTime.startsWith(today)
    )
    return {
      total: todayAppointments.length,
      pending: todayAppointments.filter(a => a.status === 'pending').length,
      arrived: todayAppointments.filter(a => a.status === 'arrived').length,
      warning: todayAppointments.filter(a =>
        a.notes?.includes('卡券') || a.status === 'pending' && (!a.matchedCoupons || a.matchedCoupons.length === 0)
      ).length
    }
  }, [appointments])

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    let filtered = appointments.filter(a => a.appointmentTime.startsWith(today))

    switch (filterType) {
      case 'pending':
        filtered = filtered.filter(a => a.status === 'pending')
        break
      case 'arrived':
        filtered = filtered.filter(a => a.status === 'arrived')
        break
      case 'completed':
        filtered = filtered.filter(a => a.status === 'completed')
        break
      case 'cancelled':
        filtered = filtered.filter(a => a.status === 'cancelled')
        break
      case 'warning':
        filtered = filtered.filter(a =>
          a.notes?.includes('卡券') ||
          (a.status === 'pending' && (!a.matchedCoupons || a.matchedCoupons.length === 0))
        )
        break
    }

    return filtered.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
  }, [appointments, filterType])

  const groupedAppointments = useMemo(() => {
    const groups: Record<string, Appointment[]> = {}
    todayAppointments.forEach(apt => {
      const hour = apt.appointmentTime.split(' ')[1].split(':')[0]
      const key = `${hour}:00-${parseInt(hour) + 1}:00`
      if (!groups[key]) groups[key] = []
      groups[key].push(apt)
    })
    return groups
  }, [todayAppointments])

  const warningAppointments = useMemo(() => {
    return appointments.filter(a =>
      a.notes?.includes('卡券') && a.status === 'pending'
    )
  }, [appointments])

  useDidShow(() => {
    setFilterType('all')
  })

  const checkHasMatchedCoupon = useCallback((appointment: Appointment): boolean => {
    if (!appointment.matchedCoupons || appointment.matchedCoupons.length === 0) return false
    return appointment.matchedCoupons.some(id => {
      const coupon = getCouponById(id)
      return coupon && coupon.status === 'available'
    })
  }, [getCouponById])

  const handleVerify = useCallback((appointment: Appointment) => {
    const matchedCoupons = getMatchedCoupons(appointment.id)
    if (matchedCoupons.length > 0) {
      if (matchedCoupons.length === 1) {
        setCurrentCoupon(matchedCoupons[0])
        Taro.navigateTo({ url: '/pages/verify-confirm/index' })
      } else {
        Taro.showActionSheet({
          itemList: matchedCoupons.map(c => `${c.name} (剩余${c.remainingCount}次)`)
        }).then(res => {
          setCurrentCoupon(matchedCoupons[res.tapIndex])
          Taro.navigateTo({ url: '/pages/verify-confirm/index' })
        }).catch(err => {
          console.log('[AppointmentPage] actionSheet cancelled', err)
        })
      }
    } else {
      Taro.showToast({ title: '该预约暂无匹配卡券', icon: 'none' })
    }
  }, [getMatchedCoupons, setCurrentCoupon])

  const handleViewDetail = useCallback((appointment: Appointment) => {
    Taro.navigateTo({ url: `/pages/appointment-detail/index?id=${appointment.id}` })
  }, [])

  const filters = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'pending', label: '待到店', count: stats.pending },
    { key: 'arrived', label: '已到店', count: stats.arrived },
    { key: 'warning', label: '需关注', count: stats.warning }
  ]

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresh={() => Taro.stopPullDownRefresh()}
    >
      <View className={styles.header}>
        <Text className={styles.title}>预约管理</Text>
        <Text className={styles.subtitle}>今日预约客户及可用卡券匹配</Text>
      </View>

      <View className={styles.statsRow}>
        <StatCard value={stats.total} label='今日预约' color='primary' />
        <StatCard value={stats.arrived} label='已到店' color='success' />
        <StatCard value={stats.warning} label='需关注' color='warning' />
      </View>

      {warningAppointments.length > 0 && (
        <View className={styles.warningBanner}>
          <Text className={styles.warningIcon}>⚠️</Text>
          <View className={styles.warningContent}>
            <Text className={styles.warningTitle}>有 {warningAppointments.length} 个预约需要关注</Text>
            <Text className={styles.warningDesc}>
              {warningAppointments.map(a => a.customerName).join('、')} 的卡券存在异常，请提前处理
            </Text>
          </View>
        </View>
      )}

      <View className={styles.filterSection}>
        <View className={styles.filterCard}>
          {filters.map(filter => (
            <View
              key={filter.key}
              className={classnames(styles.filterItem, filterType === filter.key && styles.active)}
              onClick={() => setFilterType(filter.key as FilterType)}
            >
              <Text>{filter.label}</Text>
              <Text className={styles.filterCount}>{filter.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.appointmentList}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>今日预约列表</Text>
          <Text className={styles.listCount}>共 {todayAppointments.length} 位</Text>
        </View>

        {Object.keys(groupedAppointments).length > 0 ? (
          Object.entries(groupedAppointments).map(([timeGroup, apts]) => (
            <View key={timeGroup} className={styles.timeGroup}>
              <View className={styles.timeGroupTitle}>
                <View className={styles.timeDot} />
                <Text className={styles.timeText}>{timeGroup}</Text>
              </View>
              {apts.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  hasMatchedCoupon={checkHasMatchedCoupon(apt)}
                  onVerify={() => handleVerify(apt)}
                  onViewDetail={() => handleViewDetail(apt)}
                />
              ))}
            </View>
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📅</Text>
            <Text className={styles.emptyText}>暂无符合条件的预约</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default AppointmentPage
