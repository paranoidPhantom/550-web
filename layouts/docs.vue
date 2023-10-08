<script setup lang="ts">
</script>

<template>
    <div class="__docs">
        <MinimalHeader title="Документация" icon="file-icons:readthedocs"/>
        <main>
            <DocsStructureSidebar />
            <slot />
        </main>
    </div>
</template>

<style scoped lang="scss">
.__docs {
    font-family: "CascadiaCode", sans-serif;
}
main {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
}
</style>