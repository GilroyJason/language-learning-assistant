/**
 * 游戏化系统
 * 积分、连对、成就系统
 */

export class GamificationSystem {
  constructor() {
    this.score = 0
    this.streak = 0
    this.maxStreak = 0
    this.totalCorrect = 0
    this.totalAttempts = 0
    this.achievements = []
    this.dailyGoals = {
      target: 10,
      current: 0
    }
  }

  /**
   * 计算本次得分
   * 考虑连对加成
   */
  calculateScore(isCorrect, difficulty = 1) {
    const baseScore = 100

    if (isCorrect) {
      this.streak++
      this.totalCorrect++
      this.totalAttempts++

      // 更新最大连对
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak
      }

      // 连对加成
      const streakBonus = Math.floor(this.streak / 3) * 10
      const difficultyBonus = difficulty * 20

      const totalScore = baseScore + streakBonus + difficultyBonus
      this.score += totalScore

      // 更新每日目标
      this.dailyGoals.current++

      return { score: totalScore, streak: this.streak, bonus: streakBonus }
    } else {
      this.streak = 0
      this.totalAttempts++

      return { score: 0, streak: 0, bonus: 0 }
    }
  }

  /**
   * 获取当前统计
   */
  getStats() {
    const accuracy = this.totalAttempts > 0
      ? Math.round((this.totalCorrect / this.totalAttempts) * 100)
      : 0

    return {
      score: this.score,
      streak: this.streak,
      maxStreak: this.maxStreak,
      accuracy,
      totalCorrect: this.totalCorrect,
      totalAttempts: this.totalAttempts,
      dailyProgress: Math.round((this.dailyGoals.current / this.dailyGoals.target) * 100)
    }
  }

  /**
   * 检查成就
   */
  checkAchievements() {
    const newAchievements = []
    const stats = this.getStats()

    // 连对成就
    if (this.streak >= 3 && !this.achievements.includes('streak_3')) {
      newAchievements.push({
        id: 'streak_3',
        name: '初露锋芒',
        description: '连续答对3题',
        icon: '🔥'
      })
    }

    if (this.streak >= 5 && !this.achievements.includes('streak_5')) {
      newAchievements.push({
        id: 'streak_5',
        name: '势不可挡',
        description: '连续答对5题',
        icon: '⚡'
      })
    }

    if (this.streak >= 10 && !this.achievements.includes('streak_10')) {
      newAchievements.push({
        id: 'streak_10',
        name: '德语大师',
        description: '连续答对10题',
        icon: '👑'
      })
    }

    // 分数成就
    if (this.score >= 1000 && !this.achievements.includes('score_1000')) {
      newAchievements.push({
        id: 'score_1000',
        name: '千分俱乐部',
        description: '获得1000分',
        icon: '💎'
      })
    }

    // 准确率成就
    if (stats.accuracy >= 90 && this.totalAttempts >= 10 && !this.achievements.includes('accuracy_90')) {
      newAchievements.push({
        id: 'accuracy_90',
        name: '精准射手',
        description: '准确率达到90%',
        icon: '🎯'
      })
    }

    // 添加新成就
    newAchievements.forEach(a => {
      if (!this.achievements.includes(a.id)) {
        this.achievements.push(a.id)
      }
    })

    return newAchievements
  }

  /**
   * 重置每日目标
   */
  resetDailyGoals() {
    this.dailyGoals.current = 0
  }

  /**
   * 获取连对消息
   */
  getStreakMessage() {
    if (this.streak >= 10) return { message: '太神了！', emoji: '👑' }
    if (this.streak >= 7) return { message: '保持住！', emoji: '🔥' }
    if (this.streak >= 5) return { message: '势不可挡！', emoji: '⚡' }
    if (this.streak >= 3) return { message: '不错哦！', emoji: '✨' }
    return { message: '', emoji: '' }
  }

  /**
   * 保存进度
   */
  saveProgress() {
    const data = {
      score: this.score,
      maxStreak: this.maxStreak,
      totalCorrect: this.totalCorrect,
      totalAttempts: this.totalAttempts,
      achievements: this.achievements,
      dailyGoals: this.dailyGoals,
      lastUpdated: new Date().toISOString()
    }

    localStorage.setItem('germanLearningGamification', JSON.stringify(data))
  }

  /**
   * 加载进度
   */
  loadProgress() {
    const saved = localStorage.getItem('germanLearningGamification')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        this.score = data.score || 0
        this.maxStreak = data.maxStreak || 0
        this.totalCorrect = data.totalCorrect || 0
        this.totalAttempts = data.totalAttempts || 0
        this.achievements = data.achievements || []
        this.dailyGoals = data.dailyGoals || { target: 10, current: 0 }

        // 如果是新的一天，重置每日目标
        const lastDate = new Date(data.lastUpdated).toDateString()
        const today = new Date().toDateString()
        if (lastDate !== today) {
          this.resetDailyGoals()
        }
      } catch (error) {
        console.error('加载游戏化数据失败:', error)
      }
    }
  }
}

// 导出单例
export const gamification = new GamificationSystem()
gamification.loadProgress()
