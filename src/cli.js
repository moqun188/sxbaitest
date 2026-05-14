#!/usr/bin/env node
/**
 * 听写词语学习系统 - CLI运行器
 * 用法: node src/cli.js [命令] [参数]
 *
 * 命令:
 *   scan <image>     - 扫描课本图片
 *   dictation [n]    - 开始听写（n个词语，默认10）
 *   compare          - 比对最近一次听写
 *   errors           - 查看错词本
 *   stats            - 查看统计报告
 *   add <word...>    - 手动添加词语
 *   list             - 查看词库
 *   demo             - 运行完整演示
 */

const config = require('./config');
const vocab = require('./vocabulary');
const OcrEngine = require('./ocr');
const TtsEngine = require('./tts');
const DictationController = require('./dictation');
const ComparisonEngine = require('./comparison');
const errorBook = require('./errorbook');
const statsReporter = require('./stats');
const store = require('./store');

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command) {
    case 'scan':
      await cmdScan(args[1]);
      break;
    case 'dictation':
    case 'd':
      await cmdDictation(parseInt(args[1]) || 10);
      break;
    case 'compare':
    case 'c':
      cmdCompare();
      break;
    case 'errors':
    case 'e':
      cmdErrors();
      break;
    case 'stats':
    case 's':
      statsReporter.printReport();
      break;
    case 'add':
      cmdAdd(args.slice(1));
      break;
    case 'list':
    case 'l':
      cmdList();
      break;
    case 'demo':
      await cmdDemo();
      break;
    case 'help':
    default:
      printHelp();
  }
}

// ========== 命令实现 ==========

async function cmdScan(imagePath) {
  if (!imagePath) {
    console.log('用法: cli.js scan <图片路径>');
    return;
  }
  const ocr = new OcrEngine(config.get('ocrLanguage'));
  const result = await ocr.scanTextbook(imagePath);
  console.log(`\n扫描到 ${result.words.length} 个词语:`);
  result.words.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));

  if (result.words.length > 0) {
    const addResult = vocab.addWords(result.words, { source: 'scan' });
    console.log(`\n入库: ${addResult.added} 个`);
  }
}

async function cmdDictation(count) {
  const tts = new TtsEngine();
  const dictation = new DictationController(tts);
  const cfg = config.get();

  await dictation.start({
    count,
    interval: cfg.readInterval,
    repeat: cfg.readRepeat
  });

  const words = dictation.getWords();
  console.log(`\n听写词语: ${words.join(', ')}`);
  console.log('请在纸上书写，然后用 scan 命令扫描手写内容。');
}

function cmdCompare() {
  console.log('比对功能需要先进行听写并扫描手写内容。');
  console.log('使用: cli.js demo 查看完整演示');
}

function cmdErrors() {
  const stats = errorBook.getStats();
  console.log(`\n📖 错词本: ${stats.uniqueWords} 个不重复词，共 ${stats.totalErrors} 次错误`);

  const top = errorBook.getTopErrors(10);
  if (top.length > 0) {
    console.log('\n高频错词:');
    top.forEach((w, i) => {
      console.log(`  ${i + 1}. "${w.word}" — 错 ${w.count} 次`);
    });
  } else {
    console.log('\n暂无错词记录 ✓');
  }
}

function cmdAdd(words) {
  if (words.length === 0) {
    console.log('用法: cli.js add 词语1 词语2 ...');
    return;
  }
  const result = vocab.addWords(words, { source: 'manual' });
  console.log(`添加: ${result.added} 个，跳过: ${result.skipped} 个`);
}

function cmdList() {
  const words = vocab.getAllWords();
  console.log(`\n📚 词库: ${words.length} 个词语`);
  words.forEach((w, i) => {
    console.log(`  ${i + 1}. ${w.word} [${w.lesson || '-'}]`);
  });
}

async function cmdDemo() {
  console.log('\n🎯 完整演示流程\n');

  // 1. 扫描
  console.log('【步骤1】扫描课本...');
  const ocr = new OcrEngine();
  const scan1 = await ocr.scanTextbook('lesson1.png');
  vocab.addWords(scan1.words, { lesson: '第一课', source: 'ocr' });

  // 2. 听写
  console.log('\n【步骤2】开始听写...');
  const tts = new TtsEngine();
  const dictation = new DictationController(tts);
  await dictation.start({ count: 5, interval: 800, repeat: 1 });

  // 3. 比对
  console.log('\n【步骤3】扫描手写 + 比对...');
  const original = dictation.getWords();
  const handwritten = original.map(w => {
    if (w === '春天') return '春大';
    if (w === '小鸟') return '小乌';
    return w;
  });

  const comp = new ComparisonEngine();
  const result = comp.compare(original, handwritten);
  comp.printReport(result);
  comp.saveErrorWords(result, { lesson: '第一课' });

  // 4. 错词本
  console.log('【步骤4】错词本:');
  cmdErrors();

  // 5. 统计
  console.log('【步骤5】统计报告:');
  statsReporter.printReport();
}

function printHelp() {
  console.log(`
╔══════════════════════════════════════╗
║   听写词语学习系统 sxbaitest v2.0    ║
╠══════════════════════════════════════╣
║  用法: node src/cli.js <命令>        ║
║                                      ║
║  命令:                               ║
║    scan <图片>   扫描课本             ║
║    dictation [n] 开始听写(n个词)     ║
║    errors        查看错词本           ║
║    stats         统计报告             ║
║    add <词...>   添加词语             ║
║    list          查看词库             ║
║    demo          完整演示             ║
║    help          帮助                 ║
╚══════════════════════════════════════╝
  `);
}

main().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
