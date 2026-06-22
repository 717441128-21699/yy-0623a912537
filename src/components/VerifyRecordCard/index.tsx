import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import classnames from 'classnames'
import { VerifyRecord } from '@/types'
import StatusTag from '@/components/StatusTag'
import { formatDateTime } from '@/utils'
import styles from './index.module.scss'

interface VerifyRecordCardProps {
  record: VerifyRecord
  onRevoke?: () => void
  showRevoke?: boolean
}

const VerifyRecordCard: React.FC<VerifyRecordCardProps> = ({
  record,
  onRevoke,
  showRevoke = false
}) => {
  const canRevoke = record.status === 'success' && showRevoke

  return (
    <View className={classnames(styles.card, record.status === 'revoked' && styles.revoked)}>
      <View className={styles.header}>
        <View className={styles.couponInfo}>
          <Text className={styles.couponName}>{record.couponName}</Text>
          <Text className={styles.couponCode}>编号：{record.couponCode}</Text>
        </View>
        <StatusTag text={record.statusText} type={record.status} />
      </View>

      <View className={styles.customerInfo}>
        <Text className={styles.customerName}>{record.customerName}</Text>
        <Text className={styles.customerPhone}>{record.customerPhone}</Text>
      </View>

      <View className={styles.divider} />

      <View className={styles.itemRow}>
        <Text className={styles.itemLabel}>项目：</Text>
        <Text className={styles.itemValue}>{record.itemName}</Text>
      </View>

      <View className={styles.itemRow}>
        <Text className={styles.itemLabel}>部位：</Text>
        <Text className={styles.itemValue}>{record.itemPart}</Text>
      </View>

      <View className={styles.itemRow}>
        <Text className={styles.itemLabel}>次数：</Text>
        <Text className={styles.itemValue}>{record.verifyCount} 次</Text>
      </View>

      <View className={styles.verifyInfo}>
        <View className={styles.verifyItem}>
          <Text className={styles.verifyItemLabel}>医生</Text>
          <Text className={styles.verifyItemValue}>{record.doctorName}</Text>
        </View>
        <View className={styles.verifyItem}>
          <Text className={styles.verifyItemLabel}>诊室</Text>
          <Text className={styles.verifyItemValue}>{record.roomNo}</Text>
        </View>
        <View className={styles.verifyItem}>
          <Text className={styles.verifyItemLabel}>顾问</Text>
          <Text className={styles.verifyItemValue}>{record.consultantName}</Text>
        </View>
        <View className={styles.verifyItem}>
          <Text className={styles.verifyItemLabel}>操作人</Text>
          <Text className={styles.verifyItemValue}>{record.operatorName}</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <View>
          <Text className={styles.verifyTime}>{formatDateTime(record.verifyTime)}</Text>
          {record.electronicVoucher && (
            <Text className={styles.voucherNo}> 凭证号：{record.electronicVoucher}</Text>
          )}
        </View>
        {canRevoke && (
          <Button className={styles.btnRevoke} onClick={onRevoke}>
            撤回
          </Button>
        )}
      </View>

      {record.notes && (
        <View className={styles.itemRow}>
          <Text className={styles.itemLabel}>备注：</Text>
          <Text className={styles.itemValue} style={{ color: '#F53F3F' }}>{record.notes}</Text>
        </View>
      )}
    </View>
  )
}

export default VerifyRecordCard
