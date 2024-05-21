<script setup lang="ts">
const toast = useToast();

const { auth } = useSupabaseClient();
const user = useSupabaseUser();

const items = computed(() => {
    let value: {
        [key: string]: any;
    }[][] = [
        [
            {
                label: user.value ? "Вы автраизованы:" : "Вы не авторизованы",
                slot: "account",
                disabled: true,
            },
        ],
    ];
    if (user.value) {
        value.push([
            {
                label: "Документация",
                icon: "i-heroicons-book-open",
                route: "/docs/base/intro",
            },
            {
                label: "Панель управления",
                icon: "i-heroicons-adjustments-horizontal-solid",
                route: "/admin",
            },
        ]);
    }
    const logout = user.value
        ? {
              label: "Выйти",
              icon: "i-heroicons-arrow-left-on-rectangle",
              click: async () => {
                  await auth.signOut();
                  toast.add({
                      id: "auth_event",
                      title: "Вы вышли",
                      icon: "i-heroicons-check-circle",
                      timeout: 3000,
                  });
                  navigateTo("/auth/login");
              },
          }
        : {
              label: "Войти",
              icon: "i-heroicons-arrow-right-on-rectangle",
              route: "/auth/login",
          };
    value.push([logout]);
    return value;
});

const avatarAlt = computed(() => {
    if (!user.value) {
        return;
    }
    const username = user.value.email?.split("@")[0];
    const names = username?.split(".");
    if (names) {
        if (names.length > 1) {
            const [firstName, lastName] = names;
            return `${firstName} ${lastName}`.toUpperCase();
        } else {
            return names[0];
        }
    }
});

const {
    public: { service_domain },
} = useRuntimeConfig();
</script>

<template>
    <ClientOnly>
        <UDropdown
            :items="items"
            :ui="{ item: { disabled: 'cursor-text select-text' } }"
            :popper="{ placement: 'bottom-start' }"
        >
            <UAvatar
                :icon="user ? '' : 'i-heroicons-user'"
                :alt="avatarAlt"
                :src="
                    user
                        ? `https://${service_domain}/fs/${user.user_metadata.pfp}`
                        : undefined
                "
            />
            <template #account="{ item }">
                <div class="text-left">
                    <p>
                        {{ item.label }}
                    </p>
                    <p
                        v-if="user"
                        class="w-44 text-xs text-ellipsis overflow-hidden whitespace-nowrap font-medium text-gray-900 dark:text-white"
                    >
                        [{{ user.user_metadata.username }}]<br />{{
                            user.email
                        }}
                    </p>
                </div>
            </template>
            <template #item="{ item }">
                <div
                    style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    "
                    @click="
                        () => {
                            if (item.route) {
                                navigateTo(item.route);
                            }
                        }
                    "
                >
                    <span class="truncate">{{ item.label }}</span>
                    <UIcon
                        :name="item.icon"
                        class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
                    />
                </div>
            </template>
        </UDropdown>
    </ClientOnly>
</template>
