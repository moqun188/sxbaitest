/**
 * 测试脚本 - Sprint 1 + Sprint 2 完整验证
 */

const config = require('../src/config');
const vocab = require('../src/vocabulary');
const store = require('../src/store');
const OcrEngine = require('../src/ocr');
const TtsEngine = require('../src/tts');
const ComparisonEngine = require('../src/comparison');
const errorBook = require('../src/errorbook');

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

console.log('\n🧪 Sprint 1 + Sprint 2 测试\n');

// ========== 测试数据隔离 ==========
// 清空上次测试遗留数据，确保干净环境
store.clear('vocabulary');
store.clear('errorWords');

// ========== Config 模块 ==========
console.log('📦 Config 模块:');
assert(typeof config.get('readInterval') === 'number', '读取 readInterval');
assert(config.get('readInterval') === 3000, 'readInterval 默认值 3000');
config.set('readInterval', 5000);
assert(config.get('readInterval') === 5000, 'set 修改 readInterval');
config.set('readInterval', 3000);
const v = config.validate();
assert(v.valid === true, '默认配置校验通过');

// ========== DataStore 模块 ==========
console.log('\n📦 DataStore 模块:');
const testItem = store.insert('vocabulary', { word: '测试词' });
assert(store.getCollection('vocabulary').length > 0, 'vocabulary 集合非空');
assert(testItem.id, 'insert 返回 id');
assert(testItem.word === '测试词', 'insert 数据正确');
const found = store.find('vocabulary', w => w.word === '测试词');
assert(found.length === 1, 'find 查找正确');
store.remove('vocabulary', w => w.word === '测试词');
assert(store.find('vocabulary', w => w.word === '测试词').length === 0, 'remove 删除正确');

// ========== Vocabulary 模块 ==========
console.log('\n📦 Vocabulary 模块:');
const r1 = vocab.addWord('苹果');
assert(r1.success === true, 'addWord 成功');
const r2 = vocab.addWord('苹果');
assert(r2.success === false, '重复添加被拒绝');
assert(vocab.count() > 0, 'count 正常');
const randoms = vocab.getRandomWords(3);
assert(randoms.length <= 3, 'getRandomWords 返回数量正确');
assert(randoms[0].word, '随机词语含 word 字段');

// ========== OCR 模块 ==========
console.log('\n📦 OCR 模块:');
const ocr = new OcrEngine();
assert(ocr.language === 'chi_sim', '默认语言 chi_sim');
const words = ocr.extractWords('春天 花朵 阳光 小鸟');
assert(words.length === 4, 'extractWords 提取4个词语');
assert(words[0] === '春天', '第一个词语是春天');
const empty = ocr.extractWords('');
assert(empty.length === 0, '空文本返回空数组');

// OCR 课本扫描
async function testOcr() {
  const scan = await ocr.scanTextbook('lesson1.png');
  assert(scan.words.length > 0, 'scanTextbook 返回词语');
  assert(scan.rawText.length > 0, 'scanTextbook 返回原文');

  const hw = await ocr.recognizeHandwriting('handwrite.png');
  assert(hw.words.length > 0, 'recognizeHandwriting 返回词语');
  assert(hw.confidence < 1, '手写识别置信度有折扣');
}

// ========== TTS 模块 ==========
console.log('\n📦 TTS 模块:');
const tts = new TtsEngine();
assert(tts.engine === 'mock' || tts.engine === 'espeak', 'TTS 引擎可用');
tts.setSpeed(200);
assert(tts.speed === 200, 'setSpeed 生效');
const ttsCfg = tts.getConfig();
assert(ttsCfg.speed === 200, 'getConfig 返回正确');

// ========== Comparison 模块 ==========
console.log('\n📦 Comparison 模块:');
const comp = new ComparisonEngine(0.8);
const cr1 = comp.compare(['春天', '花朵', '阳光'], ['春天', '花朵', '阳光']);
assert(cr1.summary.correct === 3, '全部正确: 3/3');
assert(cr1.summary.accuracy === 100, '正确率 100%');

const cr2 = comp.compare(['春天', '花朵', '阳光'], ['春大', '花朵', '阳光']);
assert(cr2.summary.correct === 2, '一个错误: 2/3');
assert(cr2.summary.wrong === 1, '错误数 1');

const cr3 = comp.compare(['春天', '花朵'], ['春天', '花朵', '阳光']);
assert(cr3.summary.extra === 1, '多写检测');

const cr4 = comp.compare(['春天', '花朵', '阳光'], ['春天']);
assert(cr4.summary.missing === 2, '漏写检测');

// ========== ErrorBook 模块 ==========
console.log('\n📦 ErrorBook 模块:');
const ebStats = errorBook.getStats();
assert(typeof ebStats.totalErrors === 'number', 'getStats 返回 totalErrors');
assert(typeof ebStats.uniqueWords === 'number', 'getStats 返回 uniqueWords');
const topE = errorBook.getTopErrors(5);
assert(Array.isArray(topE), 'getTopErrors 返回数组');

// ========== 运行异步测试 ==========
testOcr().then(() => {
  console.log(`\n📊 结果: ${passed} 通过, ${failed} 失败\n`);
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试错误:', err);
  process.exit(1);
});
