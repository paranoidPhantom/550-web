<script lang="ts" setup>
import type { _opacity } from '#tailwind-config/theme';

const scroll = reactive({
    px: 0
})

const updateScrollPos = () => {
    scroll.px = window.scrollY
}

onMounted(() => {
    window.addEventListener("scroll", updateScrollPos)
})

onBeforeUnmount(() => {
    if (window) {
        window.removeEventListener("scroll", updateScrollPos)
    }
})
</script>

<template>
    <Icon :style="{ opacity: 1 - scroll.px / 100 }" class="arrow" name="heroicons:arrow-small-down-solid"/>
</template>

<style lang="scss" scoped>
.arrow {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    font-size: 2rem;
}
</style>