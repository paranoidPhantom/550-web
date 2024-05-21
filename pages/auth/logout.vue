<script setup lang="ts">
definePageMeta({
    name: "Выход",
    layout: "admin",
});

const toast = useToast();

const { auth } = useSupabaseClient();

const logOut = async () => {
    await auth.signOut();
    navigateTo("/auth/login");
    toast.add({
        id: "auth_event",
        title: "Вы вышли",
        icon: "i-heroicons-check-circle",
        timeout: 3000,
    });
};
</script>

<template>
    <section class="__logout">
        <div id="logout">
            <h1>Вы авторизованы!</h1>
            <hr
                style="border-color: rgba(var(--inverted-rgb), 0.1); width: 90%"
            />
            <div class="illustration">
                <UIcon name="ic:round-log-out" />
            </div>
            <UButton color="red" @click="logOut">Выйти</UButton>
            <hr
                style="border-color: rgba(var(--inverted-rgb), 0.1); width: 70%"
            />
            <div class="illustration">
                <UIcon name="line-md:arrow-left" />
            </div>
            <UButton @click="$router.go(-1)" variant="soft">Назад</UButton>
        </div>
    </section>
</template>

<style scoped lang="scss">
.__logout {
    display: flex;
    justify-content: center;
}

#logout {
    --frame-width: 20rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    width: calc(var(--frame-width) - 2rem);
    max-width: 90%;
    padding: 1rem;
    margin: 1rem min(5%, calc((100% - var(--frame-width)) / 2));
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
        font-weight: 400;
        font-size: 1.5rem;
    }
}
</style>
