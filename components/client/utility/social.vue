<script setup lang="ts">
const { socialLinks } = useAppConfig();
</script>

<template>
    <div class="__social">
        <UButton
            v-for="link in socialLinks"
            :to="link.link"
            variant="link"
            target="_blank"
            ><Icon :name="link.icon" style="font-size: 1.5rem"
        /></UButton>
    </div>
</template>

<style lang="scss">
.__social {
    display: flex;
    align-items: center;
    > a {
        transition: filter 0.3s;
        &:hover {
            filter: drop-shadow(0 0 5px rgb(var(--color-primary-DEFAULT)));
        }
    }
}
</style>
