<script setup lang="ts">
</script>

<template>
    <div class="__docs">
        <MinimalHeader title="Документация" icon="file-icons:readthedocs"/>
        <div class="__page">
            <DocsStructureSidebar />
            <slot />
        </div>
    </div>
</template>

<style scoped lang="scss">
.__docs {
    font-family: "CascadiaCode", sans-serif;
}
.__page {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
}
</style>