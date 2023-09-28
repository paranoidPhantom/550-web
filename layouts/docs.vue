<script setup lang="ts">
</script>

<template>
    <DocsStructureHeader />
    <main>
        <DocsStructureSidebar />
        <slot />
    </main>
</template>

<style scoped lang="scss">
main {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
}
</style>