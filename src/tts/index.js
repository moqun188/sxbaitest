/**
 * TTS朗读引擎
 * 开发者: 向博(A)
 * 任务: T-203 TTS朗读引擎
 *
 * 支持多种后端：
 * - espeak (Linux系统)
 * - say (macOS)
 * - mock (模拟输出，用于测试/无TTS环境)
 */

const { execSync, spawn } = require('child_process');
const EventEmitter = require('events');

class TtsEngine extends EventEmitter {
  constructor(options = {}) {
    super();
    this.speed = options.speed || 150;      // 语速 (词/分钟)
    this.voice = options.voice || 'zh';     // 语音
    this.volume = options.volume || 100;    // 音量 0-100
    this.engine = this._detectEngine();     // 自动检测可用引擎
    this.isPlaying = false;

    console.log(`[TTS] 引擎初始化: ${this.engine}, 语速: ${this.speed}, 语音: ${this.voice}`);
  }

  /**
   * 朗读单个词语
   * @param {string} word - 要朗读的词语
   * @param {object} options - { speed, repeat, delay }
   * @returns {Promise<void>}
   */
  async speak(word, options = {}) {
    const speed = options.speed || this.speed;
    const repeat = options.repeat || 1;

    for (let i = 0; i < repeat; i++) {
      if (i > 0) {
        await this._delay(500); // 重复朗读间隔
      }
      await this._speakOnce(word, speed);
      this.emit('spoken', { word, index: i + 1, total: repeat });
    }
  }

  /**
   * 按顺序朗读词语列表（听写模式）
   * @param {string[]} words - 词语列表
   * @param {object} options - { interval, repeat, onBeforeWord, onAfterWord }
   * @returns {Promise<{totalTime: number, wordsSpoken: number}>}
   */
  async speakList(words, options = {}) {
    const interval = options.interval || 3000;  // 词语间隔(ms)
    const repeat = options.repeat || 2;         // 每个词语朗读次数
    const onBeforeWord = options.onBeforeWord || (() => {});
    const onAfterWord = options.onAfterWord || (() => {});

    this.isPlaying = true;
    const startTime = Date.now();

    console.log(`[TTS] 开始听写，${words.length} 个词语，间隔 ${interval}ms，每个读 ${repeat} 遍`);
    this.emit('start', { count: words.length, interval, repeat });

    for (let i = 0; i < words.length; i++) {
      if (!this.isPlaying) {
        console.log(`[TTS] 听写已停止`);
        break;
      }

      const word = words[i];
      onBeforeWord(word, i, words.length);

      console.log(`[TTS] (${i + 1}/${words.length}) 朗读: ${word}`);
      this.emit('beforeWord', { word, index: i, total: words.length });

      // 朗读词语（指定次数）
      await this.speak(word, { repeat, speed: this.speed });

      onAfterWord(word, i, words.length);
      this.emit('afterWord', { word, index: i, total: words.length });

      // 词语间间隔（最后一个不等待）
      if (i < words.length - 1) {
        console.log(`[TTS] 等待 ${interval}ms...`);
        await this._delay(interval);
      }
    }

    const totalTime = Date.now() - startTime;
    this.isPlaying = false;

    console.log(`[TTS] 听写完成，总耗时 ${(totalTime / 1000).toFixed(1)}s`);
    this.emit('end', { totalTime, wordsSpoken: words.length });

    return { totalTime, wordsSpoken: words.length };
  }

  /**
   * 停止朗读
   */
  stop() {
    this.isPlaying = false;
    console.log(`[TTS] 停止朗读`);
    this.emit('stop');
  }

  /**
   * 设置语速
   */
  setSpeed(speed) {
    this.speed = Math.max(50, Math.min(300, speed));
    console.log(`[TTS] 语速设置为: ${this.speed}`);
  }

  /**
   * 设置语音
   */
  setVoice(voice) {
    this.voice = voice;
    console.log(`[TTS] 语音设置为: ${voice}`);
  }

  /**
   * 获取当前配置
   */
  getConfig() {
    return {
      engine: this.engine,
      speed: this.speed,
      voice: this.voice,
      volume: this.volume
    };
  }

  // ========== 内部方法 ==========

  /** 检测可用的TTS引擎 */
  _detectEngine() {
    try {
      execSync('which espeak', { stdio: 'ignore' });
      return 'espeak';
    } catch {}

    try {
      execSync('which say', { stdio: 'ignore' });
      return 'say';
    } catch {}

    return 'mock';
  }

  /** 单次朗读实现 */
  async _speakOnce(word, speed) {
    switch (this.engine) {
      case 'espeak':
        return this._espeak(word, speed);
      case 'say':
        return this._say(word, speed);
      case 'mock':
      default:
        return this._mockSpeak(word, speed);
    }
  }

  /** espeak 引擎 (Linux) */
  _espeak(word, speed) {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', this.voice,
        '-s', String(speed),
        '-p', '50',
        word
      ];

      const proc = spawn('espeak', args);
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`espeak exited with code ${code}`));
      });
      proc.on('error', () => {
        // 降级到 mock
        this._mockSpeak(word, speed).then(resolve).catch(reject);
      });
    });
  }

  /** say 引擎 (macOS) */
  _say(word, speed) {
    return new Promise((resolve, reject) => {
      const rate = Math.round(speed * 2.5); // 转换为 macOS 语速
      const args = ['-r', String(rate), word];

      const proc = spawn('say', args);
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`say exited with code ${code}`));
      });
      proc.on('error', () => {
        this._mockSpeak(word, speed).then(resolve).catch(reject);
      });
    });
  }

  /** 模拟朗读（无TTS环境时使用） */
  _mockSpeak(word, speed) {
    // 按语速计算模拟延迟
    const charDelay = Math.max(50, 60000 / speed);
    const totalDelay = word.length * charDelay;

    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟朗读输出（可被捕获用于调试）
        process.stdout.write(`  🔊 "${word}"\n`);
        resolve();
      }, Math.min(totalDelay, 1000));
    });
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = TtsEngine;
