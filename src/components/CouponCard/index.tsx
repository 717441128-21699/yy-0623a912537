import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import { Coupon } from '@/types'
import StatusTag from '@/components/StatusTag'
import { getExpireDaysText, checkCouponExpiring, formatDate } from '@/utils'
import styles from './index.module.scss'

interface CouponCardProps {
  coupon: Coupon
  showActions?: boolean
  onVerify?: () => void
  onViewDetail?: () => void
  disabled?: boolean
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  showActions = true,
  onVerify,
  onViewDetail,
  disabled = false
}) => {
  const expireText = getExpireDaysText(coupon.validTo)
  const isExpiring = checkCouponExpiring(coupon.validTo)
  const isDisabled = disabled || coupon.status !== 'available'

  return (
    <View className={classnames(styles.card, isDisabled && styles.disabled)} onClick={onViewDetail}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <View className={classnames(styles.typeTag, styles[coupon.type])}>
            {coupon.typeName}
          </View>
          <Text className={styles.couponName}>{coupon.name}</Text>
          <Text className={styles.couponCode}>编号：{coupon.code}</Text>
        </View>
        <View className={styles.countInfo}>
          <Text className={styles.countValue}>{coupon.remainingCount}</Text>
          <Text className={styles.countLabel}>剩余{coupon.totalCount > 1 ? '次数' : '次数'}</Text>
          <StatusTag text={coupon.statusText} type={coupon.status} />
        </View>
      </View>

      <View className={styles.divider} />

      <View className={styles.customerInfo}>
        <Text className={styles.customerName}>{coupon.customerName}</Text>
        <Text className={styles.customerPhone}>{coupon.customerPhone}</Text>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.metaLabel}>来源：</Text>
        <Text className={styles.metaValue}>{coupon.source}</Text>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.metaLabel}>适用项目：</Text>
      </View>
      <View className={styles.applicableItems}>
        {coupon.applicableItems.map((item, index) => (
          <View key={index} className={styles.itemTag}>
            <Text>{item}</Text>
          </View>
        ))}
      </View>

      <View className={styles.validity}>
        <Text className={styles.validityText}>
          有效期：{formatDate(coupon.validFrom)} 至 {formatDate(coupon.validTo)}
        </Text>
        {isExpiring && (
          <View className={styles.expireWarning}>
            <Text>{expireText}</Text>
          </View>
        )}
      </View>

      {showActions && coupon.status === 'available' && (
        <View className={styles.footer}>
          <Button
            className={classnames(styles.btn, styles.btnSecondary)}
            onClick={(e) => { e.stopPropagation(); onViewDetail?.() }}
          >
            查看详情
          </Button>
          <Button
            className={classnames(styles.btn, styles.btnPrimary)}
            onClick={(e) => { e.stopPropagation(); onVerify?.() }}
          >
            立即核销
          </Button>
        </View>
      )}
    </View>
  )
}

export default CouponCard
