<script setup lang="ts">
definePageMeta({
    layout: "docs",
    middleware: async (from, to) => {
        const { data } = await useAsyncData('middleware_validation', () => queryContent("docs", to.params.category as string, to.params.page as string).findOne())
        if (!data.value) { return abortNavigation() }
    }
})
</script>

<template>
    <section id="docs-content-container">
        <ContentDoc />
    </section>
</template>

<style lang="scss">
#docs-content-container {
    min-width: calc(80% - 1rem);
    width: calc(100% - 16rem);
    > div {
        > * {
            margin: 1rem 0;
        }
        > h1 {
            font-size: xx-large;
        }
        > h2 {
            font-size: x-large;
        }
        > h3 {
            font-size: larger;
        }
        > hr {
            opacity: 0.15;
            border-color: rgb(var(--inverted-rgb))
        }
        > pre {
            overflow: hidden;
            border-radius: 0.5rem;
            padding: 0.5rem 0;
            > code {
                > .line {
                    padding: 0 0.5rem;
                    &.highlight {
                        filter: drop-shadow(0 0 0.2rem rgba(var(--inverted-rgb), 0.5));
                    }
                }
            }
        }
    }
}
</style>