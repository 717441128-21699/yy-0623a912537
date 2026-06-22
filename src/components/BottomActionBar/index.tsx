import React from 'react'
import { View, Button } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface ActionButton {
  text: string
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  onClick: () => void
  disabled?: boolean
}

interface BottomActionBarProps {
  actions: ActionButton[]
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({ actions }) => {
  const getBtnClass = (type: ActionButton['type']) => {
    const typeMap = {
      primary: styles.btnPrimary,
      secondary: styles.btnSecondary,
      success: styles.btnSuccess,
      warning: styles.btnWarning,
      danger: styles.btnDanger
    }
    return typeMap[type || 'primary']
  }

  return (
    <View className={classnames(styles.bar, actions.length === 1 ? styles.singleBtn : styles.twoBtns)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          className={classnames(
            styles.btn,
            getBtnClass(action.type),
            action.disabled && styles.btnDisabled
          )}
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.text}
        </Button>
      ))}
    </View>
  )
}

export default BottomActionBar
