<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
    >
      <span>{{ currentLanguageLabel }}</span>
      <span class="text-xs">▼</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-1 bg-white rounded shadow-lg py-1 min-w-[100px] z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
        :class="{ 'bg-gray-50': lang.code === currentLocale }"
      >
        {{ lang.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { saveLanguage } from '../i18n';

const { locale: currentLocale } = useI18n();
const isOpen = ref(false);

const languages = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }
];

const currentLanguageLabel = computed(() => {
  return languages.find(lang => lang.code === currentLocale.value)?.label || '中文';
});

const changeLanguage = async (lang: string) => {
  currentLocale.value = lang;
  await saveLanguage(lang);
  isOpen.value = false;
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script> 