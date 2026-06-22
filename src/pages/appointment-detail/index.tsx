import React, { useMemo, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useVerifyStore } from '@/store/useVerifyStore'
import { formatDateTime, formatPhone, getExpireDaysText } from '@/utils'
import BottomActionBar from '@/components/BottomActionBar'
import styles from './index.module.scss'

const AppointmentDetailPage: React.FC = () => {
  const {
    currentAppointment,
    getMatchedCoupons,
    setCurrentCoupon,
    coupons,
    searchCouponByPhone
  } = useVerifyStore()

  const matchedCoupons = useMemo(() => {
    if (!currentAppointment) return []
    return getMatchedCoupons(currentAppointment.id)
  }, [currentAppointment, getMatchedCoupons])

  const otherCoupons = useMemo(() => {
    if (!currentAppointment) return []
    const customerCoupons = searchCouponByPhone(currentAppointment.customerPhone)
    return customerCoupons.filter(
      c => !matchedCoupons.find(mc => mc.id === c.id)
    )
  }, [currentAppointment, matchedCoupons, searchCouponByPhone])

  const handleCallPhone = useCallback((phone: string) => {
    Taro.makePhoneCall({
      phoneNumber: phone,
      fail: () => {
        Taro.showToast({ title: '拨号失败', icon: 'none' })
      }
    })
  }, [])

  const handleUseCoupon = useCallback((coupon) => {
    setCurrentCoupon(coupon)
    Taro.navigateTo({ url: '/pages/verify-confirm/index' })
  }, [setCurrentCoupon])

  const handleArrive = useCallback(() => {
    Taro.showModal({
      title: '确认到店',
      content: `确认 ${currentAppointment?.customerName} 已到店？`,
      confirmText: '确认到店',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已标记到店', icon: 'success' })
        }
      }
    })
  }, [currentAppointment])

  const handleReschedule = useCallback(() => {
    Taro.showModal({
      title: '改约确认',
      content: '确定要为客户改约吗？改约后将保留预约，客户可改期再来。',
      confirmText: '确认改约',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '改约成功', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1500)
        }
      }
    })
  }, [])

  const handleCancel = useCallback(() => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消此预约吗？取消后客户需要重新预约。',
      confirmText: '确认取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消预约', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1500)
        }
      }
    })
  }, [])

  const getCouponTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
      experience: 'experience',
      course: 'course',
      gift: 'gift'
    }
    return classMap[type] || ''
  }

  const getCouponTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      experience: '体验券',
      course: '疗程卡',
      gift: '赠送券'
    }
    return nameMap[type] || '卡券'
  }

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      pending: 'pending',
      arrived: 'arrived',
      completed: 'completed',
      cancelled: 'cancelled'
    }
    return classMap[status] || ''
  }

  if (!currentAppointment) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '100rpx', color: '#C9CDD4' }}>📭</Text>
          <Text style={{ display: 'block', marginTop: '16rpx', color: '#86909C' }}>请先选择预约</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.appointmentHeader}>
        <View className={styles.statusRow}>
          <Text className={`${styles.statusTag} ${styles[getStatusClass(currentAppointment.status)]}`}>
            {currentAppointment.statusText}
          </Text>
          <Text className={styles.timeText}>
            {currentAppointment.appointmentTime}
          </Text>
        </View>
        <Text className={styles.itemName}>{currentAppointment.itemName}</Text>
        <Text className={styles.itemCategory}>{currentAppointment.itemCategory}</Text>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>👤</Text>
            客户信息
          </Text>
        </Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>客户姓名</Text>
            <Text className={styles.infoValue}>{currentAppointment.customerName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>联系电话</Text>
            <View>
              <Text
                className={styles.infoValue}
                style={{ color: '#1677FF' }}
                onClick={() => handleCallPhone(currentAppointment.customerPhone)}
              >
                {formatPhone(currentAppointment.customerPhone)}
              </Text>
            </View>
          </View>
          {currentAppointment.arriveTime && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>到店时间</Text>
              <Text className={styles.infoValue}>{currentAppointment.arriveTime}</Text>
            </View>
          )}
          {currentAppointment.notes && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{currentAppointment.notes}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>📍</Text>
            服务安排
          </Text>
        </Text>
        <View className={styles.infoCard}>
          <View className={styles.serviceArrangement}>
            <View className={styles.serviceItem}>
              <Text className={styles.serviceItemLabel}>主治医生</Text>
              <Text className={styles.serviceItemValue}>{currentAppointment.doctorName}</Text>
            </View>
            <View className={styles.serviceItem}>
              <Text className={styles.serviceItemLabel}>治疗室</Text>
              <Text className={styles.serviceItemValue}>{currentAppointment.roomNo}</Text>
            </View>
            <View className={styles.serviceItem}>
              <Text className={styles.serviceItemLabel}>服务顾问</Text>
              <Text className={styles.serviceItemValue}>{currentAppointment.consultantName}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.couponSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>🎫</Text>
            智能匹配卡券
          </Text>
          {matchedCoupons.length > 0 && (
            <Text className={`${styles.sectionBadge} ${styles.success}`}>
              {matchedCoupons.length} 张可用
            </Text>
          )}
        </Text>

        {matchedCoupons.length > 0 ? (
          <>
            <View className={styles.tipsCard}>
              <Text className={styles.tipsTitle}>
                <Text className={styles.tipsIcon}>💡</Text>
                智能匹配
              </Text>
              <Text className={styles.tipsText}>
                系统根据预约项目「{currentAppointment.itemName}」为您自动匹配了以下可用卡券
              </Text>
            </View>
            {matchedCoupons.map(coupon => (
              <View key={coupon.id} className={`${styles.couponCard} ${styles.matched}`}>
                <View className={styles.couponHeader}>
                  <Text className={`${styles.couponTypeTag} ${styles[getCouponTypeClass(coupon.type)]}`}>
                    {getCouponTypeName(coupon.type)}
                  </Text>
                  <Text className={styles.matchTag}>✓ 项目匹配</Text>
                </View>
                <Text className={styles.couponName}>{coupon.name}</Text>
                <View className={styles.couponInfo}>
                  <View className={styles.couponInfoItem}>
                    <Text className={styles.couponInfoIcon}>📅</Text>
                    <Text className={styles.couponInfoValue}>
                      {coupon.validFrom} 至 {coupon.validTo}
                    </Text>
                  </View>
                </View>
                <View className={styles.couponFooter}>
                  <Text className={styles.couponRemaining}>
                    <Text className={styles.couponRemainingValue}>{coupon.remainingCount}</Text>
                    次剩余 / 共 {coupon.totalCount} 次
                  </Text>
                  <View className={styles.useBtn} onClick={() => handleUseCoupon(coupon)}>
                    <Text>立即核销</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View className={styles.infoCard}>
            <View className={styles.emptyCoupon}>
              <Text className={styles.emptyIcon}>😅</Text>
              <Text className={styles.emptyText}>暂无匹配的卡券</Text>
              <Text style={{ fontSize: '24rpx', color: '#86909C', marginTop: '8rpx', display: 'block' }}>
                可扫码或手动输入手机号查询客户卡券
              </Text>
            </View>
          </View>
        )}
      </View>

      {otherCoupons.length > 0 && (
        <View className={styles.infoSection}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleText}>
              <Text className={styles.sectionIcon}>📋</Text>
              客户其他卡券
            </Text>
            <Text className={`${styles.sectionBadge} ${styles.warning}`}>
              {otherCoupons.length} 张
            </Text>
          </Text>
          {otherCoupons.map(coupon => (
            <View key={coupon.id} className={styles.couponCard}>
              <View className={styles.couponHeader}>
                <Text className={`${styles.couponTypeTag} ${styles[getCouponTypeClass(coupon.type)]}`}>
                  {getCouponTypeName(coupon.type)}
                </Text>
                {getExpireDaysText(coupon.validTo) && (
                  <Text className={`${styles.sectionBadge} ${styles.warning}`}>
                    {getExpireDaysText(coupon.validTo)}
                  </Text>
                )}
              </View>
              <Text className={styles.couponName}>{coupon.name}</Text>
              <View className={styles.couponInfo}>
                <View className={styles.couponInfoItem}>
                  <Text className={styles.couponInfoIcon}>✅</Text>
                  <Text>适用项目：{coupon.applicableItems.join('、')}</Text>
                </View>
              </View>
              <View className={styles.couponFooter}>
                <Text className={styles.couponRemaining}>
                  <Text className={styles.couponRemainingValue}>{coupon.remainingCount}</Text>
                  次剩余
                </Text>
                <View className={styles.useBtn} onClick={() => handleUseCoupon(coupon)}>
                  <Text>选择使用</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <BottomActionBar
        actions={[
          {
            text: '改约',
            type: 'secondary',
            onClick: handleReschedule
          },
          {
            text: '取消预约',
            type: 'danger',
            onClick: handleCancel
          },
          {
            text: '标记到店',
            type: 'primary',
            onClick: handleArrive,
            disabled: currentAppointment.status !== 'pending'
          }
        ]}
      />
    </View>
  )
}

export default AppointmentDetailPage
