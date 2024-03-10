<script setup lang="ts">
import { useMouse } from "@vueuse/core";

const { error } = defineProps(["error"]);
const suffix = ref();
const comment = ref();

switch (error.statusCode) {
    case 500: {
        suffix.value = "Серверная ошибка";
    }
}

switch (error.statusCode) {
    case 404: {
        comment.value = "Страница, которую вы ищите, не существует. Возможно, она была перемещена или удалена";
    }
}

const { x, y } = useMouse();

const sensetivity = -100;

const displacement = computed(() => {
    if (!document) return { x: 0, y: 0 };
    return {
        x: (x.value - document.documentElement.clientWidth / 2) / sensetivity,
        y: (y.value - document.documentElement.clientHeight / 2) / sensetivity,
    };
});
</script>

<template>
    <div class="__error">
        <div class="creative-block">
            <img
                :style="`translate: ${displacement.x}% ${displacement.y}%;`"
                class="a hidden sm:block"
                src="/images/question_mark.svg"
            />
            <img
                :style="`translate: ${displacement.x}% ${displacement.y}%;`"
                class="b"
                src="/images/question_mark.svg"
            />
        </div>
        <div class="error-wrapper">
            <h1 class="font-bold">
                {{ error.statusCode }} {{ suffix ? `(${suffix})` : "" }}
            </h1>
            <h2>{{ error.message }}</h2>
            <p class="text-center opacity-50">{{ comment }}</p>
            <UButton size="lg" to="/" label="На главную" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.__error {
    height: 100vh;
    position: relative;
    h1 {
        font-size: 4rem;
        font-weight: 700;
        color: rgb(var(--color-primary-DEFAULT));
    }
    h2 {
        font-size: 2rem;
        font-weight: 500;
    }
    .error-wrapper {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        z-index: 3;
    }
    .creative-block {
        position: fixed;
        overflow: hidden;
        inset: 0;
        img {
            position: absolute;
            &.a {
                left: 10%;
                top: 500px;
                rotate: -20deg;
                scale: 0.7;
            }
            &.b {
                right: 10%;
                top: 200px;
            }
        }
    }
}
</style>
