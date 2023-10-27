<script setup lang="ts">
const { error } = defineProps(["error"])
const suffix = ref()

onMounted(() => {
    switch (error.statusCode) {
        case 500: {
            suffix.value = "Серверная ошибка"
        }
    }
})
</script>

<template>
    <div class="__error">
        <h1>{{ error.statusCode }} {{ suffix ? `(${suffix})` : '' }}</h1>
        <h2>{{ error.message }}</h2>
        <UButton to="/" label="На главную"/>
    </div>
</template>

<style scoped lang="scss">
.__error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    height: 100vh;
    font-size: "Oswald", sans-serif;
    h1 {
        font-size: 4rem;
        font-weight: 700;
        color: rgb(var(--color-primary-DEFAULT));
    }
    h2 {
        font-size: 2rem;
        font-weight: 500;
    }
}
</style>