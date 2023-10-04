<script setup lang="ts">
const textColor = ref(`255,255,255`)

const randomizeColor = () => {
    const [r, g, b] = [Math.random() * 255, Math.random() * 255, Math.random() * 255]
    textColor.value = `${r}, ${g}, ${b}`
}
</script>

<template>
    <div class="component">
        <p :style="{ color: `rgb(${textColor})` }">Это тестовый компонент, такие вот специальные компоненты могут быть чем угодно!</p>
        <UButton class="btn" @click="randomizeColor">Поменять цвет</UButton>
        <div class="contents">
            <slot />
        </div>
        <p>Возможности безграничны!</p>
    </div>
</template>

<style scoped lang="scss">
.btn {
    transition: all 0.3s;
}
.btn:active {
    scale: 1.1;
    translate: 1rem 0;
}
</style>