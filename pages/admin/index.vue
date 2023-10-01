<script setup lang="ts">
definePageMeta({
    name: "Панель управления",
    layout: "admin",
    middleware: "auth",
    login_message: "Для доступа к панели управления необходимо авторизоваться"
})
import GlobalFolderViewer from '@/components/global/FolderViewer.vue';

</script>

<template>
    <main>
        <GlobalFolderViewer bucket="docs" root="test" />
    </main>
</template>

<style scoped lang="scss">
main {
    padding: 1rem;
}
</style>