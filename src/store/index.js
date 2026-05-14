/**
 * 数据存储模块
 * 开发者: 陈总(B)
 * 任务: T-103 数据层：本地JSON存储CRUD
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');

class DataStore {
  constructor() {
    this._data = null;
    this.load();
  }

  /** 加载数据 */
  load() {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      this._data = JSON.parse(raw);
      console.log('[DataStore] 数据加载成功');
    } catch (err) {
      console.error('[DataStore] 数据加载失败，初始化空数据:', err.message);
      this._data = { vocabulary: [], sessions: [], errorWords: [] };
    }
    return this._data;
  }

  /** 持久化到文件 */
  _save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this._data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('[DataStore] 保存失败:', err.message);
      return false;
    }
  }

  // ========== 通用 CRUD ==========

  /** 获取某个集合 */
  getCollection(name) {
    return this._data[name] || [];
  }

  /** 往集合插入一条记录 */
  insert(collection, record) {
    if (!this._data[collection]) {
      this._data[collection] = [];
    }
    const item = {
      id: this._generateId(),
      ...record,
      createdAt: new Date().toISOString()
    };
    this._data[collection].push(item);
    this._save();
    console.log(`[DataStore] 插入 ${collection}: id=${item.id}`);
    return item;
  }

  /** 按条件查找 */
  find(collection, predicate) {
    const col = this._data[collection] || [];
    return col.filter(predicate);
  }

  /** 按ID查找 */
  findById(collection, id) {
    const col = this._data[collection] || [];
    return col.find(item => item.id === id) || null;
  }

  /** 按条件更新 */
  update(collection, predicate, updates) {
    const col = this._data[collection] || [];
    let updated = 0;
    col.forEach(item => {
      if (predicate(item)) {
        Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        updated++;
      }
    });
    if (updated > 0) this._save();
    console.log(`[DataStore] 更新 ${collection}: ${updated} 条`);
    return updated;
  }

  /** 按条件删除 */
  remove(collection, predicate) {
    const col = this._data[collection] || [];
    const before = col.length;
    this._data[collection] = col.filter(item => !predicate(item));
    const removed = before - this._data[collection].length;
    if (removed > 0) this._save();
    console.log(`[DataStore] 删除 ${collection}: ${removed} 条`);
    return removed;
  }

  /** 按ID删除 */
  removeById(collection, id) {
    return this.remove(collection, item => item.id === id);
  }

  /** 统计数量 */
  count(collection, predicate) {
    const col = this._data[collection] || [];
    if (predicate) return col.filter(predicate).length;
    return col.length;
  }

  /** 清空集合 */
  clear(collection) {
    this._data[collection] = [];
    this._save();
    console.log(`[DataStore] 清空 ${collection}`);
  }

  /** 生成简单ID */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}

module.exports = new DataStore();
