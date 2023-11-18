<script setup lang="ts">
defineProps<{
    src: string;
}>()

const { express_server_port } = useAppConfig();

const {
    public: { service_domain },
} = useRuntimeConfig();

const express_server = `http://${service_domain}:${express_server_port}/`;
</script>

<template>
    <img :src="`${express_server}${src}`" alt="">
</template>