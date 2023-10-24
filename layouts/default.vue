<script setup lang="ts">
</script>

<template>
    <div class="__user">
        <ClientStructureHeader />
        <main>
            <slot />
        </main>
        <ClientUtilityFeedback />
        <ClientUtilityVisImpairment />
        <ClientStructureFooter />
    </div>
</template>

<style>
.__user {
    font-family: "Inter", sans-serif;
}
</style>