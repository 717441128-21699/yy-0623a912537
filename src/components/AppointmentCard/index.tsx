import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import { Appointment } from '@/types'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

interface AppointmentCardProps {
  appointment: Appointment
  onVerify?: () => void
  onViewDetail?: () => void
  hasMatchedCoupon?: boolean
  showActions?: boolean
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onVerify,
  onViewDetail,
  hasMatchedCoupon = false,
  showActions = true
}) => {
  const cardClass = classnames(
    styles.card,
    appointment.status === 'arrived' && styles.arrived,
    hasMatchedCoupon && appointment.status === 'pending' && styles.hasCoupon,
    appointment.notes?.includes('卡券') && styles.warning
  )

  return (
    <View className={cardClass} onClick={onViewDetail}>
      <View className={styles.header}>
        <View className={styles.timeInfo}>
          <Text className={styles.time}>{appointment.appointmentTime.split(' ')[1]}</Text>
          <StatusTag text={appointment.statusText} type={appointment.status} />
        </View>
        <View className={styles.customerInfo}>
          <Text className={styles.customerName}>{appointment.customerName}</Text>
          <Text className={styles.customerPhone}>{appointment.customerPhone}</Text>
        </View>
      </View>

      <View className={styles.divider} />

      <View className={styles.itemInfo}>
        <Text className={styles.itemName}>{appointment.itemName}</Text>
        <Text className={styles.itemCategory}>{appointment.itemCategory}</Text>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.metaLabel}>医生：</Text>
        <Text className={styles.metaValue}>{appointment.doctorName}</Text>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.metaLabel}>诊室：</Text>
        <Text className={styles.metaValue}>{appointment.roomNo}</Text>
      </View>

      <View className={styles.metaRow}>
        <Text className={styles.metaLabel}>顾问：</Text>
        <Text className={styles.metaValue}>{appointment.consultantName}</Text>
      </View>

      {appointment.arriveTime && (
        <View className={styles.metaRow}>
          <Text className={styles.metaLabel}>到店时间：</Text>
          <Text className={styles.metaValue}>{appointment.arriveTime}</Text>
        </View>
      )}

      {hasMatchedCoupon && appointment.status === 'pending' && (
        <View className={styles.couponHint}>
          <Text className={styles.hintText}>该顾客有可用卡券，点击快速核销</Text>
        </View>
      )}

      {appointment.notes && (
        <View className={styles.metaRow}>
          <Text className={styles.metaLabel}>备注：</Text>
          <Text className={styles.metaValue} style={{ color: appointment.notes.includes('卡券') ? '#F53F3F' : undefined }}>
            {appointment.notes}
          </Text>
        </View>
      )}

      {showActions && (appointment.status === 'pending' || appointment.status === 'arrived') && (
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
            快速核销
          </Button>
        </View>
      )}
    </View>
  )
}

export default AppointmentCard
