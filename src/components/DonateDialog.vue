<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">{{ $t('app.donate.title') }}</h3>
        <button
          @click="handleClose"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="text-center space-y-4">
        <img
          src="@/assets/donate.png"
          alt="Donation QR Code"
          class="mx-auto w-48 h-48 object-contain"
        />
        <p class="text-gray-600">{{ $t('app.donate.description') }}</p>
        <p class="text-sm text-gray-500">{{ $t('app.donate.motivation') }}</p>
        <p class="text-sm text-pink-500">{{ $t('app.donate.thanks') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
}>();

const handleClose = () => {
  emit('update:show', false);
};
</script> 