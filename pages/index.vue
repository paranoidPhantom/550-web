<script setup lang="ts">
definePageMeta({
    name: "Домашняя",
});

const feedbackForm = useState("feedback_form_enabled", () => false);
const visImpairment = useState("vis_impairment_enabled", () => false)
</script>

<template>
    <div class="__home">
        <section class="hero">
            <ClientStructureRotatingHero />
        </section>
        <UButton @click="visImpairment = !visImpairment">test</UButton>
        <ClientUtilityVisImpairment />
        <UButton @click="feedbackForm = true">Открыть форму</UButton>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
    </div>
</template>

<style scoped lang="scss">
.hero {
    border-bottom: 1px solid rgba(var(--inverted-rgb), 0.1);
}
</style>