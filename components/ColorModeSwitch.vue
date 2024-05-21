<script setup lang="ts">
const darkModeOn = ref();
const colorMode = useColorMode();
const init = ref(true);
const buttonDisabled = ref(false);

onMounted(() => {
    init.value = true;
    if (colorMode.preference === "system") {
        darkModeOn.value = colorMode.value === "dark";
    } else {
        darkModeOn.value = colorMode.preference === "dark";
    }
});

watchEffect(() => {
    if (darkModeOn.value) {
    }
    if (init.value === true) {
        init.value = false;
        return;
    }
    buttonDisabled.value = true;
    colorMode.preference = darkModeOn.value ? "dark" : "light";
    setTimeout(() => {
        buttonDisabled.value = false;
    }, 1000);
});
</script>

<template>
    <ClientOnly>
        <div class="color-mode-switch">
            <TransitionGroup name="dark-mode-icon">
                <UIcon v-if="darkModeOn" name="line-md:moon-rising-alt-loop" />
                <UIcon v-else name="line-md:sun-rising-loop" />
            </TransitionGroup>
            <UToggle :disabled="buttonDisabled" v-model="darkModeOn" />
        </div>
        <template #fallback>
            <UIcon name="svg-spinners:3-dots-scale" />
        </template>
    </ClientOnly>
</template>

<style scoped lang="scss">
.color-mode-switch {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    position: relative;
}

.dark-mode-icon-leave-to {
    opacity: 0;
    translate: 0 -100%;
}

.dark-mode-icon-leave-active {
    transition: all 0.7s;
    position: absolute;
}
</style>
