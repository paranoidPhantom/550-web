<script setup lang="ts">
const { website_name } = useAppConfig();
const {
    public: { service_domain },
} = useRuntimeConfig();

const route = useRoute();

watchEffect(() => {
    useHeadSafe({
        title: route.meta.name,
        titleTemplate: (titleChunk) => {
            return titleChunk
                ? `${titleChunk} | ${website_name}`
                : website_name;
        },
        htmlAttrs: {
            lang: "ru",
        },
        link: [
            {
                rel: "icon",
                type: "image/vnd.microsoft.icon",
                href: "/favicon.ico",
            },
        ],
    });
    useSeoMeta({
        ogTitle: route.meta.name || website_name,
        ogUrl: `https://${service_domain}`,
    });
});
</script>

<template>
    <Head>
        <Meta property="og:site_name" :content="website_name" />
    </Head>
    <NuxtLoadingIndicator color="rgb(var(--color-primary-DEFAULT))" />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <UNotifications />
    <LazySearchPallete />
    <LazyPreviewInfo />
</template>
