<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen" 
      class="px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1"
    >
      <span>{{ currentLocaleDisplay }}</span>
      <span class="text-xs">▼</span>
    </button>
    
    <div v-if="isOpen" class="absolute right-0 mt-1 bg-white rounded shadow-lg z-10">
      <div class="py-1">
        <button
          v-for="(name, code) in supportedLocales"
          :key="code"
          @click="changeLocale(code)"
          class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          :class="{ 'bg-blue-50 text-blue-600': currentLocale === code }"
        >
          {{ name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { currentLocale, supportedLocales, setLocale } from '@/locales';

const isOpen = ref(false);

const currentLocaleDisplay = computed(() => {
  return supportedLocales[currentLocale.value];
});

const changeLocale = async (locale: string) => {
  await setLocale(locale);
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