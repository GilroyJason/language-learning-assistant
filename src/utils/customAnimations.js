/**
 * Tailwind动画扩展配置
 * 在已有的tailwind.config.js基础上添加更多动画
 */

export const customAnimations = {
  // 淡入
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' }
  },

  // 滑入动画
  slideInUp: {
    '0%': { transform: 'translateY(20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  },

  slideInDown: {
    '0%': { transform: 'translateY(-20px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  },

  slideInLeft: {
    '0%': { transform: 'translateX(-20px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  },

  slideInRight: {
    '0%': { transform: 'translateX(20px)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  },

  // 缩放
  scaleIn: {
    '0%': { transform: 'scale(0.9)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' }
  },

  // 摇晃
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-5px)' },
    '75%': { transform: 'translateX(5px)' }
  },

  // 弹跳
  bounceSoft: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-10px)' }
  },

  // 光辉脉冲
  glowPulse: {
    '0%, 100%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
    '50%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' }
  },

  // 边框动画
  borderPulse: {
    '0%, 100%': { borderColor: 'rgb(139, 92, 246)' },
    '50%': { borderColor: 'rgb(168, 85, 247)' }
  },

  // 渐变背景动画
  gradientShift: {
    '0%, 100%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' }
  }
}
