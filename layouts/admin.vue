<script setup lang="ts">
</script>

<template>
    <div class="__admin">
        <MinimalHeader title="Панель управления" icon="line-md:cog-loop"  home="/admin"/>
        <main>
            <slot />
        </main>
    </div>
</template>

<style scoped lang="scss">
.__admin {
    font-family: "CascadiaCode", sans-serif;
}
</style>