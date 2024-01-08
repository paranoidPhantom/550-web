<script setup lang="ts">
defineProps<{
    width?: string,
}>()
</script>

<template>
    <div class="_container" :style="{width: width ? `${width}%` : `fit-content`}">
        <ContentSlot :use="$slots.default" unwrap="div" />
    </div>
</template>

<style scoped>
._container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    border: 1px solid rgb(var(--color-primary-DEFAULT) / 0.8);
    border-radius: 1rem;
    padding: 1rem;
    margin: 1rem;
}
</style>