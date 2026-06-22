import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useVerifyStore } from '@/store/useVerifyStore'
import StatCard from '@/components/StatCard'
import VerifyRecordCard from '@/components/VerifyRecordCard'
import { VerifyStatus } from '@/types'
import styles from './index.module.scss'

type FilterType = 'all' | VerifyStatus | 'today'

const RecordsPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('today')
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<string | null>(null)

  const { records, shiftSummary, revokeVerify } = useVerifyStore()

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = records.filter(r => r.verifyTime.startsWith(today) && r.status === 'success')
    const totalAmount = todayRecords.length * 1280
    return {
      todayCount: todayRecords.length,
      todayAmount: totalAmount,
      totalCount: records.filter(r => r.status === 'success').length,
      revokedCount: records.filter(r => r.status === 'revoked').length
    }
  }, [records])

  const filteredRecords = useMemo(() => {
    let result = [...records]

    const today = new Date().toISOString().split('T')[0]
    if (filterType === 'today') {
      result = result.filter(r => r.verifyTime.startsWith(today))
    } else if (filterType !== 'all') {
      result = result.filter(r => r.status === filterType)
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase()
      result = result.filter(r =>
        r.couponName.toLowerCase().includes(keyword) ||
        r.customerName.toLowerCase().includes(keyword) ||
        r.customerPhone.includes(keyword) ||
        r.couponCode.toLowerCase().includes(keyword)
      )
    }

    return result.sort((a, b) => b.verifyTime.localeCompare(a.verifyTime))
  }, [records, filterType, searchKeyword])

  useDidShow(() => {
    setFilterType('today')
    setSearchKeyword('')
  })

  const handleRevoke = useCallback((recordId: string) => {
    Taro.showModal({
      title: '撤回确认',
      content: '确定要撤回这条核销记录吗？撤回后卡券次数将恢复。',
      confirmText: '确认撤回',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          const success = revokeVerify(recordId)
          if (success) {
            Taro.showToast({ title: '撤回成功', icon: 'success' })
            console.log('[RecordsPage] revoke success', recordId)
          } else {
            Taro.showToast({ title: '撤回失败', icon: 'none' })
          }
          setShowRevokeConfirm(null)
        }
      }
    })
  }, [revokeVerify])

  const filters = [
    { key: 'today', label: '今日' },
    { key: 'all', label: '全部' },
    { key: 'success', label: '成功' },
    { key: 'revoked', label: '已撤回' }
  ]

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresh={() => Taro.stopPullDownRefresh()}
    >
      <View className={styles.header}>
        <Text className={styles.title}>核销记录</Text>
        <Text className={styles.subtitle}>查询所有核销记录及电子凭证</Text>
      </View>

      <View className={styles.statsRow}>
        <StatCard value={stats.todayCount} label='今日核销' color='success' />
        <StatCard value={`¥${stats.todayAmount}`} label='今日金额' color='primary' />
        <StatCard value={stats.revokedCount} label='已撤回' color='error' />
      </View>

      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>当班统计</Text>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>{shiftSummary.totalVerifyCount}</Text>
            <Text className={styles.summaryLabel}>核销笔数</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>¥{shiftSummary.totalVerifyAmount}</Text>
            <Text className={styles.summaryLabel}>核销金额</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue} style={{ color: '#FF7D00' }}>
              {shiftSummary.unVerifiedAppointments}
            </Text>
            <Text className={styles.summaryLabel}>待核销预约</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue} style={{ color: '#00B42A' }}>
              {shiftSummary.consultantPerformance.length}
            </Text>
            <Text className={styles.summaryLabel}>服务顾问</Text>
          </View>
        </View>
      </View>

      <View className={styles.searchSection}>
        <View className={styles.searchCard}>
          <View className={styles.inputWrapper}>
            <Text className={styles.inputIcon}>🔍</Text>
            <Input
              className={styles.input}
              placeholder='搜索卡券/客户/手机号'
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterCard}>
          {filters.map(filter => (
            <View
              key={filter.key}
              className={classnames(styles.filterItem, filterType === filter.key && styles.active)}
              onClick={() => setFilterType(filter.key as FilterType)}
            >
              <Text>{filter.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.recordList}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>核销记录列表</Text>
          <Text className={styles.listCount}>共 {filteredRecords.length} 条</Text>
        </View>

        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <VerifyRecordCard
              key={record.id}
              record={record}
              showRevoke={filterType === 'today'}
              onRevoke={() => handleRevoke(record.id)}
            />
          ))
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无符合条件的核销记录</Text>
          </View>
        )}

        {filteredRecords.length > 10 && (
          <View className={styles.loadMore}>
            <Text>上拉加载更多</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default RecordsPage
