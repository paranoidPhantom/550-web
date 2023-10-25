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
}>();
</script>

<template>
    <div class="__news-list">
        <article v-for="article in news">
            <img :src="article.thumbnail" alt="Новость" />
            <h1 v-if="article.title">{{ article.title }}</h1>
            <USkeleton v-else class="title-sk" />
            <p class="description" v-if="article.description">{{ article.description }}</p>
            <USkeleton v-else class="description-sk" />
            <div class="details">
                <p class="date">{{ useFormatedDate(article.created_at) }}</p>
                <UButton
                    class="link"
                    variant="link"
                    trailing-icon="i-heroicons-arrow-small-right"
                    :to="article.route"
                    :label="article.link_text || 'Подробнее'"
                />
            </div>
        </article>
    </div>
</template>

<style scoped lang="scss">
.__news-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
    article {
        transition: all 0.5s ease-in-out;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        width: 20rem;
        padding: 1rem;
        border-radius: 0.8rem;
        height: fit-content;
        outline: 1px solid rgba(var(--inverted-rgb), 0.1);
        box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
        img {
            border-radius: 0.5rem;
        }
        h1 {
            font-size: 1.5rem;
        }
        .description {
            font-size: 1rem;

        }
        .title-sk {
            height: 2rem;
            width: 15rem;
        }
        .description-sk {
            height: 1.5rem;
            width: 10rem;
        }
        .details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .date {
                font-size: 0.8rem;
                opacity: 0.5;
            }
            .link {
                color: inherit;
            }
        }
        &:hover {
            box-shadow: 0 0 2rem rgb(var(--color-primary-500) / 0.8);
            background-color: rgb(var(--color-primary-500));
            color: white;
        }
    }
}

@media (max-width: 800px) {
    .__news-list {
        padding: 1rem;
        article {
            width: 100%;
        }
    }
}
</style>
