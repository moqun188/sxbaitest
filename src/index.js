/**
 * 听写词语学习系统 - 完整版入口
 * sxbaitest v2.0
 *
 * Sprint 2 完成模块:
 *   [向博/A] T-201 OCR增强, T-202 课本扫描, T-203 TTS引擎, T-204 听写控制器
 *   [向博/A] T-302 比对引擎, T-303 错词本
 */

const config = require('./config');
const vocab = require('./vocabulary');
const OcrEngine = require('./ocr');
const TtsEngine = require('./tts');
const DictationController = require('./dictation');
const ComparisonEngine = require('./comparison');
const errorBook = require('./errorbook');

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║   听写词语学习系统 sxbaitest v2.0    ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');

  const cfg = config.get();

  // ========== 1. 演示OCR扫描课本 ==========
  console.log('═══ 1. OCR扫描课本 ═══');
  const ocr = new OcrEngine(cfg.ocrLanguage);

  // 模拟扫描第一课
  const scanResult = await ocr.scanTextbook('lesson1_第一课.png', {
    lesson: '第一课',
    unit: '第一单元'
  });
  console.log(`  扫描结果: ${scanResult.words.length} 个词语`);

  // 批量添加到词库
  const addResult = vocab.addWords(scanResult.words, {
    lesson: '第一课',
    unit: '第一单元',
    source: 'ocr_scan'
  });
  console.log(`  入库: ${addResult.added} 个，跳过: ${addResult.skipped} 个`);
  console.log(`  词库总数: ${vocab.count()}`);
  console.log('');

  // 再扫描第二课
  const scan2 = await ocr.scanTextbook('lesson2_第二课.png', {
    lesson: '第二课',
    unit: '第一单元'
  });
  vocab.addWords(scan2.words, { lesson: '第二课', unit: '第一单元', source: 'ocr_scan' });
  console.log(`  词库总数: ${vocab.count()}`);
  console.log('');

  // ========== 2. 模拟听写 ==========
  console.log('═══ 2. 开始听写 ═══');
  const tts = new TtsEngine({ speed: cfg.readSpeed === 'slow' ? 100 : cfg.readSpeed === 'fast' ? 200 : 150 });
  const dictation = new DictationController(tts);

  // 用较短间隔演示
  const session = await dictation.start({
    count: 5,
    interval: 1000,  // 演示用1秒，实际可配置为3秒
    repeat: 1
  });

  if (session) {
    console.log('');
    console.log(`  听写完成，共 ${session.words.length} 个词语`);
  }
  console.log('');

  // ========== 3. 模拟学生手写 + 比对 ==========
  console.log('═══ 3. 扫描手写 + 比对 ═══');

  // 模拟学生手写（故意写错几个）
  const originalWords = dictation.getWords();
  console.log(`  原文: ${originalWords.join(', ')}`);

  // 模拟手写识别结果（有对有错）
  const handwrittenWords = simulateHandwriting(originalWords);
  console.log(`  手写: ${handwrittenWords.join(', ')}`);

  // 比对
  const comparison = new ComparisonEngine(cfg.matchThreshold);
  const result = comparison.compare(originalWords, handwrittenWords);
  comparison.printReport(result);

  // 保存错词
  const savedErrors = comparison.saveErrorWords(result, { lesson: '第一课', unit: '第一单元' });
  console.log(`  已保存 ${savedErrors} 个错词到错词本`);
  console.log('');

  // ========== 4. 错词本 ==========
  console.log('═══ 4. 错词本 ═══');
  const stats = errorBook.getStats();
  console.log(`  总错误: ${stats.totalErrors} 次`);
  console.log(`  不重复词: ${stats.uniqueWords} 个`);

  const topErrors = errorBook.getTopErrors(5);
  if (topErrors.length > 0) {
    console.log('  高频错词:');
    topErrors.forEach(w => {
      console.log(`    "${w.word}" - 错${w.count}次`);
    });
  }
  console.log('');

  console.log('✅ Sprint 2 完成 - 所有模块演示完毕');
}

/**
 * 模拟学生手写识别（故意制造一些错误）
 */
function simulateHandwriting(original) {
  const errorMap = {
    '春天': '春大',    // 形近字错误
    '花朵': '花朵',    // 正确
    '阳光': '阳光',    // 正确
    '小鸟': '小乌',    // 形近字错误
    '读书': '读书',    // 正确
    '写字': '写字',    // 正确
    '认真': '认真',    // 正确
    '努力': '努历',    // 形近字错误
    '快乐': '快乐',    // 正确
    '成长': '成长',    // 正确
    '唱歌': '唱歌',    // 正确
    '温暖': '温暖',    // 正确
    '发芽': '发芽',    // 正确
    '开放': '开放',    // 正确
    '学习': '学习',    // 正确
    '知识': '知识',    // 正确
    '聪明': '聪名',    // 同音字错误
    '勤奋': '勤奋'     // 正确
  };

  return original.map(word => errorMap[word] || word);
}

main().catch(err => {
  console.error('运行错误:', err);
  process.exit(1);
});
