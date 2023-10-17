<script setup lang="ts">
</script>

<template>
    <div class="__user">
        <ClientStructureHeader />
        <main>
            <slot />
        </main>
        <ClientUtilityFeedback />
        <ClientStructureFooter />
    </div>
</template>

<style>
.__user {
    font-family: "Oswald", sans-serif;
}
</style>