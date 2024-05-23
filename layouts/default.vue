<script setup lang="ts">
const { push } = useRouter();
defineShortcuts({
    shift_a: {
        handler: () => push("/admin"),
    },
});
</script>

<template>
    <div class="__user">
        <ClientStructureHeader />
        <main>
            <slot />
        </main>
        <LazyClientUtilityFeedback />
        <LazyClientUtilityVisImpairment />
        <ClientStructureFooter />
    </div>
</template>

<style>
.__user {
    font-family: "Inter", sans-serif;
}
</style>
