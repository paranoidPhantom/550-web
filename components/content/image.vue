<script setup lang="ts">
defineProps<{
    src: string;
}>()


const {
    public: { service_domain },
} = useRuntimeConfig();

</script>

<template>
    <img :src="`https://${service_domain}/fs/${src}`" alt="">
</template>