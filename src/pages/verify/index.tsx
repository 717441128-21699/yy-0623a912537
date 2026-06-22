import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import { useVerifyStore } from '@/store/useVerifyStore'
import StatCard from '@/components/StatCard'
import CouponCard from '@/components/CouponCard'
import { Coupon } from '@/types'
import styles from './index.module.scss'

type SearchType = 'code' | 'phone'

const VerifyPage: React.FC = () => {
  const [searchType, setSearchType] = useState<SearchType>('code')
  const [searchValue, setSearchValue] = useState('')
  const [searchedCoupons, setSearchedCoupons] = useState<Coupon[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const {
    coupons,
    exceptionInfo,
    setCurrentCoupon,
    scanCoupon,
    searchCouponByPhone,
    getTodayStats,
    setExceptionInfo
  } = useVerifyStore()

  const stats = getTodayStats()
  const availableCoupons = coupons.filter(c => c.status === 'available').slice(0, 3)

  useDidShow(() => {
    setHasSearched(false)
    setSearchedCoupons([])
    setSearchValue('')
  })

  const handleScan = useCallback(async () => {
    try {
      const res = await Taro.scanCode({
        scanType: ['qrCode', 'barCode'],
        success: (res) => {
          console.log('[VerifyPage] scan result', res.result)
          const coupon = scanCoupon(res.result)
          if (coupon) {
            setCurrentCoupon(coupon)
            Taro.navigateTo({ url: '/pages/verify-confirm/index' })
          } else if (exceptionInfo) {
            Taro.navigateTo({ url: '/pages/exception/index' })
          }
        }
      })
      console.log('[VerifyPage] scanCode result', res)
    } catch (error) {
      console.error('[VerifyPage] scan error', error)
      Taro.showToast({ title: '扫码失败，请重试', icon: 'none' })
    }
  }, [scanCoupon, setCurrentCoupon, exceptionInfo])

  const handleSearch = useCallback(() => {
    if (!searchValue.trim()) {
      Taro.showToast({ title: '请输入查询内容', icon: 'none' })
      return
    }

    if (searchType === 'code') {
      const code = searchValue.trim().toUpperCase()
      const coupon = scanCoupon(code)
      if (coupon) {
        setCurrentCoupon(coupon)
        Taro.navigateTo({ url: '/pages/verify-confirm/index' })
      } else {
        setTimeout(() => {
          const { exceptionInfo } = useVerifyStore.getState()
          if (exceptionInfo) {
            Taro.navigateTo({ url: '/pages/exception/index' })
          } else {
            setExceptionInfo({
              type: 'not_found',
              title: '未找到卡券',
              reason: `未找到编号为 "${code}" 的卡券，请确认卡券编号是否正确`,
              suggestion: '请检查卡券编号或尝试通过手机号查询',
              canReschedule: false,
              canRevoke: false
            })
            Taro.navigateTo({ url: '/pages/exception/index' })
          }
        }, 50)
      }
    } else {
      const phone = searchValue.trim()
      const results = searchCouponByPhone(phone)
      if (results.length > 0) {
        setSearchedCoupons(results)
        setHasSearched(true)
      } else {
        setExceptionInfo({
          type: 'not_found',
          title: '未找到卡券',
          reason: `未找到手机号 ${phone.length === 4 ? '后四位' : ''}为 "${phone}" 的可用卡券`,
          suggestion: '请检查手机号是否正确，或联系客户确认',
          canReschedule: false,
          canRevoke: false
        })
        Taro.navigateTo({ url: '/pages/exception/index' })
      }
    }
  }, [searchType, searchValue, scanCoupon, searchCouponByPhone, setCurrentCoupon, setExceptionInfo])

  const handleVerify = useCallback((coupon: Coupon) => {
    setCurrentCoupon(coupon)
    Taro.navigateTo({ url: '/pages/verify-confirm/index' })
  }, [setCurrentCoupon])

  const handleViewDetail = useCallback((coupon: Coupon) => {
    Taro.navigateTo({ url: `/pages/coupon-detail/index?id=${coupon.id}` })
  }, [])

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'today':
        Taro.switchTab({ url: '/pages/appointment/index' })
        break
      case 'exception':
        Taro.navigateTo({ url: '/pages/exception/index' })
        break
      case 'records':
        Taro.switchTab({ url: '/pages/records/index' })
        break
      case 'shift':
        Taro.navigateTo({ url: '/pages/shift-summary/index' })
        break
    }
  }, [])

  const displayCoupons = hasSearched ? searchedCoupons : availableCoupons

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresh={() => {
        setHasSearched(false)
        setSearchedCoupons([])
        setSearchValue('')
        Taro.stopPullDownRefresh()
      }}
    >
      <View className={styles.header}>
        <Text className={styles.title}>卡券核销</Text>
        <Text className={styles.subtitle}>扫码或输入信息快速核验客户卡券</Text>
      </View>

      <View className={styles.statsRow}>
        <StatCard value={stats.total} label='今日总核销' color='primary' />
        <StatCard value={stats.success} label='成功核销' color='success' />
        <StatCard value={stats.exception} label='异常处理' color='error' />
      </View>

      <View className={styles.searchSection}>
        <View className={styles.searchCard}>
          <View className={styles.searchTabs}>
            <View
              className={classnames(styles.tabItem, searchType === 'code' && styles.active)}
              onClick={() => { setSearchType('code'); setHasSearched(false); setSearchedCoupons([]) }}
            >
              <Text>卡券编号</Text>
            </View>
            <View
              className={classnames(styles.tabItem, searchType === 'phone' && styles.active)}
              onClick={() => { setSearchType('phone'); setHasSearched(false); setSearchedCoupons([]) }}
            >
              <Text>手机号码</Text>
            </View>
          </View>

          <View className={styles.inputRow}>
            <View className={styles.inputWrapper}>
              <Text className={styles.inputIcon}>🔍</Text>
              <Input
                className={styles.input}
                placeholder={searchType === 'code' ? '请输入或扫描卡券编号' : '请输入客户手机号'}
                value={searchValue}
                onInput={(e) => setSearchValue(e.detail.value)}
                onConfirm={handleSearch}
              />
            </View>
            <Button className={styles.searchBtn} onClick={handleSearch}>
              查询
            </Button>
          </View>

          <Button className={styles.scanBtn} onClick={handleScan}>
            <Text className={styles.scanBtnIcon}>📷</Text>
            扫码核销
          </Button>
        </View>
      </View>

      <View className={styles.quickActions}>
        <Text className={styles.sectionTitle}>快捷操作</Text>
        <View className={styles.actionGrid}>
          <View className={styles.actionItem} onClick={() => handleQuickAction('today')}>
            <View className={classnames(styles.actionIcon, styles.blue)}>📅</View>
            <Text className={styles.actionText}>今日预约</Text>
            <Text className={styles.actionDesc}>查看待核销客户</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('exception')}>
            <View className={classnames(styles.actionIcon, styles.red)}>⚠️</View>
            <Text className={styles.actionText}>异常处理</Text>
            <Text className={styles.actionDesc}>过期/冻结/撤回</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('records')}>
            <View className={classnames(styles.actionIcon, styles.green)}>📋</View>
            <Text className={styles.actionText}>核销记录</Text>
            <Text className={styles.actionDesc}>历史记录查询</Text>
          </View>
          <View className={styles.actionItem} onClick={() => handleQuickAction('shift')}>
            <View className={classnames(styles.actionIcon, styles.orange)}>📊</View>
            <Text className={styles.actionText}>交班汇总</Text>
            <Text className={styles.actionDesc}>当班统计交接</Text>
          </View>
        </View>
      </View>

      <View className={styles.couponList}>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>
            {hasSearched ? '查询结果' : '最近可用卡券'}
          </Text>
          <Text className={styles.listCount}>共 {displayCoupons.length} 张</Text>
        </View>

        {displayCoupons.length > 0 ? (
          displayCoupons.map(coupon => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onVerify={() => handleVerify(coupon)}
              onViewDetail={() => handleViewDetail(coupon)}
            />
          ))
        ) : hasSearched ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>未找到相关卡券</Text>
          </View>
        ) : (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>暂无可用卡券</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default VerifyPage
