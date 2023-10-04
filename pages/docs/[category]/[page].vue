<script setup lang="ts">
import GlobalMarkdownForamatter from '~/components/global/MarkdownForamatter.vue';
definePageMeta({
    layout: "docs",
    login_message: "Для доступа к документации необходимо авторизоваться",
    middleware: [
        "auth",
        async (to, from) => {
            const { data } = await useAsyncData('middleware_validation', () => queryContent("docs", to.params.category as string, to.params.page as string).findOne())
            if (!data.value) { return abortNavigation() }
        }]
})
</script>

<template>
    <section id="docs-content-container">
        <GlobalMarkdownForamatter>
            <ContentDoc />
        </GlobalMarkdownForamatter>
    </section>
</template>

<style lang="scss">
#docs-content-container {
    min-width: calc(80% - 1rem);
    width: calc(100% - 16rem);
}</style>