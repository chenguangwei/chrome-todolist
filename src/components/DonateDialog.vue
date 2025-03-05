<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">{{ t('donate.supportAuthor') }}</h3>
        <button
          @click="handleClose"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="text-center">
        <!-- 中文版本显示二维码 -->
        <template v-if="currentLocale === 'zh'">
          <img
            src="/assets/donate.png"
            alt="捐赠二维码"
            class="mx-auto mb-4 max-w-[200px]"
          />
          
          <div class="text-gray-600 text-sm space-y-2">
            <p>{{ t('donate.helpMessage') }}</p>
            <p>{{ t('donate.supportMessage') }}</p>
            <p class="text-xs text-gray-400 mt-4">
              {{ t('donate.thankYou') }}
            </p>
          </div>
        </template>
        
        <!-- 英文和日文版本显示 Ko-fi 按钮 -->
        <template v-else>
          <div class="text-gray-600 text-sm space-y-2 mb-4">
            <p>{{ t('donate.helpMessage') }}</p>
            <p>{{ t('donate.supportMessage') }}</p>
          </div>
          
          <!-- Ko-fi 按钮 iframe 方式 -->
          <div class="flex justify-center my-4" style="max-height: 350px; overflow: hidden;">
            <iframe 
              id='kofiframe' 
              :src="`https://ko-fi.com/J3J41B69PY/?hidefeed=true&widget=true&embed=true&preview=true`" 
              style='border:none;width:100%;padding:4px;background:#f9f9f9;' 
              height='350' 
              title='J3J41B69PY'
            ></iframe>
          </div>
          
          <p class="text-xs text-gray-400 mt-4">
            {{ t('donate.thankYou') }}
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { t, currentLocale } from '@/locales';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const handleClose = () => {
  emit('update:show', false);
};
</script> 