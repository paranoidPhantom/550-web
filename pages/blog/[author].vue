<script setup lang="ts">
const { params: { author } } = useRoute()
</script>

<template>
    <ClientStructureBlogPage :filters="{ match: 'username', value: author as string }" />
</template>