/**
 * UI动画库
 * 提供流畅的动画效果和过渡
 */

export const animations = {
  // 淡入
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  // 滑入（从上）
  slideInUp: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  // 滑入（从下）
  slideInDown: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },

  // 缩放
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // 弹跳
  bounce: {
    initial: { scale: 0.8 },
    animate: { scale: 1 },
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },

  // 脉冲
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  // 闪烁
  flash: {
    animate: {
      opacity: [1, 0, 1]
    },
    transition: {
      duration: 0.5,
      repeat: 1
    }
  }
}

/**
 * CSS动画类
 */
export const animationClasses = {
  // 淡入动画
  fadeIn: 'animate-fadeIn',

  // 滑入动画
  slideInUp: 'animate-slideInUp',
  slideInDown: 'animate-slideInDown',
  slideInLeft: 'animate-slideInLeft',
  slideInRight: 'animate-slideInRight',

  // 缩放动画
  scaleIn: 'animate-scaleIn',

  // 弹跳动画
  bounce: 'animate-bounce',

  // 脉冲动画
  pulse: 'animate-pulse',

  // 旋转动画
  spin: 'animate-spin',

  // 摇晃动画
  shake: 'animate-shake',

  // 打字机效果
  typewriter: 'animate-typewriter'
}

/**
 * 延迟工具
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 序列动画
 */
export async function sequenceAnimations(animations) {
  for (const animation of animations) {
    await animation()
  }
}

export default animations
