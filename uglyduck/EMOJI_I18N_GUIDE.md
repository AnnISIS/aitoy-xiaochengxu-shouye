# Emoji 数据多语言化指南

## 概述

本项目已将 `emojiData.jsx` 中的 `emojitestNew` 数据迁移到 i18n 国际化系统中，支持中文和英文两种语言。

## 文件结构

```
src/
├── i18n/
│   ├── strings.ts          # 多语言配置文件（已添加 emojitestNew 相关文本）
│   └── index.ts            # i18n 导出文件
├── pages/
│   └── new_toy_home/
│       ├── emojiData.jsx   # 原始数据文件（保留作为参考）
│       └── emojiDataI18n.ts # 新的多语言数据文件
```

## 使用方法

### 1. 在组件中导入新的多语言数据

**旧的方式：**
```javascript
import { emojitestNew } from './emojiData';
```

**新的方式：**
```javascript
import { emojitestNew } from './emojiDataI18n';
```

### 2. 使用方式保持不变

```javascript
// 使用示例
const lvData = emojitestNew.lv;
console.log(lvData.text.text1.text_1); // 会根据当前语言显示对应文本
```

## 多语言配置说明

### 命名规范

在 `strings.ts` 中，emoji 相关的 key 遵循以下命名规范：

```
emoji_{类别}_{文本编号}_{字段编号}
```

**示例：**
- `emoji_lv_text1_1`: lv 类别，第1个文本，第1个字段
- `emoji_lv_text5_2`: lv 类别，第5个文本，第2个字段

### 已支持的类别（emojitestNew）

- `lv` - 绿色系列
- `qing` - 青色系列
- `lan` - 蓝色系列
- `zi` - 紫色系列
- `huang` - 黄色系列
- `ju` - 橘色系列
- `fen` - 粉色系列

## 添加新的多语言文本

### 步骤 1: 在 strings.ts 中添加文本

```typescript
// src/i18n/strings.ts
export default {
  en: {
    // ... 其他配置
    emoji_happy_text16_1: 'New Title',
    emoji_happy_text16_2: 'New description text here.',
  },
  zh: {
    // ... 其他配置
    emoji_happy_text16_1: '新标题',
    emoji_happy_text16_2: '新的描述文本。',
  },
};
```

### 步骤 2: 在 emojiDataI18n.ts 中使用

```typescript
// src/pages/new_toy_home/emojiDataI18n.ts
text16: { 
  text_1: Strings.getLang('emoji_lv_text16_1' as any), 
  text_2: Strings.getLang('emoji_lv_text16_2' as any) 
},
```

## 切换语言

语言切换由项目的 i18n 系统统一管理，当用户切换语言时，所有使用 `Strings.getLang()` 的地方都会自动更新。

## 注意事项

1. **保持原有数据结构**：新的 `emojiDataI18n.ts` 保持了与原 `emojiData.jsx` 中 emojitestNew 完全相同的数据结构，确保向后兼容。

2. **动态获取**：使用 `getEmojiDataNew()` 函数可以确保每次调用时都获取最新的语言文本。

3. **类型安全**：使用 TypeScript 编写，提供更好的类型检查。

4. **渐进式迁移**：可以逐步将使用 `emojiData.jsx` 的地方改为使用 `emojiDataI18n.ts`。

## 待完成的工作

由于原始数据量较大，目前只添加了部分示例数据到 `strings.ts` 中。需要完成以下工作：

1. ✅ 添加 lv、qing、lan、zi、huang、ju、fen 的部分示例数据
2. ⏳ 将所有剩余的文本添加到 strings.ts（约 386 条）
3. ⏳ 为所有中文文本提供英文翻译
4. ⏳ 更新所有使用 emojiData.jsx 的组件

## 英文翻译建议

对于中国传统文化相关的内容（如"知足常乐"、"道法自然"等），建议：

1. 保留原意的同时，使其易于理解
2. 可以采用意译而非直译
3. 保持文本的诗意和哲学性

## 示例对比

### 中文
```
知足常乐
已有三分甜 / 不贪十分满
```

### 英文（建议）
```
Content and Happy
Appreciate what you have / Don't crave perfection
```

## 技术支持

如有问题，请参考：
- i18n 文档：`src/i18n/index.ts`
- 原始数据：`src/pages/new_toy_home/emojiData.jsx`
- 新数据文件：`src/pages/new_toy_home/emojiDataI18n.ts`

