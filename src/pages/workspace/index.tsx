import React, { useMemo, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useVerifyStore } from '@/store/useVerifyStore'
import { formatDate } from '@/utils'
import styles from './index.module.scss'

const WorkspacePage: React.FC = () => {
  const { shiftSummary, appointments, coupons, closeShift } = useVerifyStore()

  const unhandledReminders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.filter(a => a.appointmentTime.startsWith(today))
    const reminders = []

    const unVerified = todayAppointments.filter(a =>
      a.status === 'pending' || a.status === 'arrived'
    )
    if (unVerified.length > 0) {
      reminders.push({
        type: 'warning',
        icon: '⏰',
        text: `还有 ${unVerified.length} 个预约未核销，请及时处理`,
        action: '去查看',
        actionUrl: '/pages/appointment/index'
      })
    }

    const expiringCoupons = coupons.filter(c =>
      c.status === 'available' &&
      new Date(c.validTo).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 &&
      new Date(c.validTo).getTime() > new Date().getTime()
    )
    if (expiringCoupons.length > 0) {
      reminders.push({
        type: 'warning',
        icon: '⚠️',
        text: `有 ${expiringCoupons.length} 张卡券即将过期，请提醒客户尽快使用`,
        action: '去查看',
        actionUrl: '/pages/verify/index'
      })
    }

    const frozenCoupons = coupons.filter(c => c.status === 'frozen')
    if (frozenCoupons.length > 0) {
      reminders.push({
        type: 'error',
        icon: '❄️',
        text: `有 ${frozenCoupons.length} 张冻结卡券待处理`,
        action: '去处理',
        actionUrl: '/pages/exception/index'
      })
    }

    return reminders
  }, [appointments, coupons])

  const sortedPerformance = useMemo(() => {
    return [...shiftSummary.consultantPerformance].sort((a, b) => b.count - a.count)
  }, [shiftSummary.consultantPerformance])

  useDidShow(() => {
    console.log('[WorkspacePage] did show')
  })

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'shift':
        Taro.navigateTo({ url: '/pages/shift-summary/index' })
        break
      case 'exception':
        Taro.navigateTo({ url: '/pages/exception/index' })
        break
      case 'revoke':
        Taro.switchTab({ url: '/pages/records/index' })
        break
      case 'reschedule':
        Taro.switchTab({ url: '/pages/appointment/index' })
        break
      case 'records':
        Taro.switchTab({ url: '/pages/records/index' })
        break
      case 'settings':
        Taro.showToast({ title: '设置功能开发中', icon: 'none' })
        break
    }
  }, [])

  const handleReminderAction = useCallback((url: string) => {
    if (url.startsWith('/pages/appointment') || url.startsWith('/pages/records')) {
      Taro.switchTab({ url })
    } else {
      Taro.navigateTo({ url })
    }
  }, [])

  const handleCloseShift = useCallback(() => {
    Taro.showModal({
      title: '交班确认',
      content: '确定要完成当前班次的交接吗？交接后将无法修改当班记录。',
      confirmText: '确认交接',
      success: (res) => {
        if (res.confirm) {
          closeShift()
          Taro.showToast({ title: '交班完成', icon: 'success' })
          console.log('[WorkspacePage] shift closed')
        }
      }
    })
  }, [closeShift])

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresh={() => Taro.stopPullDownRefresh()}
    >
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>王</View>
          <View className={styles.userDetails}>
            <Text className={styles.userName}>前台小王</Text>
            <Text className={styles.userRole}>门店前台 · 早班</Text>
          </View>
        </View>

        <View className={styles.shiftInfo}>
          <Text className={styles.shiftTitle}>当前班次</Text>
          <Text className={styles.shiftTime}>
            {shiftSummary.shiftName} · {formatDate(shiftSummary.startTime, 'YYYY-MM-DD HH:mm')}
          </Text>
          <View className={styles.shiftStatus}>
            <Text>{shiftSummary.isClosed ? '已交班' : '进行中'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>快捷操作</Text>
        <View className={styles.quickActions}>
          <View className={styles.actionItem} onClick={() => handleAction('shift')}>
            <View className={classnames(styles.actionIcon, styles.blue)}>📊</View>
            <Text className={styles.actionText}>交班汇总</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('exception')}>
            <View className={classnames(styles.actionIcon, styles.red)}>⚠️</View>
            <Text className={styles.actionText}>异常处理</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('revoke')}>
            <View className={classnames(styles.actionIcon, styles.orange)}>↩️</View>
            <Text className={styles.actionText}>撤回申请</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('reschedule')}>
            <View className={classnames(styles.actionIcon, styles.green)}>📅</View>
            <Text className={styles.actionText}>改约保留</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('records')}>
            <View className={classnames(styles.actionIcon, styles.cyan)}>📋</View>
            <Text className={styles.actionText}>核销记录</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleAction('settings')}>
            <View className={classnames(styles.actionIcon, styles.purple)}>⚙️</View>
            <Text className={styles.actionText}>系统设置</Text>
          </View>
        </View>
      </View>

      {unhandledReminders.length > 0 && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>待办提醒</Text>
          <View className={styles.reminderCard}>
            {unhandledReminders.map((reminder, index) => (
              <View
                key={index}
                className={classnames(styles.reminderItem, reminder.type === 'error' && styles.error)}
                onClick={() => handleReminderAction(reminder.actionUrl)}
              >
                <Text className={styles.reminderIcon}>{reminder.icon}</Text>
                <View className={styles.reminderContent}>
                  <Text className={styles.reminderText}>{reminder.text}</Text>
                  <Text className={styles.reminderAction}>{reminder.action} →</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.performanceCard}>
          <View className={styles.performanceHeader}>
            <Text className={styles.performanceTitle}>顾问业绩排行</Text>
            <Text className={styles.performanceDate}>{formatDate(new Date().toISOString())}</Text>
          </View>

          {sortedPerformance.length > 0 ? (
            <View className={styles.performanceList}>
              {sortedPerformance.map((item, index) => (
                <View key={item.consultantName} className={styles.performanceItem}>
                  <View className={classnames(
                    styles.rank,
                    index === 0 && styles.top1,
                    index === 1 && styles.top2,
                    index === 2 && styles.top3
                  )}>
                    <Text>{index + 1}</Text>
                  </View>
                  <View className={styles.consultantInfo}>
                    <Text className={styles.consultantName}>{item.consultantName}</Text>
                    <Text className={styles.consultantCount}>核销 {item.count} 单</Text>
                  </View>
                  <Text className={styles.performanceAmount}>¥{item.amount}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyIcon}>📊</Text>
              <Text className={styles.emptyText}>暂无业绩数据</Text>
            </View>
          )}
        </View>
      </View>

      {!shiftSummary.isClosed && (
        <View className={styles.section}>
          <View
            className={styles.actionItem}
            style={{ width: '100%', flexDirection: 'row', padding: '24rpx 32rpx' }}
            onClick={handleCloseShift}
          >
            <View className={classnames(styles.actionIcon, styles.green)} style={{ marginBottom: 0, marginRight: '16rpx' }}>✅</View>
            <Text className={styles.actionText}>完成交班</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default WorkspacePage
