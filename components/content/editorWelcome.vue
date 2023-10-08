<script setup lang="ts">
defineProps<{
    params: {
        name: string,
        route: string
    }
}>()
</script>

<template>
    <div class="__editor-welcome">
        <h1>Вы создали новую страницу с названием "{{ params.name }}"!</h1>
        <p>В окне слева вы видите "код" страницы в формате Markdown.</p>
        <UButton :to="params.route" target="_blank" color="white">Нажмите чтобы посмотреть страницу</UButton>
    </div>
</template>

<style scoped lang="scss">
.__editor-welcome {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    h1 {
        font-size: 2rem;
        font-weight: 600;
    }
    p {
        font-weight: 300;
    }
}
</style>