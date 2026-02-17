/**
 * 学习进度追踪系统
 * 参考GitHub德语学习项目最佳实践
 * 功能：
 * - 学习进度保存
 * - 错误记录
 * - 学习统计
 * - 上次学习位置
 */

export class ProgressTracker {
  constructor() {
    this.storageKey = 'germanLearningProgress_v2'
    this.progress = this.loadProgress()
  }

  /**
   * 加载进度
   */
  loadProgress() {
    const saved = localStorage.getItem(this.storageKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('加载进度失败:', error)
        return this.getDefaultProgress()
      }
    }
    return this.getDefaultProgress()
  }

  /**
   * 默认进度结构
   */
  getDefaultProgress() {
    return {
      // 学习统计
      stats: {
        totalPracticed: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalStudyTime: 0, // 秒
        lastStudyDate: null,
        currentStreak: 0, // 连续学习天数
        longestStreak: 0
      },

      // 每个水平的进度
      levelProgress: {
        A1: { mastered: 0, total: 0, lastSentenceIndex: 0 },
        A2: { mastered: 0, total: 0, lastSentenceIndex: 0 },
        B1: { mastered: 0, total: 0, lastSentenceIndex: 0 },
        B2: { mastered: 0, total: 0, lastSentenceIndex: 0 },
        C1: { mastered: 0, total: 0, lastSentenceIndex: 0 },
        C2: { mastered: 0, total: 0, lastSentenceIndex: 0 }
      },

      // 错误记录（按句子）
      errors: {
        // sentenceId: {
        //   german: '...',
        //   chinese: '...',
        //   errorCount: 3,
        //   lastError: '2026-02-16',
        //   commonMistakes: ['ich', 'the']
        // }
      },

      // 学习历史
      history: [],

      // 上次学习位置
      lastSession: {
        level: null,
        mode: null, // 'traditional' or 'builder'
        sentenceIndex: 0,
        timestamp: null
      },

      // 掌握的句子（去重）
      masteredSentences: [], // [sentenceId]

      // 需要复习的句子（间隔重复算法）
      reviewQueue: [], // [{sentenceId, dueDate}]

      // 设置
      settings: {
        dailyGoal: 10, // 每日目标（句子数）
        reminderTime: '09:00',
        autoPlay: true,
        showHints: true
      }
    }
  }

  /**
   * 保存进度
   */
  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.progress))
      return true
    } catch (error) {
      console.error('保存进度失败:', error)
      return false
    }
  }

  /**
   * 记录练习结果
   */
  recordPractice(sentenceId, sentence, isCorrect, mode = 'traditional') {
    const today = new Date().toDateString()

    // 更新统计
    this.progress.stats.totalPracticed++
    if (isCorrect) {
      this.progress.stats.correctAnswers++
    } else {
      this.progress.stats.incorrectAnswers++
      this.recordError(sentenceId, sentence)
    }

    // 更新学习历史
    this.progress.history.push({
      date: new Date().toISOString(),
      sentenceId,
      german: sentence.german,
      chinese: sentence.chinese,
      isCorrect,
      mode,
      level: sentence.level
    })

    // 只保留最近30天的历史
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    this.progress.history = this.progress.history.filter(
      h => new Date(h.date).getTime() > thirtyDaysAgo
    )

    // 更新连续学习天数
    this.updateStreak(today)

    this.saveProgress()
  }

  /**
   * 记录错误
   */
  recordError(sentenceId, sentence) {
    if (!this.progress.errors[sentenceId]) {
      this.progress.errors[sentenceId] = {
        german: sentence.german,
        chinese: sentence.chinese,
        level: sentence.level,
        errorCount: 0,
        lastError: null,
        commonMistakes: [],
        firstError: new Date().toISOString()
      }
    }

    this.progress.errors[sentenceId].errorCount++
    this.progress.errors[sentenceId].lastError = new Date().toISOString()

    // 加入复习队列（使用间隔重复算法）
    this.scheduleReview(sentenceId, this.progress.errors[sentenceId].errorCount)
  }

  /**
   * 安排复习（间隔重复算法 - SM-2简化版）
   */
  scheduleReview(sentenceId, errorCount) {
    // 根据错误次数计算复习间隔
    const intervals = [1, 3, 7, 14, 30] // 天数
    const interval = intervals[Math.min(errorCount - 1, intervals.length - 1)]

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + interval)

    // 移除旧的复习计划
    this.progress.reviewQueue = this.progress.reviewQueue.filter(r => r.sentenceId !== sentenceId)

    // 添加新的复习计划
    this.progress.reviewQueue.push({
      sentenceId,
      dueDate: dueDate.toISOString()
    })

    // 按到期时间排序
    this.progress.reviewQueue.sort((a, b) =>
      new Date(a.dueDate) - new Date(b.dueDate)
    )
  }

  /**
   * 获取需要复习的句子
   */
  getDueReviews() {
    const now = new Date()
    return this.progress.reviewQueue.filter(r => new Date(r.dueDate) <= now)
  }

  /**
   * 标记句子已掌握
   */
  markAsMastered(sentenceId) {
    if (!this.progress.masteredSentences.includes(sentenceId)) {
      this.progress.masteredSentences.push(sentenceId)
    }
    this.saveProgress()
  }

  /**
   * 更新连续学习天数
   */
  updateStreak(today) {
    const lastDate = this.progress.stats.lastStudyDate

    if (!lastDate) {
      // 第一次学习
      this.progress.stats.currentStreak = 1
      this.progress.stats.longestStreak = 1
    } else if (lastDate === today) {
      // 今天已经学习过，不更新
      return
    } else {
      const last = new Date(lastDate)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (last.toDateString() === yesterday.toDateString()) {
        // 昨天学习过，连续
        this.progress.stats.currentStreak++
        this.progress.stats.longestStreak = Math.max(
          this.progress.stats.longestStreak,
          this.progress.stats.currentStreak
        )
      } else {
        // 中断了，重置
        this.progress.stats.currentStreak = 1
      }
    }

    this.progress.stats.lastStudyDate = today
  }

  /**
   * 保存学习位置
   */
  savePosition(level, mode, sentenceIndex) {
    this.progress.lastSession = {
      level,
      mode,
      sentenceIndex,
      timestamp: new Date().toISOString()
    }
    this.saveProgress()
  }

  /**
   * 获取上次学习位置
   */
  getLastPosition() {
    return this.progress.lastSession
  }

  /**
   * 更新水平进度
   */
  updateLevelProgress(level, mastered, total) {
    if (!this.progress.levelProgress[level]) {
      this.progress.levelProgress[level] = { mastered: 0, total: 0, lastSentenceIndex: 0 }
    }
    this.progress.levelProgress[level].mastered = mastered
    this.progress.levelProgress[level].total = total
    this.saveProgress()
  }

  /**
   * 更新学习时间
   */
  addStudyTime(seconds) {
    this.progress.stats.totalStudyTime += seconds
    this.saveProgress()
  }

  /**
   * 获取准确率
   */
  getAccuracy() {
    if (this.progress.stats.totalPracticed === 0) return 0
    return Math.round(
      (this.progress.stats.correctAnswers / this.progress.stats.totalPracticed) * 100
    )
  }

  /**
   * 获取统计摘要
   */
  getSummary() {
    return {
      accuracy: this.getAccuracy(),
      totalPracticed: this.progress.stats.totalPracticed,
      correctAnswers: this.progress.stats.correctAnswers,
      incorrectAnswers: this.progress.stats.incorrectAnswers,
      totalStudyTime: this.progress.stats.totalStudyTime,
      currentStreak: this.progress.stats.currentStreak,
      longestStreak: this.progress.stats.longestStreak,
      masteredSentences: this.progress.masteredSentences.length,
      pendingReviews: this.getDueReviews().length,
      lastStudyDate: this.progress.stats.lastStudyDate
    }
  }

  /**
   * 获取错误最多的句子
   */
  getTopErrors(limit = 10) {
    return Object.values(this.progress.errors)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit)
  }

  /**
   * 获取学习热力图数据（类似GitHub）
   */
  getActivityMap() {
    const activity = {}
    const days = 365 // 显示一年

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toDateString()
      activity[key] = 0
    }

    // 填充实际活动
    this.progress.history.forEach(h => {
      const date = new Date(h.date).toDateString()
      if (activity.hasOwnProperty(date)) {
        activity[date]++
      }
    })

    return activity
  }

  /**
   * 重置进度（慎用）
   */
  resetProgress() {
    if (confirm('确定要重置所有学习进度吗？此操作不可恢复！')) {
      this.progress = this.getDefaultProgress()
      this.saveProgress()
      return true
    }
    return false
  }

  /**
   * 导出进度（JSON）
   */
  exportProgress() {
    const dataStr = JSON.stringify(this.progress, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `german-learning-progress-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 导入进度
   */
  importProgress(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      this.progress = { ...this.getDefaultProgress(), ...data }
      this.saveProgress()
      return true
    } catch (error) {
      console.error('导入进度失败:', error)
      return false
    }
  }
}

// 导出单例
export const progressTracker = new ProgressTracker()
