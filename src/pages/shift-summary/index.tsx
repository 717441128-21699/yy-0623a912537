import React, { useState, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useVerifyStore } from '@/store/useVerifyStore'
import { formatDate, formatDateTime } from '@/utils'
import BottomActionBar from '@/components/BottomActionBar'
import styles from './index.module.scss'

const ShiftSummaryPage: React.FC = () => {
  const { shiftSummary, closeShift } = useVerifyStore()
  const [closed, setClosed] = useState(shiftSummary.isClosed)
  const [processing, setProcessing] = useState(false)

  const handleCloseShift = useCallback(() => {
    if (shiftSummary.unVerifiedAppointments > 0) {
      Taro.showModal({
        title: '交班提醒',
        content: `还有 ${shiftSummary.unVerifiedAppointments} 个预约未核销，确定要交班吗？`,
        confirmText: '确认交班',
        confirmColor: '#F53F3F',
        success: (res) => {
          if (res.confirm) {
            doCloseShift()
          }
        }
      })
    } else {
      Taro.showModal({
        title: '确认交班',
        content: '确定要结束当前班次并进行交班吗？',
        confirmText: '确认交班',
        success: (res) => {
          if (res.confirm) {
            doCloseShift()
          }
        }
      })
    }
  }, [shiftSummary.unVerifiedAppointments])

  const doCloseShift = useCallback(() => {
    setProcessing(true)
    setTimeout(() => {
      const success = closeShift()
      setProcessing(false)
      if (success) {
        setClosed(true)
        Taro.showToast({ title: '交班成功', icon: 'success' })
      } else {
        Taro.showToast({ title: '交班失败，请重试', icon: 'none' })
      }
    }, 1000)
  }, [closeShift])

  const handleViewUnverified = useCallback(() => {
    Taro.switchTab({ url: '/pages/appointment/index' })
  }, [])

  const handleExportReport = useCallback(() => {
    Taro.showToast({ title: '报表导出中...', icon: 'loading' })
    setTimeout(() => {
      Taro.showToast({ title: '报表已发送至邮箱', icon: 'success' })
    }, 1500)
  }, [])

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      '体验券': '🎁',
      '疗程卡': '📋',
      '赠送券': '🎉'
    }
    return iconMap[type] || '📄'
  }

  const getTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
      '体验券': 'experience',
      '疗程卡': 'course',
      '赠送券': 'gift'
    }
    return classMap[type] || ''
  }

  const getRankClass = (index: number) => {
    if (index === 0) return 'rank1'
    if (index === 1) return 'rank2'
    if (index === 2) return 'rank3'
    return 'normal'
  }

  return (
    <View className={styles.page}>
      <View className={styles.shiftHeader}>
        <Text className={styles.shiftTitle}>{shiftSummary.shiftName}交班汇总</Text>
        <View className={styles.shiftMeta}>
          <Text className={styles.shiftTag}>{closed ? '已交班' : '进行中'}</Text>
          <Text>操作员：{shiftSummary.operatorName}</Text>
        </View>
        <View style={{ marginTop: '16rpx', fontSize: '24rpx', opacity: 0.8 }}>
          <Text>开始时间：{formatDateTime(shiftSummary.startTime)}</Text>
          {shiftSummary.endTime && (
            <Text style={{ marginLeft: '24rpx' }}>
              结束时间：{formatDateTime(shiftSummary.endTime)}
            </Text>
          )}
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statsCard}>
          <Text className={styles.statsValue}>{shiftSummary.totalVerifyCount}</Text>
          <Text className={styles.statsLabel}>核销笔数</Text>
        </View>
        <View className={`${styles.statsCard} ${styles.success}`}>
          <Text className={styles.statsValue}>¥{shiftSummary.totalVerifyAmount.toLocaleString()}</Text>
          <Text className={styles.statsLabel}>核销金额</Text>
        </View>
        <View className={`${styles.statsCard} ${styles.warning}`}>
          <Text className={styles.statsValue}>{shiftSummary.unVerifiedAppointments}</Text>
          <Text className={styles.statsLabel}>未核销预约</Text>
        </View>
      </View>

      {shiftSummary.unVerifiedAppointments > 0 && (
        <View className={styles.infoSection}>
          <View className={styles.alertCard}>
            <Text className={styles.alertTitle}>
              <Text className={styles.alertIcon}>⚠️</Text>
              未核销预约提醒
            </Text>
            <Text className={styles.alertText}>
              当前还有 {shiftSummary.unVerifiedAppointments} 个预约未完成核销，
              请及时联系客户确认到店情况，避免影响客户体验。
            </Text>
            <View className={styles.alertBtn} onClick={handleViewUnverified}>
              <Text>查看待核销预约</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>📊</Text>
            核销类型统计
          </Text>
          <Text className={styles.sectionBadge}>{shiftSummary.verifyByType.length} 种类型</Text>
        </Text>
        <View className={styles.infoCard}>
          <View className={styles.typeList}>
            {shiftSummary.verifyByType.map((item, index) => (
              <View key={index} className={styles.typeItem}>
                <View className={`${styles.typeIcon} ${styles[getTypeClass(item.type)]}`}>
                  <Text>{getTypeIcon(item.type)}</Text>
                </View>
                <View className={styles.typeInfo}>
                  <Text className={styles.typeName}>{item.type}</Text>
                  <Text className={styles.typeCount}>{item.count} 笔</Text>
                </View>
                <Text className={styles.typeAmount}>¥{item.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>🏆</Text>
            顾问业绩排行
          </Text>
          <Text className={styles.sectionBadge}>
            {shiftSummary.consultantPerformance.length} 人
          </Text>
        </Text>
        <View className={styles.infoCard}>
          <View className={styles.performanceList}>
            {shiftSummary.consultantPerformance.map((item, index) => (
              <View key={index} className={styles.performanceItem}>
                <View className={`${styles.rankBadge} ${styles[getRankClass(index)]}`}>
                  <Text>{index + 1}</Text>
                </View>
                <View className={styles.consultantInfo}>
                  <Text className={styles.consultantName}>{item.consultantName}</Text>
                  <Text className={styles.consultantCount}>{item.count} 笔核销</Text>
                </View>
                <Text className={styles.consultantAmount}>¥{item.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>
            <Text className={styles.sectionIcon}>📈</Text>
            交班汇总
          </Text>
        </Text>
        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>交班日期</Text>
            <Text className={styles.summaryValue}>{formatDate(shiftSummary.startTime)}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>班次</Text>
            <Text className={styles.summaryValue}>{shiftSummary.shiftName}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>操作员</Text>
            <Text className={styles.summaryValue}>{shiftSummary.operatorName}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>核销笔数</Text>
            <Text className={styles.summaryValue}>{shiftSummary.totalVerifyCount} 笔</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>核销总金额</Text>
            <Text className={`${styles.summaryValue} ${styles.highlight}`}>
              ¥{shiftSummary.totalVerifyAmount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>交班状态</Text>
            <Text className={styles.infoValue} style={{ color: closed ? '#00B42A' : '#FF7D00' }}>
              {closed ? '✓ 已完成交班' : '⏳ 未交班'}
            </Text>
          </View>
          {closed && shiftSummary.endTime && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>交班时间</Text>
              <Text className={styles.summaryValue}>{formatDateTime(shiftSummary.endTime)}</Text>
            </View>
          )}
        </View>
      </View>

      <BottomActionBar
        actions={[
          {
            text: '导出报表',
            type: 'secondary',
            onClick: handleExportReport
          },
          {
            text: closed ? '已完成交班' : '确认交班',
            type: 'primary',
            onClick: !closed && !processing ? handleCloseShift : undefined,
            disabled: closed || processing
          }
        ]}
      />
    </View>
  )
}

export default ShiftSummaryPage
