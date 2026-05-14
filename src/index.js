/**
 * 听写词语学习系统 - 入口文件
 * sxbaitest
 */

const config = require('../config/default.json');

console.log('=================================');
console.log('  听写词语学习系统 sxbaitest v1.0');
console.log('=================================');
console.log('');
console.log('功能模块:');
console.log('  1. 课本扫描识别 (OCR)');
console.log('  2. 词语记忆存储');
console.log('  3. 随机听写朗读');
console.log('  4. 手写扫描识别');
console.log('  5. 智能比对纠错');
console.log('  6. 错词记录管理');
console.log('');
console.log('当前配置:');
console.log(`  朗读间隔: ${config.readInterval}ms`);
console.log(`  朗读次数: ${config.readRepeat}次`);
console.log(`  朗读速度: ${config.readSpeed}`);
console.log(`  比对阈值: ${config.matchThreshold}`);
console.log('');
console.log('系统就绪 ✓');
