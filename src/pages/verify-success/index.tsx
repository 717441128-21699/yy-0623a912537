import React, { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useVerifyStore } from '@/store/useVerifyStore'
import { formatDateTime, formatPhone } from '@/utils'
import BottomActionBar from '@/components/BottomActionBar'
import styles from './index.module.scss'

const VerifySuccessPage: React.FC = () => {
  const { currentRecord } = useVerifyStore()
  const [sent, setSent] = useState(false)

  const handleCopyVoucher = useCallback(() => {
    if (currentRecord?.electronicVoucher) {
      Taro.setClipboardData({
        data: currentRecord.electronicVoucher,
        success: () => {
          Taro.showToast({ title: '凭证号已复制', icon: 'success' })
        }
      })
    }
  }, [currentRecord])

  const handleSendVoucher = useCallback(() => {
    setSent(true)
    Taro.showToast({ title: '电子凭证已发送', icon: 'success' })
  }, [])

  const handleViewRecord = useCallback(() => {
    Taro.switchTab({ url: '/pages/records/index' })
  }, [])

  const handleNewVerify = useCallback(() => {
    Taro.switchTab({ url: '/pages/verify/index' })
  }, [])

  if (!currentRecord) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '100rpx', color: '#C9CDD4' }}>📭</Text>
          <Text style={{ display: 'block', marginTop: '16rpx', color: '#86909C' }}>暂无核销记录</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={styles.successHeader}>
        <View className={styles.successIcon}>✓</View>
        <Text className={styles.successTitle}>核销成功</Text>
        <Text className={styles.successSubtitle}>电子凭证已生成</Text>
      </View>

      <View className={styles.voucherSection}>
        <View className={styles.voucherCard}>
          <View className={styles.voucherHeader}>
            <View>
              <Text className={styles.voucherLabel}>电子凭证号</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx', marginTop: '8rpx' }}>
                <Text className={styles.voucherNo}>{currentRecord.electronicVoucher}</Text>
                <View className={styles.voucherCopyBtn} onClick={handleCopyVoucher}>
                  <Text>复制</Text>
                </View>
              </View>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>核销时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(currentRecord.verifyTime)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>操作员工</Text>
            <Text className={styles.infoValue}>{currentRecord.operatorName}</Text>
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>核销信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>卡券名称</Text>
            <Text className={styles.infoValue}>{currentRecord.couponName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>客户姓名</Text>
            <Text className={styles.infoValue}>{currentRecord.customerName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>联系电话</Text>
            <Text className={styles.infoValue}>{formatPhone(currentRecord.customerPhone)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>核销项目</Text>
            <Text className={styles.infoValue}>{currentRecord.itemName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>治疗部位</Text>
            <Text className={styles.infoValue}>{currentRecord.itemPart}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>核销次数</Text>
            <Text className={styles.infoValue}>{currentRecord.verifyCount} 次</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>主治医生</Text>
            <Text className={styles.infoValue}>{currentRecord.doctorName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>治疗室</Text>
            <Text className={styles.infoValue}>{currentRecord.roomNo}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务顾问</Text>
            <Text className={styles.infoValue}>{currentRecord.consultantName}</Text>
          </View>
          {currentRecord.notes && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{currentRecord.notes}</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>温馨提示</Text>
        <View className={styles.noticeCard}>
          <Text className={styles.noticeTitle}>
            <Text className={styles.noticeIcon}>💡</Text>
            治疗后注意事项
          </Text>
          <Text className={styles.noticeText}>
            1. 治疗后24小时内避免沾水，保持治疗部位清洁干燥{'\n'}
            2. 注意防晒，避免高温环境（桑拿、温泉等）{'\n'}
            3. 饮食清淡，避免辛辣刺激食物{'\n'}
            4. 如有红肿、瘙痒等不适，请及时联系我们
          </Text>
        </View>
      </View>

      <View className={styles.sendSection}>
        <Text className={styles.sectionTitle}>发送电子凭证</Text>
        <View className={styles.sendCard}>
          <View className={styles.sendRow}>
            <Text className={styles.sendLabel}>发送至</Text>
            <Text className={styles.sendPhone}>{formatPhone(currentRecord.customerPhone)}</Text>
          </View>
          <View
            className={`${styles.sendBtn} ${sent ? styles.sent : ''}`}
            onClick={!sent ? handleSendVoucher : undefined}
          >
            <Text className={styles.sendBtnIcon}>{sent ? '✓' : '📱'}</Text>
            <Text>{sent ? '已发送成功' : '发送电子凭证给客户'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionBtn} onClick={handleViewRecord}>
          <Text className={styles.actionIcon}>📋</Text>
          <Text>查看记录</Text>
        </View>
        <View className={`${styles.actionBtn} ${styles.primary}`} onClick={handleNewVerify}>
          <Text className={styles.actionIcon}>➕</Text>
          <Text>继续核销</Text>
        </View>
      </View>

      <BottomActionBar
        actions={[
          {
            text: '返回首页',
            type: 'primary',
            onClick: () => Taro.switchTab({ url: '/pages/verify/index' })
          }
        ]}
      />
    </View>
  )
}

export default VerifySuccessPage
