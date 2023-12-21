<script setup lang="ts">
defineProps<{
    label?: string,
}>()
</script>

<template>
    <UDivider :label="label || 'ИЛИ'"/>
</template>