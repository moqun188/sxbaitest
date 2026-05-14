/**
 * 配置管理模块
 * 开发者: 向博(A)
 * 任务: T-102 配置模块：读取/管理默认配置
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../../config/default.json');

class ConfigManager {
  constructor() {
    this._config = null;
    this.load();
  }

  /** 加载配置文件 */
  load() {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      this._config = JSON.parse(raw);
      console.log('[Config] 配置加载成功');
    } catch (err) {
      console.error('[Config] 配置加载失败，使用默认值:', err.message);
      this._config = this._getDefaults();
    }
    return this._config;
  }

  /** 获取配置项 */
  get(key) {
    if (key) return this._config[key];
    return { ...this._config };
  }

  /** 设置配置项（内存中） */
  set(key, value) {
    if (this._config.hasOwnProperty(key)) {
      this._config[key] = value;
      console.log(`[Config] ${key} = ${value}`);
      return true;
    }
    console.warn(`[Config] 未知配置项: ${key}`);
    return false;
  }

  /** 保存配置到文件 */
  save() {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this._config, null, 2), 'utf-8');
      console.log('[Config] 配置已保存');
      return true;
    } catch (err) {
      console.error('[Config] 配置保存失败:', err.message);
      return false;
    }
  }

  /** 重置为默认值 */
  reset() {
    this._config = this._getDefaults();
    this.save();
    console.log('[Config] 配置已重置');
  }

  /** 默认配置 */
  _getDefaults() {
    return {
      readInterval: 3000,
      readRepeat: 2,
      readSpeed: 'normal',
      ocrLanguage: 'chi_sim',
      matchThreshold: 0.8,
      dataPath: './data/db.json'
    };
  }

  /** 验证配置合法性 */
  validate() {
    const errors = [];
    if (this._config.readInterval < 1000) {
      errors.push('readInterval 不能小于 1000ms');
    }
    if (this._config.readRepeat < 1 || this._config.readRepeat > 10) {
      errors.push('readRepeat 必须在 1-10 之间');
    }
    if (this._config.matchThreshold < 0 || this._config.matchThreshold > 1) {
      errors.push('matchThreshold 必须在 0-1 之间');
    }
    return { valid: errors.length === 0, errors };
  }
}

module.exports = new ConfigManager();
