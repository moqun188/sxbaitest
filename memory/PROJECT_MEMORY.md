# 项目总记忆 - sxbaitest 听写词语学习系统

## 项目概况
- **项目名**: sxbaitest
- **仓库位置**: https://github.com/moqun188/sxbaitest
- **创建日期**: 2026-05-14
- **阶段**: Sprint 2 完成 (核心功能就绪)

## Sprint 1 完成清单 (2026-05-14)

| 任务ID | 任务名称 | 负责人 | 状态 |
|--------|---------|--------|------|
| T-101 | 项目初始化 | 系统 | ✅ |
| T-102 | 配置管理模块 | 向博(A) | ✅ |
| T-103 | 数据存储层CRUD | 陈总(B) | ✅ |
| T-104 | 词语管理API | 陈总(B) | ✅ |
| T-201 | OCR模块骨架 | 向博(A) | ✅ |

## Sprint 2 完成清单 (2026-05-14)

| 任务ID | 任务名称 | 负责人 | 状态 |
|--------|---------|--------|------|
| T-201 | OCR增强(课本扫描+手写识别) | 向博(A) | ✅ |
| T-202 | scanTextbook 提取词语 | 向博(A) | ✅ |
| T-203 | TTS朗读引擎(多后端) | 向博(A) | ✅ |
| T-204 | DictationController 听写控制 | 向博(A) | ✅ |
| T-302 | ComparisonEngine 比对引擎 | 向博(A) | ✅ |
| T-303 | ErrorBook 错词本 | 向博(A) | ✅ |

## 模块架构
```
src/
├── config/index.js       ← 配置管理 (向博)
├── ocr/index.js          ← OCR引擎：课本扫描+手写识别 (向博)
├── store/index.js        ← 数据存储CRUD (陈总)
├── vocabulary/index.js   ← 词语管理 (陈总)
├── tts/index.js          ← TTS朗读引擎 (向博)
├── dictation/index.js    ← 听写控制器 (向博)
├── comparison/index.js   ← 比对引擎：编辑距离 (向博)
├── errorbook/index.js    ← 错词本：统计+复习+导出 (向博)
└── index.js              ← 入口：完整流程演示
```

## 测试统计
- Sprint 1: 18/18 通过
- Sprint 2: 34/34 通过 (含Sprint 1回归)

## 待办 (Sprint 3)
- [ ] T-301: 接入真实OCR引擎 (Tesseract.js/百度OCR)
- [ ] T-304: 统计报表（正确率趋势、错词TOP10）
- [ ] 前端Web UI开发
- [ ] 集成测试（完整听写流程端到端）

## 教训与备注
- TTS引擎使用可插拔设计：自动检测 espeak/say/mock
- 比对引擎用 Levenshtein 编辑距离，适合中文字符比对
- OCR目前为mock实现，接口兼容真实引擎，替换方便
- Git合并策略：feature分支开发 → merge到master → push
