<script setup lang="ts">
definePageMeta({
    name: "Редактор блога",
    layout: "admin",
    middleware: "auth",
    login_message: "Для доступа к редактору блога необходимо авторизоваться",
});
const user = useSupabaseUser()
</script>

<template>
    <ClientStructureBlogPage :filters="{ match: 'username', value: user?.user_metadata.username as string }" author-mode />
</template>