<script setup lang="ts">
import { useFormatedDate } from "@/utils/useFormatedDate";
import { SupabaseClient } from "@supabase/supabase-js";
definePageMeta({
    name: "Панель управления",
    layout: "admin",
    middleware: "auth",
    login_message: "Для доступа к панели управления необходимо авторизоваться",
});

const links = [
    {
        label: "Страницы",
        detail: "Список страниц с контентом",
        icon: "i-heroicons-list-bullet-20-solid",
        perm_required: "can_edit_content",
        href: "/admin/pages",
    },
    {
        label: "Редактор",
        detail: "Редактирование страниц с контентом",
        icon: "i-heroicons-pencil-square-solid",
        perm_required: "can_edit_content",
        href: "/admin/editor",
    },
    {
        label: "Блог",
        detail: "Редактирование личного блога",
        icon: "i-heroicons-chat-bubble-bottom-center-text",
        perm_required: "can_edit_blog",
        href: "/admin/blog",
    },
    {
        label: "Пользователи",
        detail: "Список пользователей и их редактирование",
        icon: "i-heroicons-user-group-20-solid",
        perm_required: "can_edit_users",
        href: "/admin/users",
    },
];

const supabase = useSupabaseClient()

const perms = ref();
const user_email = ref()

onMounted(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    user_email.value = user?.email
    perms.value = user?.app_metadata;
})
</script>

<template>
    <div class="__admin-home">
        <template v-for="link in links">
            <UTooltip
                key="link.href"
                v-if="
                    (perms && perms[link.perm_required] === true) ||
                    user_email === 'root@ort'
                "
                :text="link.detail"
            >
                <UButton
                    :icon="link.icon"
                    :label="link.label"
                    :to="link.href"
                    size="xl"
                    color="white"
                />
            </UTooltip>
        </template>
    </div>
</template>

<style scoped lang="scss">
.__admin-home {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: calc(100vh - 3rem);
    gap: 1rem;
    padding: 1rem;
}
</style>
