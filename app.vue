<script setup lang="ts">
const { website_name } = useAppConfig();

const route = useRoute();

watchEffect(() => {
    useHeadSafe({
        title: route.meta.name,
        titleTemplate: (titleChunk) => {
            return titleChunk
                ? `${titleChunk} | ${website_name}`
                : website_name;
        },
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
    <SearchPallete />
</template>
