<script setup lang="ts">
const { website_name } = useAppConfig()

const route = useRoute()

watchEffect(() => {
    useHeadSafe({
        title: route.meta.name,
        titleTemplate: (titleChunk) => {
            return titleChunk ? `${titleChunk} | ${website_name}` : website_name;
        }
    })
})
</script>

<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <UNotifications />
</template>