/**
 * 听写控制器
 * 开发者: 向博(A)
 * 任务: T-204 随机听写 + 间隔控制
 *
 * 完整听写流程：
 * 1. 从词库随机选取词语
 * 2. 按配置间隔朗读
 * 3. 等待学生书写
 * 4. 支持暂停/继续/停止
 */

const EventEmitter = require('events');
const vocab = require('../vocabulary');
const config = require('../config');

class DictationController extends EventEmitter {
  constructor(ttsEngine) {
    super();
    this.tts = ttsEngine;
    this.state = 'idle'; // idle | playing | paused | finished
    this.currentWords = [];
    this.currentIndex = 0;
    this.results = []; // 记录听写结果

    // 绑定TTS事件
    this.tts.on('beforeWord', (data) => {
      this.currentIndex = data.index;
      this.emit('word', { ...data, state: 'reading' });
    });

    this.tts.on('end', () => {
      this.state = 'finished';
      this.emit('finish', { results: this.results });
    });
  }

  /**
   * 开始听写会话
   * @param {object} options - { count, lesson, unit, interval, repeat }
   * @returns {Promise<{words: object[], config: object}>}
   */
  async start(options = {}) {
    if (this.state === 'playing') {
      console.log('[Dictation] 已在进行中');
      return null;
    }

    const cfg = config.get();
    const count = options.count || 10;
    const interval = options.interval || cfg.readInterval;
    const repeat = options.repeat || cfg.readRepeat;

    // 随机选词
    this.currentWords = vocab.getRandomWords(count, {
      lesson: options.lesson,
      unit: options.unit
    });

    if (this.currentWords.length === 0) {
      console.log('[Dictation] 词库为空，请先添加词语');
      return null;
    }

    this.currentIndex = 0;
    this.results = [];
    this.state = 'playing';

    const wordList = this.currentWords.map(w => w.word);

    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║     📝 听写练习开始                  ║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  词语数量: ${count}                        ║`);
    console.log(`║  朗读间隔: ${interval / 1000}秒                     ║`);
    console.log(`║  每词遍数: ${repeat}遍                      ║`);
    console.log('╚══════════════════════════════════════╝');
    console.log('');

    this.emit('start', {
      words: this.currentWords,
      config: { count, interval, repeat }
    });

    // 开始朗读
    await this.tts.speakList(wordList, {
      interval,
      repeat,
      onBeforeWord: (word, index) => {
        process.stdout.write(`\n  📖 第 ${index + 1}/${wordList.length} 个: `);
      },
      onAfterWord: (word, index) => {
        // 记录朗读的词语
        this.results.push({
          word,
          index,
          readAt: new Date().toISOString()
        });
      }
    });

    return {
      words: this.currentWords,
      config: { count, interval, repeat }
    };
  }

  /**
   * 暂停听写
   */
  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.tts.stop();
      console.log('[Dictation] ⏸ 已暂停');
      this.emit('pause');
    }
  }

  /**
   * 继续听写
   */
  async resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      console.log('[Dictation] ▶ 继续');

      // 从当前位置继续
      const remaining = this.currentWords.slice(this.currentIndex + 1);
      if (remaining.length > 0) {
        const cfg = config.get();
        await this.tts.speakList(remaining.map(w => w.word), {
          interval: cfg.readInterval,
          repeat: cfg.readRepeat
        });
      }
    }
  }

  /**
   * 停止听写
   */
  stop() {
    this.state = 'finished';
    this.tts.stop();
    console.log('[Dictation] ⏹ 已停止');
    this.emit('stop', { results: this.results });
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      state: this.state,
      totalWords: this.currentWords.length,
      currentIndex: this.currentIndex,
      progress: this.currentWords.length > 0
        ? Math.round((this.currentIndex / this.currentWords.length) * 100)
        : 0
    };
  }

  /**
   * 获取听写的词语列表（用于比对）
   */
  getWords() {
    return this.currentWords.map(w => w.word);
  }

  /**
   * 获取听写结果
   */
  getResults() {
    return this.results;
  }
}

module.exports = DictationController;
