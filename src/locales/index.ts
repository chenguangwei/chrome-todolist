import { ref, watch } from 'vue';
import zhLocale from './zh';
import enLocale from './en';
import jaLocale from './ja';

// 支持的语言
export const supportedLocales = {
  zh: '中文',
  en: 'English',
  ja: '日本語'
};

// 语言包
const messages = {
  zh: zhLocale,
  en: enLocale,
  ja: jaLocale
};

// 当前语言
export const currentLocale = ref('zh');

// 初始化语言
export const initLocale = async () => {
  try {
    const result = await chrome.storage.local.get('locale');
    if (result.locale && messages[result.locale]) {
      currentLocale.value = result.locale;
    } else {
      // 尝试使用浏览器语言
      const browserLang = navigator.language.split('-')[0];
      if (messages[browserLang]) {
        currentLocale.value = browserLang;
      }
    }
  } catch (error) {
    console.error('初始化语言失败:', error);
  }
};

// 切换语言
export const setLocale = async (locale: string) => {
  if (messages[locale]) {
    currentLocale.value = locale;
    await chrome.storage.local.set({ locale });
  }
};

// 翻译函数
export const t = (key: string): string => {
  const path = key.split('.');
  let result = messages[currentLocale.value];
  
  for (const segment of path) {
    if (result && result[segment]) {
      result = result[segment];
    } else {
      // 如果找不到翻译，返回键名
      return key;
    }
  }
  
  return result as string;
}; 