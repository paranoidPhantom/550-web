<script setup lang="ts">
defineProps<{
    title?: string;
    description?: string;
    icon?: string;
    color?: string;
}>();
</script>

<template>
    <UAlert
        :title="title || ''"
        :description="description"
        :icon="icon"
        :color="color || 'primary'"
        variant="soft"
    />
</template>
