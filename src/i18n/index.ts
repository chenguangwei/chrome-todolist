import { createI18n } from 'vue-i18n';
import type { I18n } from 'vue-i18n';
import zh from '../locales/zh';
import en from '../locales/en';
import ja from '../locales/ja';

// 获取浏览器语言
const getBrowserLanguage = (): string => {
  const lang = navigator.language.toLowerCase();
  if (lang.includes('zh')) return 'zh';
  if (lang.includes('ja')) return 'ja';
  return 'en';
};

// 从存储中获取语言设置或使用浏览器语言
const getStoredLanguage = async (): Promise<string> => {
  try {
    const result = await chrome.storage.local.get('language');
    return result.language || getBrowserLanguage();
  } catch (error) {
    console.error('获取语言设置失败:', error);
    return getBrowserLanguage();
  }
};

// 创建i18n实例
export const createAppI18n = async (): Promise<I18n> => {
  const locale = await getStoredLanguage();
  
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages: {
      zh,
      en,
      ja
    }
  });
};

// 保存语言设置
export const saveLanguage = async (lang: string): Promise<void> => {
  try {
    await chrome.storage.local.set({ language: lang });
  } catch (error) {
    console.error('保存语言设置失败:', error);
  }
}; 