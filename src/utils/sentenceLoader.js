/**
 * 外部句子库加载器
 * 支持从JSON文件、API、GitHub等来源加载句子
 */

export class SentenceLoader {
  constructor() {
    this.cache = new Map()
    this.sources = []
  }

  /**
   * 从本地JSON文件加载句子
   */
  async loadFromJSON(filePath) {
    try {
      const response = await fetch(filePath)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()

      // 验证数据格式
      if (!Array.isArray(data)) {
        throw new Error('数据必须是数组格式')
      }

      // 验证每个句子的结构
      const validated = data.filter(sentence => {
        return sentence.german && sentence.chinese && sentence.level
      })

      console.log(`✅ 从JSON加载了 ${validated.length} 个句子`)
      return validated
    } catch (error) {
      console.error('❌ 加载JSON失败:', error)
      return []
    }
  }

  /**
   * 从API加载每日句子
   */
  async loadFromAPI(apiUrl, apiKey = null) {
    try {
      const headers = {}
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch(apiUrl, { headers })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      console.log(`✅ 从API加载了 ${data.length || 0} 个句子`)
      return data || []
    } catch (error) {
      console.error('❌ 加载API失败:', error)
      return []
    }
  }

  /**
   * 从GitHub仓库加载句子
   * 例如：从GitHub raw文件加载JSON
   */
  async loadFromGitHub(rawUrl) {
    try {
      const response = await fetch(rawUrl)
      if (!response.ok) throw new Error(`GitHub ${response.status}`)

      const data = await response.json()
      console.log(`✅ 从GitHub加载了 ${data.length || 0} 个句子`)
      return data || []
    } catch (error) {
      console.error('❌ 加载GitHub失败:', error)
      return []
    }
  }

  /**
   * 混合多个来源的句子
   */
  async loadFromMultiple(sources) {
    const allSentences = []

    for (const source of sources) {
      let sentences = []

      switch (source.type) {
        case 'json':
          sentences = await this.loadFromJSON(source.url)
          break
        case 'api':
          sentences = await this.loadFromAPI(source.url, source.apiKey)
          break
        case 'github':
          sentences = await this.loadFromGitHub(source.url)
          break
      }

      allSentences.push(...sentences)
    }

    // 去重
    const unique = this.deduplicate(allSentences)
    console.log(`✅ 总共加载了 ${unique.length} 个句子（去重后）`)

    return unique
  }

  /**
   * 去重句子（基于德语文本）
   */
  deduplicate(sentences) {
    const seen = new Set()
    return sentences.filter(s => {
      const key = `${s.german}-${s.level}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * 按难度排序
   */
  sortByDifficulty(sentences) {
    const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 }
    return [...sentences].sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
  }

  /**
   * 按日期排序（如果有日期字段）
   */
  sortByDate(sentences) {
    return [...sentences].sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date) - new Date(a.date)
    })
  }
}

export default SentenceLoader
