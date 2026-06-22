import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useVerifyStore } from '@/store/useVerifyStore'
import StatusTag from '@/components/StatusTag'
import BottomActionBar from '@/components/BottomActionBar'
import { formatDate, checkCouponExpiring, getExpireDaysText } from '@/utils'
import { Coupon } from '@/types'
import styles from './index.module.scss'

const CouponDetailPage: React.FC = () => {
  const router = useRouter()
  const couponId = router.params.id as string

  const { getCouponById, records, setCurrentCoupon } = useVerifyStore()
  const [coupon, setCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    if (couponId) {
      const found = getCouponById(couponId)
      setCoupon(found)
      console.log('[CouponDetailPage] loaded coupon', couponId, found)
    }
  }, [couponId, getCouponById])

  const couponRecords = useMemo(() => {
    if (!coupon) return []
    return records.filter(r => r.couponId === coupon.id).sort((a, b) => b.verifyTime.localeCompare(a.verifyTime))
  }, [coupon, records])

  const isExpiring = useMemo(() => {
    if (!coupon) return false
    return checkCouponExpiring(coupon.validTo)
  }, [coupon])

  const expireText = useMemo(() => {
    if (!coupon) return ''
    return getExpireDaysText(coupon.validTo)
  }, [coupon])

  const handleVerify = useCallback(() => {
    if (!coupon) return
    setCurrentCoupon(coupon)
    Taro.navigateTo({ url: '/pages/verify-confirm/index' })
  }, [coupon, setCurrentCoupon])

  const handleReschedule = useCallback(() => {
    Taro.showToast({ title: '改约功能开发中', icon: 'none' })
  }, [])

  if (!coupon) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '100rpx', color: '#C9CDD4' }}>📭</Text>
          <Text style={{ display: 'block', marginTop: '16rpx', color: '#86909C' }}>卡券不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.typeTag}>{coupon.typeName}</View>
        <Text className={styles.couponName}>{coupon.name}</Text>
        <Text className={styles.couponCode}>卡券编号：{coupon.code}</Text>
      </View>

      <View className={styles.countSection}>
        <View className={styles.countItem}>
          <Text className={styles.countValue}>{coupon.remainingCount}</Text>
          <Text className={styles.countLabel}>剩余次数</Text>
        </View>
        <View className={styles.countDivider} />
        <View className={styles.countItem}>
          <Text className={styles.countValue}>{coupon.usedCount}</Text>
          <Text className={styles.countLabel}>已使用</Text>
        </View>
        <View className={styles.countDivider} />
        <View className={styles.countItem}>
          <Text className={styles.countValue}>{coupon.totalCount}</Text>
          <Text className={styles.countLabel}>总次数</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>卡券信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>客户姓名</Text>
            <Text className={styles.infoValue}>{coupon.customerName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>联系电话</Text>
            <Text className={styles.infoValue}>{coupon.customerPhone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>卡券来源</Text>
            <Text className={styles.infoValue}>{coupon.source}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>当前状态</Text>
            <View className={styles.infoValue}>
              <StatusTag text={coupon.statusText} type={coupon.status} />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>适用项目</Text>
        <View className={styles.infoCard}>
          <View className={styles.applicableItems}>
            {coupon.applicableItems.map((item, index) => (
              <View key={index} className={styles.itemTag}>
                <Text>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>有效期</Text>
        <View className={styles.validityCard}>
          <View className={styles.validityRow}>
            <Text className={styles.validityLabel}>开始日期</Text>
            <Text className={styles.validityValue}>{formatDate(coupon.validFrom)}</Text>
          </View>
          <View className={styles.validityRow}>
            <Text className={styles.validityLabel}>到期日期</Text>
            <Text className={styles.validityValue}>{formatDate(coupon.validTo)}</Text>
          </View>
          {isExpiring && coupon.status === 'available' && (
            <View className={classnames(styles.statusInfo, styles.available)}>
              <Text className={styles.statusIcon}>⏰</Text>
              <Text className={classnames(styles.statusText, styles.available)}>
                {expireText}，请提醒客户尽快使用
              </Text>
            </View>
          )}
          {coupon.status === 'frozen' && (
            <View className={classnames(styles.statusInfo, styles.frozen)}>
              <Text className={styles.statusIcon}>❄️</Text>
              <Text className={classnames(styles.statusText, styles.frozen)}>
                冻结原因：{coupon.freezeReason}
              </Text>
            </View>
          )}
          {coupon.status === 'expired' && (
            <View className={classnames(styles.statusInfo, styles.expired)}>
              <Text className={styles.statusIcon}>⏰</Text>
              <Text className={classnames(styles.statusText, styles.expired)}>
                该卡券已于 {formatDate(coupon.validTo)} 过期
              </Text>
            </View>
          )}
        </View>
      </View>

      {coupon.notes && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>备注信息</Text>
          <View className={styles.notesCard}>
            <Text className={styles.notesText}>{coupon.notes}</Text>
          </View>
        </View>
      )}

      {couponRecords.length > 0 && (
        <View className={styles.historySection}>
          <Text className={styles.historyTitle}>核销历史</Text>
          {couponRecords.map(record => (
            <View key={record.id} className={styles.historyItem}>
              <View className={styles.historyItemInfo}>
                <Text className={styles.historyItemTime}>{record.itemName}</Text>
                <Text className={styles.historyItemDetail}>
                  {record.verifyTime.split('T')[0]} · {record.doctorName} · {record.roomNo}
                </Text>
              </View>
              <StatusTag text={record.statusText} type={record.status} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

export default CouponDetailPage
