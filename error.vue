<script setup lang="ts">
const { error } = defineProps(["error"]);
const suffix = ref();

switch (error.statusCode) {
    case 500: {
        suffix.value = "Серверная ошибка";
    }
}
</script>

<template>
    <div class="__error">
        <div class="error-wrapper">
            <img src="/images/error.svg" alt="broken robot">
            <h1>{{ error.statusCode }} {{ suffix ? `(${suffix})` : "" }}</h1>
            <h2>{{ error.message }}</h2>
            <UButton to="/" label="На главную" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@keyframes gradient {
	0% {
		background-position: 0% 50%;
	}
	100% {
		background-position: 100% 50%;
	}
}
@keyframes text {
    5% {
        color: rgb(var(--color-primary-DEFAULT));
    }
	50% {
        color: rgb(var(--normal-rgb));
	}
    95% {
        color: rgb(var(--color-primary-DEFAULT));
    }
}

.__error {
    --anim-time: 5s;
	background: linear-gradient(-45deg, rgba(var(--normal-rgb), 0.5), rgba(var(--normal-rgb)), rgba(var(--normal-rgb)), rgba(var(--color-primary-DEFAULT)), rgba(var(--normal-rgb)), rgba(var(--normal-rgb)), rgba(var(--normal-rgb)));
	background-size: 300% 300%;
	animation: gradient var(--anim-time) ease-in-out alternate infinite;
	height: 100vh;
    position: relative;
    img {
        width: 50vh;
    }
    h1 {
        font-size: 4rem;
        font-weight: 700;
        color: rgb(var(--color-primary-DEFAULT));
	    animation: text var(--anim-time) ease-in-out infinite;
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
        font-size: "Oswald", sans-serif;
        backdrop-filter: blur(5rem);
        z-index: 3;
    }
}
</style>
