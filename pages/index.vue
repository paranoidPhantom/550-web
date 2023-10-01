<script setup lang="ts">
definePageMeta({
    name: "Домашняя"
})

const feedbackForm = useState("feedback_form_enabled", () => false)
</script>

<template>
    <main>
        <NuxtLink to="/docs/base/intro">Go to docs</NuxtLink>
        <UButton @click="feedbackForm = true">Test</UButton>
    </main>
</template>

<style scoped lang="scss">

</style>