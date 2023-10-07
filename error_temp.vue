<script setup lang="ts">
defineProps(["error"])
</script>

<template>
    <h1>{{ error.statusCode }}</h1>
    
</template>

<style scoped lang="scss">

h1 {
    font-family: 'Martian Mono', monospace;
}
</style>