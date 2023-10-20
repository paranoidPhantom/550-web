<script setup lang="ts">
interface article {
    route: string;
    title?: string;
    description?: string;
    created_at: string;
    thumbnail: string;
    link_text: string;
}

defineProps<{
    news: article[];
}>()
</script>

<template>
    <div class="__news-list">
        <article v-for="article in news">
            <img :src="article.thumbnail" alt="Новость">
            <h1 v-if="article.title">{{ article.title }}</h1>
            <USkeleton v-else class="title-sk"/>
            <p v-if="article.description">{{ article.description }}</p>
            <USkeleton v-else class="description-sk"/>
            <UButton :to="article.route" :label="article.link_text || 'Подробнее'"/>
        </article>
    </div>
</template>

<style scoped lang="scss">
.__news-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 0.5rem;
    article {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 20rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        outline: 1px solid rgb(var(--color-primary-DEFAULT) / 0.75);
        img {
            border-radius: 0.25rem;
        }
        h1 {
            font-size: 1.5rem;
            height: 2rem;
        }
        p {
            height: 1.5rem;
        }
        .title-sk {
            height: 2rem;
            width: 15rem;
        }
        .description-sk {
            height: 1.5rem;
            width: 10rem;
        }
    }
}
</style>