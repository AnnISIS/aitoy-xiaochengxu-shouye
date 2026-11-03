import Strings from '@/i18n';

// 生成文本对象的辅助函数
const generateTextEntries = (category: string, count: number) => {
  const textEntries: any = {};
  for (let i = 1; i <= count; i++) {
    textEntries[`text${i}`] = {
      text_1: Strings.getLang(`emoji_${category}_text${i}_1` as any),
      text_2: Strings.getLang(`emoji_${category}_text${i}_2` as any),
    };
  }
  return textEntries;
};

// emojitestNew 多语言数据
export const getEmojiDataNew = () => {
  return {
    lv: {
      text: generateTextEntries('lv', 51),
      color1: '#2D2D2D',
      color2: '#2D2D2D',
    },
    qing: {
      text: generateTextEntries('qing', 39),
    },
    lan: {
      text: generateTextEntries('lan', 59),
    },
    zi: {
      text: generateTextEntries('zi', 46),
    },
    huang: {
      text: generateTextEntries('huang', 64),
    },
    ju: {
      text: generateTextEntries('ju', 60),
    },
    fen: {
      text: generateTextEntries('fen', 67),
    },
  };
};

// 导出兼容旧代码的变量
export const emojitestNew = getEmojiDataNew();
