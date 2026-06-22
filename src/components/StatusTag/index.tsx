import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatusTagProps {
  text: string
  type: 'available' | 'used' | 'expired' | 'frozen' |
        'pending' | 'arrived' | 'completed' | 'cancelled' | 'rescheduled' |
        'success' | 'revoked' | 'experience' | 'course' | 'gift'
}

const StatusTag: React.FC<StatusTagProps> = ({ text, type }) => {
  return (
    <View className={classnames(styles.tag, styles[type])}>
      <Text>{text}</Text>
    </View>
  )
}

export default StatusTag
