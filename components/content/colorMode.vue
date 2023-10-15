<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
    <slot v-if="colorMode.value === 'light'" name="light"/>
    <slot v-else-if="colorMode.value === 'dark'" name="dark"/>
</template>