<script setup lang="ts">
import GlobalColorModeSwitch from "@/components/global/ColorModeSwitch.vue"
import GlobalAccountInfo from "@/components/global/AccountInfo.vue"

</script>

<template>
    <header>
        <div class="title" @click="navigateTo('/admin')">
            <Icon name="ic:twotone-lock-person" />
        </div>

        <div class="edge">
            <GlobalColorModeSwitch />
            <GlobalAccountInfo />
        </div>
    </header>
    <div class="header-placeholder" />
</template>

<style scoped lang="scss">
header {
    z-index: 1;
    height: 3rem;
    position: fixed;
    border-bottom: 1px solid rgba(var(--inverted-rgb), 0.1);
    backdrop-filter: blur(8px);
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;

    .title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;

        svg {
            width: 1.5rem;
            font-size: 1.2rem;
        }
    }
    .edge {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
}

.header-placeholder {
    height: 3rem;
    opacity: 0;
    pointer-events: none;
}</style>