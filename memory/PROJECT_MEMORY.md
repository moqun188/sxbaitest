# 项目总记忆 - sxbaitest 听写词语学习系统

## 项目概况
- **项目名**: sxbaitest
- **仓库**: https://github.com/moqun188/sxbaitest
- **创建日期**: 2026-05-14
- **阶段**: Sprint 3 完成 (全部功能就绪)

## 完成清单

### Sprint 1 (2026-05-14)
| 任务 | 负责人 | 状态 |
|------|--------|------|
| 项目初始化 | 系统 | ✅ |
| 配置管理 T-102 | 向博(A) | ✅ |
| 数据存储 T-103 | 陈总(B) | ✅ |
| 词语管理 T-104 | 陈总(B) | ✅ |
| OCR骨架 T-201 | 向博(A) | ✅ |

### Sprint 2 (2026-05-14)
| 任务 | 负责人 | 状态 |
|------|--------|------|
| OCR增强 T-201 | 向博(A) | ✅ |
| 课本扫描 T-202 | 向博(A) | ✅ |
| TTS引擎 T-203 | 向博(A) | ✅ |
| 听写控制 T-204 | 向博(A) | ✅ |
| 比对引擎 T-302 | 向博(A) | ✅ |
| 错词本 T-303 | 向博(A) | ✅ |

### Sprint 3 (2026-05-14)
| 任务 | 负责人 | 状态 |
|------|--------|------|
| 统计报表 T-304 | 向博(A) | ✅ |
| CLI运行器 | 向博(A) | ✅ |
| 端到端测试 | 向博(A) | ✅ |

## 模块架构
```
src/
├── config/index.js       ← 配置管理
├── ocr/index.js          ← OCR引擎（课本扫描+手写识别）
├── store/index.js        ← 数据存储CRUD
├── vocabulary/index.js   ← 词语管理
├── tts/index.js          ← TTS朗读引擎（espeak/say/mock）
├── dictation/index.js    ← 听写控制器（暂停/继续/停止）
├── comparison/index.js   ← 比对引擎（Levenshtein编辑距离）
├── errorbook/index.js    ← 错词本（频率/复习/导出）
├── stats/index.js        ← 统计报表（正确率趋势）
├── cli.js                ← CLI命令行工具
└── index.js              ← 入口：完整流程演示
```

## 测试统计
- 单元测试: 34/34 通过
- 端到端测试: 18/18 通过
- 总计: 52/52 通过

## CLI 用法
```bash
node src/cli.js demo          # 完整演示
node src/cli.js scan <图片>    # 扫描课本
node src/cli.js dictation 10  # 听写10个词
node src/cli.js errors        # 错词本
node src/cli.js stats         # 统计报告
node src/cli.js add 词语1 词语2  # 手动添加
node src/cli.js list          # 查看词库
```

## 待办
- [ ] 接入真实OCR引擎（Tesseract.js/百度OCR API）
- [ ] 前端Web UI
- [ ] 数据持久化迁移SQLite
- [ ] 多用户支持
