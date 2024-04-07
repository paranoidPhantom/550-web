<script lang="ts" setup>
const {
    public: { access },
} = useRuntimeConfig();
const inDev = process.dev;
const inPreview = access === "testers";
const {
    public: { build_id },
} = useRuntimeConfig();
</script>

<template>
    <div class="preview-info" v-if="inDev || inPreview">
        <p v-if="inDev">Режим локальной разработки</p>
        <p v-else-if="inPreview">
            Версия для тестировщиков - билд {{ build_id }}
        </p>
    </div>
</template>

<style lang="scss" scoped>
.preview-info {
    font-family: "CascadiaCode", monospace;
    position: fixed;
    right: 0.35rem;
    bottom: 0.35rem;
    pointer-events: none;
    opacity: 0.25;
    padding: 0.5rem;
    border-radius: 0.5rem;
}
</style>
