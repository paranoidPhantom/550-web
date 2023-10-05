<script setup lang="ts">
definePageMeta({
    name: "Домашняя"
})

const feedbackForm = useState("feedback_form_enabled", () => false)
</script>

<template>
    <main>
        <ClientStructureRotatingHero />
        <div class="blur-panel"></div>
    </main>
</template>

<style scoped lang="scss">
.blur-panel {
    backdrop-filter: blur(3rem);
    height: 3rem;
    translate: 0 -0px;
}
</style>