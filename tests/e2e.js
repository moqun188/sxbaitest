/**
 * 端到端测试 - 完整听写流程验证
 */

const config = require('../src/config');
const vocab = require('../src/vocabulary');
const store = require('../src/store');
const OcrEngine = require('../src/ocr');
const TtsEngine = require('../src/tts');
const DictationController = require('../src/dictation');
const ComparisonEngine = require('../src/comparison');
const errorBook = require('../src/errorbook');
const statsReporter = require('../src/stats');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) { console.log(`  ✅ ${name}`); passed++; }
  else { console.log(`  ❌ ${name}`); failed++; }
}

async function runE2E() {
  console.log('\n🧪 端到端测试 - 完整听写流程\n');

  // Step 1: 扫描课本
  console.log('📍 Step 1: 扫描课本');
  const ocr = new OcrEngine();
  const scan = await ocr.scanTextbook('lesson1.png');
  assert(scan.words.length >= 4, '扫描提取词语 ≥ 4');

  // Step 2: 词语入库
  console.log('\n📍 Step 2: 词语入库');
  const addResult = vocab.addWords(scan.words, { lesson: 'E2E测试课' });
  assert(addResult.added > 0, '词语成功入库');
  assert(vocab.count() > 0, '词库非空');

  // Step 3: 随机取词
  console.log('\n📍 Step 3: 随机取词');
  const randomWords = vocab.getRandomWords(5);
  assert(randomWords.length === 5, '随机取5个词');
  assert(randomWords[0].word, '词语含word字段');

  // Step 4: TTS朗读
  console.log('\n📍 Step 4: TTS朗读');
  const tts = new TtsEngine();
  assert(tts.engine !== undefined, 'TTS引擎可用');
  tts.setSpeed(200);
  assert(tts.speed === 200, '语速设置正确');

  // Step 5: 听写流程
  console.log('\n📍 Step 5: 听写流程');
  const dictation = new DictationController(tts);
  const session = await dictation.start({ count: 3, interval: 500, repeat: 1 });
  assert(session !== null, '听写会话创建成功');
  assert(session.words.length === 3, '听写3个词语');

  // Step 6: 模拟手写
  console.log('\n📍 Step 6: 模拟手写识别');
  const original = dictation.getWords();
  const handwritten = original.map(w => w === '春天' ? '春大' : w);
  assert(handwritten.length === original.length, '手写数量匹配');

  // Step 7: 比对
  console.log('\n📍 Step 7: 比对');
  const comp = new ComparisonEngine(0.8);
  const result = comp.compare(original, handwritten);
  assert(result.summary.total > 0, '比对结果有数据');
  assert(typeof result.summary.accuracy === 'number', '正确率可计算');

  // Step 8: 保存错词
  console.log('\n📍 Step 8: 保存错词');
  const savedCount = comp.saveErrorWords(result, { lesson: 'E2E测试' });
  assert(savedCount >= 0, '错词保存成功');

  // Step 9: 错词本查询
  console.log('\n📍 Step 9: 错词本');
  const ebStats = errorBook.getStats();
  assert(typeof ebStats.totalErrors === 'number', '错词统计可用');
  const topErrors = errorBook.getTopErrors(5);
  assert(Array.isArray(topErrors), '高频错词可查询');

  // Step 10: 统计报告
  console.log('\n📍 Step 10: 统计报告');
  const report = statsReporter.generateReport();
  assert(report.vocabulary.total > 0, '词库统计有数据');
  assert(typeof report.errors.totalErrors === 'number', '错词统计有数据');
  assert(typeof report.accuracy.current === 'number', '正确率有数据');

  // 结果
  console.log(`\n${'═'.repeat(40)}`);
  console.log(`📊 端到端测试结果: ${passed} 通过, ${failed} 失败`);
  console.log(`${'═'.repeat(40)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runE2E().catch(err => {
  console.error('E2E测试错误:', err);
  process.exit(1);
});
