<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">支持作者</h3>
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
        <img
          src="/assets/donate.png"
          alt="捐赠二维码"
          class="mx-auto mb-4 max-w-[200px]"
        />
        
        <div class="text-gray-600 text-sm space-y-2">
          <p>如果这个工具对您有帮助，欢迎请作者喝杯咖啡 ☕️</p>
          <p>您的支持是我持续更新的动力！</p>
          <p class="text-xs text-gray-400 mt-4">
            感谢您的支持和鼓励 🙏
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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