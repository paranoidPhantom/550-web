<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()

const scroll = reactive({
    px: 0
})

const updateScrollPos = () => {
    scroll.px = window.scrollY
}

const windowWidth = 

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
    <Icon :style="{ opacity: 1 - scroll.px / 100 }" class="arrow" :name="width > 800 ? 'heroicons:arrow-small-down-solid' : 'ic:baseline-swipe-up'"/>
	<div v-if="width <= 800" class="round-hero-fade" :style="{ opacity: 1 - scroll.px / 100 }"></div>
</template>

<style lang="scss" scoped>
.arrow {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    font-size: 2rem;
}

.round-hero-fade {
	position: absolute;
	pointer-events: none;
	inset: 0;
	top: -6rem;
	border-radius: 2.05rem;
	box-shadow: 0 0 2rem 2rem rgba(var(--color-primary-DEFAULT)/0.8);
	z-index: 2;
}

@media (max-width: 800px) {
	.arrow {
		left: unset;
		width: 100%;
	    bottom: calc(20vh - 8rem);
	}
}
</style>