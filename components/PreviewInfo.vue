<script lang="ts" setup>
const {
    public: { access },
} = useRuntimeConfig();
const inDev = process.dev;
const inPreview = access === "testers";
</script>

<template>
    <div class="preview-info" v-if="inDev || inPreview">
        <p v-if="inDev">Режим локальной разработки</p>
        <p v-else-if="inPreview">Версия для тестировщиков</p>
    </div>
</template>

<style lang="scss" scoped>
.preview-info {
    font-family: "CascadiaCode", monospace;
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    pointer-events: none;
    opacity: 0.25;
}
</style>
