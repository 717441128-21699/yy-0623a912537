import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useVerifyStore } from '@/store/useVerifyStore'
import { mockDoctors, mockRooms, mockConsultants } from '@/data/coupons'
import BottomActionBar from '@/components/BottomActionBar'
import styles from './index.module.scss'

const VerifyConfirmPage: React.FC = () => {
  const {
    currentCoupon,
    verifyFormData,
    setVerifyFormData,
    submitVerify,
    currentRecord
  } = useVerifyStore()

  const [selectedItem, setSelectedItem] = useState('')
  const [selectedPart, setSelectedPart] = useState('')
  const [verifyCount, setVerifyCount] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedConsultant, setSelectedConsultant] = useState('')
  const [notes, setNotes] = useState('')
  const [customerConfirmed, setCustomerConfirmed] = useState(false)

  const bodyParts = ['面部', '颈部', '全面部', '两颊', '额头', '下颌', '双侧腋下', '手臂', '双腿', '其他']

  const commonParts = useMemo(() => {
    if (!currentCoupon) return bodyParts
    const item = selectedItem || currentCoupon.applicableItems[0]
    if (item.includes('脱毛')) {
      return ['双侧腋下', '手臂', '双腿', '唇部', '比基尼']
    }
    if (item.includes('热玛吉') || item.includes('超声炮') || item.includes('线雕')) {
      return ['全面部', '颈部', '面部+颈部']
    }
    if (item.includes('祛斑')) {
      return ['两颊', '全面部', '额头', '下颌', '颈部']
    }
    return ['面部', '颈部', '全面部']
  }, [currentCoupon, selectedItem])

  useEffect(() => {
    if (currentCoupon) {
      setSelectedItem(currentCoupon.applicableItems[0])
      setSelectedDoctor(mockDoctors[0].name)
      setSelectedRoom(mockRooms[0].name)
      setSelectedConsultant(mockConsultants[0].name)
    }
  }, [currentCoupon])

  const maxCount = useMemo(() => {
    return currentCoupon?.remainingCount || 1
  }, [currentCoupon])

  const handleCountChange = useCallback((delta: number) => {
    setVerifyCount(prev => {
      const newCount = prev + delta
      if (newCount < 1) return 1
      if (newCount > maxCount) return maxCount
      return newCount
    })
  }, [maxCount])

  const handleSubmit = useCallback(() => {
    if (!customerConfirmed) {
      Taro.showToast({ title: '请先让客户确认信息', icon: 'none' })
      return
    }
    if (!selectedItem) {
      Taro.showToast({ title: '请选择核销项目', icon: 'none' })
      return
    }
    if (!selectedPart) {
      Taro.showToast({ title: '请选择治疗部位', icon: 'none' })
      return
    }
    if (!selectedDoctor) {
      Taro.showToast({ title: '请选择医生', icon: 'none' })
      return
    }
    if (!selectedRoom) {
      Taro.showToast({ title: '请选择治疗室', icon: 'none' })
      return
    }
    if (!selectedConsultant) {
      Taro.showToast({ title: '请选择服务顾问', icon: 'none' })
      return
    }

    Taro.showModal({
      title: '核销确认',
      content: `确认核销 ${currentCoupon?.name}，项目：${selectedItem}，部位：${selectedPart}，次数：${verifyCount}？`,
      confirmText: '确认核销',
      success: (res) => {
        if (res.confirm) {
          setVerifyFormData({
            couponId: currentCoupon?.id,
            itemName: selectedItem,
            itemPart: selectedPart,
            verifyCount,
            doctorName: selectedDoctor,
            roomNo: selectedRoom,
            consultantName: selectedConsultant,
            notes
          })

          const record = submitVerify()
          if (record) {
            console.log('[VerifyConfirmPage] verify success', record)
            Taro.redirectTo({ url: '/pages/verify-success/index' })
          } else {
            Taro.showToast({ title: '核销失败，请重试', icon: 'none' })
            console.error('[VerifyConfirmPage] verify failed')
          }
        }
      }
    })
  }, [
    customerConfirmed,
    selectedItem,
    selectedPart,
    verifyCount,
    selectedDoctor,
    selectedRoom,
    selectedConsultant,
    notes,
    currentCoupon,
    setVerifyFormData,
    submitVerify
  ])

  if (!currentCoupon) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 32rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '100rpx', color: '#C9CDD4' }}>📭</Text>
          <Text style={{ display: 'block', marginTop: '16rpx', color: '#86909C' }}>请先选择卡券</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.couponInfo}>
        <Text className={styles.couponName}>{currentCoupon.name}</Text>
        <View className={styles.couponMeta}>
          <Text className={styles.couponCode}>{currentCoupon.code}</Text>
          <Text>{currentCoupon.customerName} · {currentCoupon.customerPhone}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择核销项目</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>适用项目</Text>
            <View className={styles.selectWrapper}>
              {currentCoupon.applicableItems.map(item => (
                <View
                  key={item}
                  className={classnames(styles.selectItem, selectedItem === item && styles.active)}
                  onClick={() => setSelectedItem(item)}
                >
                  <Text>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>治疗部位</Text>
            <View className={styles.selectWrapper}>
              {commonParts.map(part => (
                <View
                  key={part}
                  className={classnames(styles.selectItem, selectedPart === part && styles.active)}
                  onClick={() => setSelectedPart(part)}
                >
                  <Text>{part}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>核销次数</Text>
            <View className={styles.countControl}>
              <View
                className={classnames(styles.countBtn, styles.minus, verifyCount <= 1 && styles.disabled)}
                onClick={() => handleCountChange(-1)}
              >
                <Text>−</Text>
              </View>
              <Text className={styles.countValue}>{verifyCount}</Text>
              <View
                className={classnames(styles.countBtn, styles.plus, verifyCount >= maxCount && styles.disabled)}
                onClick={() => handleCountChange(1)}
              >
                <Text>+</Text>
              </View>
              <Text style={{ fontSize: '24rpx', color: '#86909C' }}>
                (剩余 {maxCount} 次)
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>服务安排</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>主治医生</Text>
            <View className={styles.selectWrapper}>
              {mockDoctors.map(doctor => (
                <View
                  key={doctor.id}
                  className={classnames(styles.selectItem, selectedDoctor === doctor.name && styles.active)}
                  onClick={() => setSelectedDoctor(doctor.name)}
                >
                  <Text>{doctor.name} · {doctor.title}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>治疗室</Text>
            <View className={styles.selectWrapper}>
              {mockRooms.map(room => (
                <View
                  key={room.id}
                  className={classnames(styles.selectItem, selectedRoom === room.name && styles.active)}
                  onClick={() => setSelectedRoom(room.name)}
                >
                  <Text>{room.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>服务顾问</Text>
            <View className={styles.selectWrapper}>
              {mockConsultants.map(consultant => (
                <View
                  key={consultant.id}
                  className={classnames(styles.selectItem, selectedConsultant === consultant.name && styles.active)}
                  onClick={() => setSelectedConsultant(consultant.name)}
                >
                  <Text>{consultant.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>备注</Text>
            <View className={styles.inputWrapper}>
              <Input
                className={styles.input}
                placeholder='请输入备注信息（选填）'
                value={notes}
                onInput={(e) => setNotes(e.detail.value)}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>核销信息确认</Text>
        <View className={styles.confirmSection}>
          <Text className={styles.confirmTitle}>
            <Text className={styles.confirmIcon}>✅</Text>
            请向客户确认以下信息
          </Text>
          <View className={styles.confirmItem}>
            <Text className={styles.confirmLabel}>项目名称</Text>
            <Text className={styles.confirmValue}>{selectedItem || '-'}</Text>
          </View>
          <View className={styles.confirmItem}>
            <Text className={styles.confirmLabel}>治疗部位</Text>
            <Text className={styles.confirmValue}>{selectedPart || '-'}</Text>
          </View>
          <View className={styles.confirmItem}>
            <Text className={styles.confirmLabel}>核销次数</Text>
            <Text className={styles.confirmValue}>{verifyCount} 次</Text>
          </View>
          <View className={styles.confirmItem}>
            <Text className={styles.confirmLabel}>主治医生</Text>
            <Text className={styles.confirmValue}>{selectedDoctor || '-'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>注意事项</Text>
        <View className={styles.noticeSection}>
          <Text className={styles.noticeTitle}>
            <Text className={styles.noticeIcon}>⚠️</Text>
            治疗前请告知客户
          </Text>
          <View className={styles.noticeList}>
            <Text className={styles.noticeListItem}>1. 治疗后24小时内避免沾水</Text>
            <Text className={styles.noticeListItem}>2. 注意防晒，避免高温环境</Text>
            <Text className={styles.noticeListItem}>3. 如有不适请及时联系我们</Text>
            <Text className={styles.noticeListItem}>4. 卡券一经核销，不予退还</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>客户确认</Text>
        <View className={styles.customerConfirm}>
          <View className={styles.signatureArea}>
            <Text className={styles.signaturePlaceholder}>客户签名区域（手写签名）</Text>
          </View>
          <View className={styles.checkboxRow} onClick={() => setCustomerConfirmed(!customerConfirmed)}>
            <View className={classnames(styles.checkbox, customerConfirmed && styles.checked)}>
              {customerConfirmed && <Text className={styles.checkboxIcon}>✓</Text>}
            </View>
            <Text className={styles.checkboxLabel}>
              本人已确认以上项目、部位、次数及注意事项，同意进行核销
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>核销摘要</Text>
        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>卡券名称</Text>
            <Text className={styles.summaryValue}>{currentCoupon.name}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>核销项目</Text>
            <Text className={styles.summaryValue}>{selectedItem || '-'}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>核销次数</Text>
            <Text className={classnames(styles.summaryValue, styles.highlight)}>{verifyCount} 次</Text>
          </View>
        </View>
      </View>

      <BottomActionBar
        actions={[
          {
            text: '取消',
            type: 'secondary',
            onClick: () => Taro.navigateBack()
          },
          {
            text: '确认核销',
            type: 'success',
            onClick: handleSubmit,
            disabled: !customerConfirmed
          }
        ]}
      />
    </ScrollView>
  )
}

export default VerifyConfirmPage
