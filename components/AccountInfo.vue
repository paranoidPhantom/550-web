<script setup lang="ts">
import type { DropdownItem } from '@nuxt/ui/dist/runtime/types';

const toast = useToast()

const { auth } = useSupabaseClient()
const { data: { session: sessionInitial }, error } = await auth.getSession()
const session = ref(sessionInitial)

const items = computed(() => {
    let value: {
        [key: string]: any
    }[][] = [
            [
                {
                    label: session.value ? 'Вы автраизованы:' : "Вы не авторизованы",
                    slot: 'account',
                    disabled: true
                }
            ],
        ]
    if (session.value) {
        value.push([
            {
                label: 'Документация',
                icon: 'i-heroicons-book-open',
                route: "/docs/base/intro"
            },
            {
                label: 'Панель управления',
                icon: 'i-heroicons-adjustments-horizontal-solid',
                route: "/admin"
            },
        ])
    }
    const logout = session.value ? {
        label: 'Выйти',
        icon: 'i-heroicons-arrow-left-on-rectangle',
        click: async () => {
            await auth.signOut()
            toast.add({
                id: 'auth_event',
                title: 'Вы вышли',
                icon: 'i-heroicons-check-circle',
                timeout: 3000
            })
            navigateTo("/auth/login")
        }
    } : {
        label: 'Войти',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        route: "/auth/login"
    }
    value.push([
        logout
    ])
    return value
})

auth.onAuthStateChange((event, updatedSession) => {
    session.value = updatedSession
})

const avatarAlt = computed(() => {
    if (!session.value) { return }
    const username = session.value.user.email?.split("@")[0]
    const names = username?.split(".")
    if (names) {
        if (names.length > 1) {
            const [firstName, lastName] = names
            return `${firstName} ${lastName}`.toUpperCase()
        } else {
            return names[0]
        }
    }
})

const user = useSupabaseUser()

const {
    public: { service_domain },
} = useRuntimeConfig();

</script>

<template>
    <ClientOnly>
        <UDropdown :items="(items as DropdownItem[][])" :ui="{ item: { disabled: 'cursor-text select-text' } }"
            :popper="{ placement: 'bottom-start' }">
            <UAvatar :icon="session ? '' : 'i-heroicons-user'" :alt="avatarAlt" :src="`https://${service_domain}/fs/${user.user_metadata.pfp}`" />
            <template #account="{ item }">
                <div class="text-left">
                    <p>
                        {{ item.label }}
                    </p>
                    <p
                        class="w-44 text-xs text-ellipsis overflow-hidden whitespace-nowrap font-medium  text-gray-900 dark:text-white">
                        [{{ session?.user.user_metadata.username }}]<br>{{ session?.user.email }}
                    </p>
                </div>
            </template>
            <template #item="{ item }">
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;"
                    @click="() => { if (item.route) { navigateTo(item.route) } }">
                    <span class="truncate">{{ item.label }}</span>
                    <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
                </div>
            </template>
        </UDropdown>
    </ClientOnly>
</template>