<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui/dist/runtime/types'
import type { RouteLocationRaw } from '#vue-router';
definePageMeta({
    name: "Авторизация",
    layout: "admin",
    middleware: async () => {
        if (process.server) return
    const { public: { supabase_init_params } } = useRuntimeConfig()
        const { auth } = useSupabase(supabase_init_params as any)
        const { data: { user }, error } = await auth.getUser()
        if (user) { return navigateTo("/auth/logout") }
    }
})

const toast = useToast()

const { public: { supabase_init_params } } = useRuntimeConfig()
const { auth } = useSupabase(supabase_init_params as any)

const waitingForRes = ref(false)
const { query: { callback, message } } = useRoute()
const state: Ref<{
    email: string | undefined,
    password: string | undefined,
    error: string | undefined
}> = ref({
    email: undefined,
    password: undefined,
    error: undefined
})
const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.email) errors.push({ path: 'email', message: 'Обязательное поле' })
    if (!state.password) errors.push({ path: 'password', message: 'Обязательное поле' })
    return errors
}

async function submit(event: FormSubmitEvent<any>) {
    waitingForRes.value = true
    if (!state.value.email || !state.value.password) { return }
    const { data, error } = await auth.signInWithPassword({
        email: state.value.email,
        password: state.value.password
    })
    if (!error) {
        toast.add({
            id: 'auth_event',
            title: 'Вы успешно вошли',
            icon: 'i-heroicons-check-circle',
            timeout: 3000
        })
        navigateTo(callback ? callback as RouteLocationRaw : "/admin")
        return
    }
    waitingForRes.value = false
    console.warn(error.message)
    switch (error.message) {
        case "Invalid login credentials": {
            state.value.error = "Неверные логин или пароль"
        }
    }
}
</script>

<template>
    <div class="__login">
        <UForm :validate="validate" :state="state" @submit="submit">
            <div class="illustration">
                <Icon name="ic:twotone-lock-person" />
            </div>
            <h1>Вход</h1>
            <UAlert v-if="message && message !== 'undefined'" icon="i-heroicons-lock-closed" color="primary" variant="subtle" :title="(message as string)" />
            <hr style="border-color: rgba(var(--inverted-rgb), 0.1); width: 50%;">
            <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" />
            </UFormGroup>
            <UFormGroup label="Пароль" name="password" :error="state.error">
                <UInput v-model="state.password" type="password" />
            </UFormGroup>
            <UButton type="submit">
                <Icon v-if="waitingForRes" name="svg-spinners:3-dots-scale" />
                {{ !waitingForRes ? "Войти" : "" }}
            </UButton>
        </UForm>
    </div>
</template>

<style lang="scss">
.__login {
    display: flex;
    justify-content: center;
}
</style>

<style scoped lang="scss">

form {
    --form-width: 36rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    width: calc(var(--form-width) - 2rem);
    max-width: 90%;
    padding: 1rem;
    margin: 1rem min(5%, calc((100% - var(--form-width)) / 2));
    box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.5);
    border-radius: 1rem;
    .illustration {
        background-color: rgba(var(--inverted-rgb), 0.1);
        display: flex;
        justify-content: center;
        align-items: center;
        width: 4rem;
        border-radius: 4rem;
        aspect-ratio: 1;
        font-size: 2rem;
        svg {
            opacity: 0.5;
        }
    }
    h1 {
        font-weight: 700;
        font-size: 1.5rem;
    }
}
</style>