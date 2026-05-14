/**
 * 测试脚本 - Sprint 1 验证
 */

const config = require('../src/config');
const vocab = require('../src/vocabulary');
const store = require('../src/store');
const OcrEngine = require('../src/ocr');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    failed++;
  }
}

console.log('\n🧪 Sprint 1 测试\n');

// === 配置模块测试 ===
console.log('📦 Config 模块:');
assert(typeof config.get('readInterval') === 'number', '读取 readInterval');
assert(config.get('readInterval') === 3000, 'readInterval 默认值 3000');
config.set('readInterval', 5000);
assert(config.get('readInterval') === 5000, 'set 修改 readInterval');
config.set('readInterval', 3000); // 恢复

const v = config.validate();
assert(v.valid === true, '默认配置校验通过');

// === 数据层测试 ===
console.log('\n📦 DataStore 模块:');
assert(store.getCollection('vocabulary').length > 0, 'vocabulary 集合非空');
const testItem = store.insert('vocabulary', { word: '测试词' });
assert(testItem.id, 'insert 返回 id');
assert(testItem.word === '测试词', 'insert 数据正确');
const found = store.find('vocabulary', w => w.word === '测试词');
assert(found.length === 1, 'find 查找正确');
store.remove('vocabulary', w => w.word === '测试词');
assert(store.find('vocabulary', w => w.word === '测试词').length === 0, 'remove 删除正确');

// === 词语管理测试 ===
console.log('\n📦 Vocabulary 模块:');
const r1 = vocab.addWord('苹果');
assert(r1.success === true, 'addWord 成功');
const r2 = vocab.addWord('苹果');
assert(r2.success === false, '重复添加被拒绝');
assert(vocab.count() > 0, 'count 正常');
const randoms = vocab.getRandomWords(3);
assert(randoms.length <= 3, 'getRandomWords 返回数量正确');
assert(randoms[0].word, '随机词语含 word 字段');

// === OCR模块测试 ===
console.log('\n📦 OCR 模块:');
const ocr = new OcrEngine();
assert(ocr.language === 'chi_sim', '默认语言 chi_sim');
const words = ocr.extractWords('春天 花朵 阳光 小鸟');
assert(words.length === 4, 'extractWords 提取4个词语');
assert(words[0] === '春天', '第一个词语是春天');
const empty = ocr.extractWords('');
assert(empty.length === 0, '空文本返回空数组');

// === 结果 ===
console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败\n`);
process.exit(failed > 0 ? 1 : 0);
