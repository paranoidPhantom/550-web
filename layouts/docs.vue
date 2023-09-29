<script setup lang="ts">
</script>

<template>
    <div class="__docs">
        <DocsStructureHeader />
        <main>
            <DocsStructureSidebar />
            <slot />
        </main>
    </div>
</template>

<style scoped lang="scss">
main {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
}
</style>