<script setup lang="ts">
definePageMeta({
    name: "Авторизация"
})

const { data } = await useFetch('/api/auth', {
    method: "post",
    body: ""
})

</script>

<template>

</template>

<style scoped lang="scss">

</style>