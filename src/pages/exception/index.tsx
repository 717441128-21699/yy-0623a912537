import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useVerifyStore } from '@/store/useVerifyStore'
import { formatDate } from '@/utils'
import BottomActionBar from '@/components/BottomActionBar'
import styles from './index.module.scss'

const ExceptionPage: React.FC = () => {
  const { exceptionInfo, currentCoupon, setExceptionInfo, rescheduleAppointment } = useVerifyStore()
  const [remark, setRemark] = useState('')
  const [processing, setProcessing] = useState(false)

  const exceptionIcon = useMemo(() => {
    const iconMap: Record<string, string> = {
      expired: '⏰',
      frozen: '🔒',
      used: '✅',
      not_found: '❓'
    }
    return iconMap[exceptionInfo?.type || 'not_found'] || '❓'
  }, [exceptionInfo])

  const handleReschedule = useCallback(() => {
    Taro.showModal({
      title: '改约确认',
      content: '确定要为客户改约吗？改约后将保留卡券，客户可下次再来使用。',
      confirmText: '确认改约',
      success: (res) => {
        if (res.confirm) {
          setProcessing(true)
          setTimeout(() => {
            const success = rescheduleAppointment(currentCoupon?.id || '')
            setProcessing(false)
            if (success) {
              Taro.showToast({ title: '改约成功', icon: 'success' })
              setTimeout(() => {
                setExceptionInfo(null)
                Taro.switchTab({ url: '/pages/appointment/index' })
              }, 1500)
            } else {
              Taro.showToast({ title: '改约失败，请重试', icon: 'none' })
            }
          }, 1000)
        }
      }
    })
  }, [currentCoupon, rescheduleAppointment, setExceptionInfo])

  const handleContactAdmin = useCallback(() => {
    Taro.showModal({
      title: '联系管理员',
      content: '是否拨打管理员电话？',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          Taro.makePhoneCall({
            phoneNumber: '400-123-4567',
            fail: () => {
              Taro.showToast({ title: '拨号失败', icon: 'none' })
            }
          })
        }
      }
    })
  }, [])

  const handleSubmitIssue = useCallback(() => {
    if (!remark.trim()) {
      Taro.showToast({ title: '请填写问题说明', icon: 'none' })
      return
    }
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      Taro.showToast({ title: '问题已提交', icon: 'success' })
      setTimeout(() => {
        setExceptionInfo(null)
        Taro.switchTab({ url: '/pages/verify/index' })
      }, 1500)
    }, 1000)
  }, [remark, setExceptionInfo])

  const handleGoBack = useCallback(() => {
    setExceptionInfo(null)
    Taro.switchTab({ url: '/pages/verify/index' })
  }, [setExceptionInfo])

  if (!exceptionInfo) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '100rpx', color: '#C9CDD4' }}>📭</Text>
          <Text style={{ display: 'block', marginTop: '16rpx', color: '#86909C' }}>暂无异常信息</Text>
        </View>
        <BottomActionBar
          actions={[
            {
              text: '返回首页',
              type: 'primary',
              onClick: handleGoBack
            }
          ]}
        />
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <View className={`${styles.exceptionHeader} ${styles[exceptionInfo.type]}`}>
        <View className={styles.exceptionIcon}>{exceptionIcon}</View>
        <Text className={styles.exceptionTitle}>{exceptionInfo.title}</Text>
        <Text className={styles.exceptionSubtitle}>请按以下指引处理</Text>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.infoCard}>
          {currentCoupon ? (
            <>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>卡券编号</Text>
                <Text className={styles.infoValue}>{currentCoupon.code}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>卡券名称</Text>
                <Text className={styles.infoValue}>{currentCoupon.name}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>客户姓名</Text>
                <Text className={styles.infoValue}>{currentCoupon.customerName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>卡券状态</Text>
                <View>
                  <Text className={`${styles.statusTag} ${styles[exceptionInfo.type]}`}>
                    {currentCoupon.statusText}
                  </Text>
                </View>
              </View>
              {exceptionInfo.type === 'expired' && (
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>有效期至</Text>
                  <Text className={styles.infoValue}>{formatDate(currentCoupon.validTo)}</Text>
                </View>
              )}
              {exceptionInfo.type === 'frozen' && currentCoupon.freezeReason && (
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>冻结原因</Text>
                  <Text className={styles.infoValue}>{currentCoupon.freezeReason}</Text>
                </View>
              )}
              {exceptionInfo.type === 'used' && (
                <>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>总次数</Text>
                    <Text className={styles.infoValue}>{currentCoupon.totalCount} 次</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>已使用</Text>
                    <Text className={styles.infoValue}>{currentCoupon.usedCount} 次</Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>提示</Text>
              <Text className={styles.infoValue}>未找到对应卡券信息</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          异常详情
        </Text>
        <View className={styles.reasonCard}>
          <Text className={styles.reasonTitle}>
            <Text className={styles.reasonIcon}>⚠️</Text>
            异常原因
          </Text>
          <Text className={styles.reasonText}>{exceptionInfo.reason}</Text>
        </View>
        <View className={styles.suggestionCard}>
          <Text className={styles.suggestionTitle}>
            <Text className={styles.suggestionIcon}>💡</Text>
            处理建议
          </Text>
          <Text className={styles.suggestionText}>{exceptionInfo.suggestion}</Text>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          问题说明（选填）
        </Text>
        <View className={styles.actionCard}>
          <View className={styles.remarkInputWrapper}>
            <Textarea
              className={styles.remarkInput}
              placeholder='请输入异常情况说明，如客户特殊要求、需协调事项等...'
              value={remark}
              onInput={(e) => setRemark(e.detail.value)}
              maxlength={500}
            />
          </View>
        </View>
      </View>

      <View className={styles.actionButtons}>
        {exceptionInfo.canReschedule && (
          <View
            className={`${styles.actionBtn} ${styles.warning}`}
            onClick={!processing ? handleReschedule : undefined}
          >
            <Text className={styles.actionBtnIcon}>📅</Text>
            <Text>{processing ? '处理中...' : '改约保留'}</Text>
          </View>
        )}

        {exceptionInfo.type === 'frozen' && (
          <View
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={!processing ? handleContactAdmin : undefined}
          >
            <Text className={styles.actionBtnIcon}>📞</Text>
            <Text>联系管理员解冻</Text>
          </View>
        )}

        {exceptionInfo.type === 'not_found' && (
          <View
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={!processing ? handleSubmitIssue : undefined}
          >
            <Text className={styles.actionBtnIcon}>📨</Text>
            <Text>{processing ? '提交中...' : '提交问题反馈'}</Text>
          </View>
        )}

        <View
          className={`${styles.actionBtn} ${styles.secondary}`}
          onClick={!processing ? handleGoBack : undefined}
        >
          <Text className={styles.actionBtnIcon}>←</Text>
          <Text>返回核销首页</Text>
        </View>
      </View>

      <BottomActionBar
        actions={[
          {
            text: '返回首页',
            type: 'primary',
            onClick: handleGoBack
          }
        ]}
      />
    </View>
  )
}

export default ExceptionPage
