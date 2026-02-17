/**
 * 德语TTS语音引擎
 * 优化版：支持多种语音、参数调整、语音选择
 */

class GermanTTSEngine {
  constructor() {
    this.synth = window.speechSynthesis
    this.voices = []
    this.preferredVoice = null
    this.init()
  }

  init() {
    // 加载语音列表
    const loadVoices = () => {
      this.voices = this.synth.getVoices()
      // 优先选择德语语音
      this.preferredVoice = this.voices.find(voice =>
        voice.lang.startsWith('de')
      ) || this.voices[0]
    }

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices
    }

    loadVoices()
  }

  /**
   * 智能语音选择
   * 根据内容选择最合适的德语语音
   */
  selectBestVoice() {
    const germanVoices = this.voices.filter(voice =>
      voice.lang.startsWith('de')
    )

    if (germanVoices.length === 0) {
      console.warn('未找到德语语音，使用默认语音')
      return this.voices[0]
    }

    // 优先级：Google德语 > Microsoft德语 > 其他德语
    const priority = ['Google', 'Microsoft']

    for (const provider of priority) {
      const voice = germanVoices.find(v => v.name.includes(provider))
      if (voice) return voice
    }

    // 返回第一个德语语音
    return germanVoices[0]
  }

  /**
   * 播放德语句子（优化版）
   * @param {string} text - 要播放的德语文本
   * @param {Object} options - 播放选项
   */
  speak(text, options = {}) {
    const {
      rate = 0.85,           // 语速（降低更清晰）
      pitch = 1.0,           // 音调
      volume = 1.0,          // 音量
      voice = null,          // 指定语音
      onStart = null,        // 开始回调
      onEnd = null,          // 结束回调
      onError = null         // 错误回调
    } = options

    // 取���当前播放
    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // 选择最佳语音
    utterance.voice = voice || this.selectBestVoice()
    utterance.lang = 'de-DE'

    // 优化语音参数，增加"人味" - 更自然的德语发音
    utterance.rate = Math.max(0.75, Math.min(0.95, rate))  // 0.75-0.95，更自然的语速
    utterance.pitch = Math.max(0.95, Math.min(1.05, pitch))  // 0.95-1.05，更自然的音调
    utterance.volume = Math.min(1.0, Math.max(0.9, volume))  // 0.9-1.0，清晰的音量

    // 事件监听
    utterance.onstart = () => {
      console.log('🎙️ TTS开始播放:', text)
      onStart?.()
    }

    utterance.onend = () => {
      console.log('✅ TTS播放完成')
      onEnd?.()
    }

    utterance.onerror = (event) => {
      console.error('❌ TTS播放错误:', event.error)
      onError?.(event)
    }

    // 播放
    this.synth.speak(utterance)

    return utterance
  }

  /**
   * 慢速播放（适合学习）
   */
  speakSlow(text, callbacks = {}) {
    return this.speak(text, {
      rate: 0.7,
      pitch: 1.0,
      ...callbacks
    })
  }

  /**
   * 正常语速播放
   */
  speakNormal(text, callbacks = {}) {
    return this.speak(text, {
      rate: 0.9,
      pitch: 1.0,
      ...callbacks
    })
  }

  /**
   * 快速播放
   */
  speakFast(text, callbacks = {}) {
    return this.speak(text, {
      rate: 1.1,
      pitch: 1.0,
      ...callbacks
    })
  }

  /**
   * 单词朗读（带停顿）
   */
  speakWord(word, callbacks = {}) {
    return this.speak(word, {
      rate: 0.6,  // 单词读得更慢
      pitch: 1.1, // 稍微提高音调更清晰
      ...callbacks
    })
  }

  /**
   * 停止播放
   */
  stop() {
    this.synth.cancel()
  }

  /**
   * 暂停播放
   */
  pause() {
    this.synth.pause()
  }

  /**
   * 恢复播放
   */
  resume() {
    this.synth.resume()
  }

  /**
   * 获取可用语音列表
   */
  getAvailableVoices() {
    return this.voices.filter(voice => voice.lang.startsWith('de'))
  }
}

// 导出单例
export const germanTTS = new GermanTTSEngine()
export default germanTTS
