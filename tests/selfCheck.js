/**
 * 自我检错脚本
 * Ralph Loop - 自动化质量检查
 */

const tests = {
  // 测试1：检查TTS引擎
  testTTSEngine: () => {
    console.log('🧪 测试1: TTS引擎')
    try {
      const { germanTTS } = require('../src/utils/ttsEngine')
      const voices = germanTTS.getAvailableVoices()
      console.log(`✅ 找到 ${voices.length} 个德语语音`)
      return voices.length > 0
    } catch (error) {
      console.error('❌ TTS引擎测试失败:', error.message)
      return false
    }
  },

  // 测试2：检查数据结构
  testDataStructure: () => {
    console.log('🧪 测试2: 数据结构')
    try {
      const { germanSentences } = require('../src/data/germanSentences')
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

      for (const level of levels) {
        const sentences = germanSentences.filter(s => s.level === level)
        if (sentences.length === 0) {
          console.error(`❌ ${level} 级别没有句子`)
          return false
        }
        console.log(`✅ ${level}: ${sentences.length} 句`)
      }
      return true
    } catch (error) {
      console.error('❌ 数据结构测试失败:', error.message)
      return false
    }
  },

  // 测���3：检查组件依赖
  testComponentDependencies: () => {
    console.log('🧪 测试3: 组件依赖')
    const fs = require('fs')
    const path = require('path')

    try {
      const components = [
        'SentenceBuilder.jsx',
        'SentenceBuilderEnhanced.jsx'
      ]

      for (const component of components) {
        const filePath = path.join(__dirname, '../src/components', component)
        if (!fs.existsSync(filePath)) {
          console.error(`❌ 组件不存在: ${component}`)
          return false
        }
        console.log(`✅ 组件存在: ${component}`)
      }
      return true
    } catch (error) {
      console.error('❌ 组件依赖测试失败:', error.message)
      return false
    }
  },

  // 测试4：检查配置文件
  testConfigFiles: () => {
    console.log('🧪 测试4: 配置文件')
    const fs = require('fs')
    const path = require('path')

    try {
      const configs = [
        'package.json',
        'vite.config.js',
        'tailwind.config.js'
      ]

      for (const config of configs) {
        const filePath = path.join(__dirname, '../', config)
        if (!fs.existsSync(filePath)) {
          console.error(`❌ 配置文件不存在: ${config}`)
          return false
        }
        console.log(`✅ 配置文件存在: ${config}`)
      }
      return true
    } catch (error) {
      console.error('❌ 配置文件测试失败:', error.message)
      return false
    }
  },

  // 测试5：检查动画系统
  testAnimationSystem: () => {
    console.log('🧪 测试5: 动画系统')
    const fs = require('fs')
    const path = require('path')

    try {
      const animationFiles = [
        'animations.js',
        'customAnimations.js'
      ]

      for (const file of animationFiles) {
        const filePath = path.join(__dirname, '../src/utils', file)
        if (!fs.existsSync(filePath)) {
          console.error(`❌ 动画文件不存在: ${file}`)
          return false
        }
        console.log(`✅ 动画文件存在: ${file}`)
      }
      return true
    } catch (error) {
      console.error('❌ 动画系统测试失败:', error.message)
      return false
    }
  }
}

// 质量评分
function calculateQualityScore(testResults) {
  const passed = testResults.filter(r => r.passed).length
  const total = testResults.length
  return Math.round((passed / total) * 100)
}

// 运行所有测试
function runAllTests() {
  console.log('\n🚀 Ralph Loop - 自我检错开始\n')
  console.log('=' .repeat(50))

  const results = []

  for (const [testName, testFunc] of Object.entries(tests)) {
    try {
      const passed = testFunc()
      results.push({ name: testName, passed })
      console.log(passed ? '✅ 通过' : '❌ 失败')
    } catch (error) {
      results.push({ name: testName, passed: false, error: error.message })
      console.log('❌ 失败:', error.message)
    }
    console.log('-'.repeat(50))
  }

  const score = calculateQualityScore(results)
  console.log('\n📊 质量评分:', score, '/ 100')

  if (score >= 75) {
    console.log('✅ 质量达标！可以继续优化')
  } else {
    console.log('⚠️  质量未达标，需要修复问题')
  }

  console.log('\n测试详情:')
  results.forEach(r => {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.name}`)
    if (r.error) console.log(`     错误: ${r.error}`)
  })

  return { score, results }
}

// 如果直接运行此脚本
runAllTests()

export { runAllTests, tests, calculateQualityScore }
