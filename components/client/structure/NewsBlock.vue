<script setup lang="ts">
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";
const { frontpage_news: slidesList } = useAppConfig();

interface article {
    background: string;
    title: {
        data: string | undefined;
        type: string;
    };
    subtitle: string;
    content: string;
    short_title: string;
    article_url: string;
    id: number;
    link_text?: string;
}

const supabase = useSupabaseClient();

const slidesReactive: Ref<article[]> = ref([]);

let entries: any[] = []

const refreshSlides = async () => {
    let { data: db_response } = (await supabase
        .from("news")
        .select("*, content (content)")
        .order("created_at", { ascending: false })
        .limit(4)) as { data: any[] };
    entries = db_response
    let result: any[] = [];
    for (const i in entries) {
        if (Object.prototype.hasOwnProperty.call(entries, i)) {
            const data = entries[i];
            const { data: content } = await parseMarkdown(data.content.content);
            if (data && content) {
                result.push({
                    background: data["thumbnail"],
                    title: {
                        data: content["title_image"]
                            ? content["title_image"]
                            : content["title"],
                        type: content["title_image"] ? "image" : "text",
                    },
                    subtitle: content["subtitle"],
                    short_title: content["topic"],
                    content: content["description"],
                    article_url: `${data.route}`,
                    id: parseInt(i),
                });
            }
        }
    }
    slidesReactive.value = result;
};

await refreshSlides();

const currentIndex = ref(0);
const currentData = computed(() => {
    currentIndex.value = currentIndex.value % entries.length;
    const gotObject = slidesReactive.value[currentIndex.value];
    gotObject.id = currentIndex.value;
    return gotObject;
});

let Timeout: NodeJS.Timeout | undefined;

const setIndex = (index: number) => {
    currentIndex.value = index;
    if (Timeout) {
        clearTimeout(Timeout);
        Timeout = undefined;
    }
    Timeout = setTimeout(() => {
        setIndex(currentIndex.value + 1);
    }, 5200);
};

setIndex(0);

onMounted(() => {
    setIndex(0);
    if (entries.length > 1) {
        setTimeout(() => {
            setIndex(1);
        }, 100);
    }
});
</script>

<template>
    <section id="news-container">
        <div class="hover-overlay"></div>
        <Transition name="image" mode="out-in">
            <img
                :key="currentData.id"
                class="background"
                :src="currentData.background"
                :alt="currentData.short_title"
            />
        </Transition>
        <Transition name="primary" mode="out-in">
            <img
                v-if="currentData.title.type === 'image'"
                :key="(currentData.id || 0) + 1"
                class="primary-image"
                :src="currentData.title.data"
            />
        </Transition>
        <Transition name="primary" mode="out-in">
            <h1
                v-if="currentData.title.type === 'text'"
                :key="currentData.id"
                class="title"
            >
                {{ currentData.title.data }}
            </h1>
        </Transition>
        <Transition name="secondary" mode="out-in">
            <div :key="currentData.id" class="secondary-content">
                <h2 class="subtitle">{{ currentData.subtitle }}</h2>
                <p class="content">{{ currentData.content }}</p>
                <NuxtLink
                    v-if="currentData.article_url"
                    :to="currentData.article_url"
                >
                    <UButton
                        icon="i-heroicons-book-open"
                        :label="currentData.link_text || 'Подробнее'"
                        variant="link"
                        class="action"
                    />
                </NuxtLink>
            </div>
        </Transition>
        <div class="cards" v-if="slidesReactive.length > 1">
            <div
                class="card"
                v-for="(data, index) in slidesReactive"
                :tabindex="index"
                @click="setIndex(index)"
                :style="{
                    height: `calc(${100 / slidesReactive.length}% - ${
                        4 / slidesReactive.length
                    }rem)`,
                }"
            >
                <img class="background" :src="data.background" />
                <div
                    class="overlay"
                    :class="{ current: index === currentIndex }"
                ></div>
                <div class="data">
                    <p class="title">{{ data.short_title || data.title.data }}</p>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
#news-container {
    margin: 2rem 5%;
    width: calc(90%);
    border-radius: 1rem;
    box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.8);
    color: white;
    background-size: cover;
    background-position: center;
    height: calc(45vh);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem;
    overflow: hidden;
    position: relative;

    .primary-image {
        width: 50%;
        object-fit: contain;
    }

    .cards {
        position: absolute;
        right: 5%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;

        .card {
            position: relative;
            user-select: none;
            background-color: rgb(0, 0, 0);
            border-radius: 8px;
            aspect-ratio: 2.5;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.8);
            overflow: hidden;

            .overlay {
                position: absolute;
                width: 0;
                height: 100%;
                left: 0;
                top: 0;
                border-radius: inherit;
                backdrop-filter: blur(0.1rem) brightness(0.4);
                transition-property: width, opacity;
                transition-duration: 0.3s, 0.3s;
                transition-timing-function: linear;
                opacity: 0;
            }

            .overlay.current {
                width: 100%;
                opacity: 1;
                transition-property: width, opacity;
                transition-duration: 5s, 0.3s;
                transition-timing-function: linear;
            }

            .background {
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                object-fit: cover;
                border-radius: inherit;
                filter: brightness(0.6);
            }

            .data {
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                z-index: 2;
                display: flex;
                justify-content: center;
                align-items: center;

                .title {
                    font-size: 1rem;
                    width: 100%;
                    flex-grow: 2;
                    text-align: center;
                    font-weight: 800;
                }
            }
        }

        .card:hover {
            transform: scale(1.1);
        }
    }

    > .background {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        object-fit: cover;
        z-index: -2;
        border-radius: inherit;
    }

    > .title {
        font-size: 2.5rem;
        max-width: calc(75% - 4rem);
        font-weight: 500;
        text-transform: uppercase;
        transition: margin-left 0.3s;
    }

    .subtitle {
        font-weight: 100;
        margin: 1rem 0;
        transition: margin-left 0.3s 0.1s;
    }

    .content {
        opacity: 0.5;
        transition: opacity 0.3s;
        transition: margin-left 0.3s 0.2s;
        max-width: 60%;
    }

    .action {
        margin-top: 1rem;
        transition: all 0.3s;
        transition: margin-left 0.3s 0.3s;
        margin: 0 !important;
    }

    > .hover-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        object-fit: cover;
        z-index: -1;
        border-radius: inherit;
        transition: all 0.3s;
        backdrop-filter: brightness(0.5);
    }

    &:hover {
        .content {
            opacity: 1;
            margin-left: 1rem;
        }

        > .title {
            margin-left: 1rem;
        }

        .subtitle {
            margin-left: 1rem;
        }

        .action {
            margin-left: 1rem;
        }

        > .hover-overlay {
            backdrop-filter: brightness(0.4);
        }
    }
}

/* PRIMARY */
.primary-enter-active,
.primary-leave-active {
    transition: all 0.3s 0.1s;
}

.primary-enter-from {
    transform: translateX(150px);
    opacity: 0;
}

.primary-leave-to {
    transform: translateX(-30px);
    opacity: 0;
}

/* SECONDARY */
.secondary-enter-active,
.secondary-leave-active {
    transition: all 0.2s 0.1s;
}

.secondary-enter-from {
    transform: translateX(30px);
    opacity: 0;
}

.secondary-leave-to {
    transform: translateX(-30px);
    opacity: 0;
}

/* IMAGE */
.image-enter-active,
.image-leave-active {
    transition: all 0.2s;
}

.image-enter-from {
    transform: translateX(30px);
    opacity: 0;
}

.image-leave-to {
    transform: translateX(-30px);
    opacity: 0;
}

@media (max-width: 750px) {
    .cards {
        display: none !important;
    }

    #news-container {
        height: auto;
        min-height: calc(35vh);
        padding: 1.5rem 3rem;
        align-items: center;

        > .title {
            font-size: 1.5rem;
            max-width: 100%;
            text-align: center;
        }

        .subtitle {
            font-weight: 100;
            margin: 1rem 0;
            text-align: center;
        }

        .secondary-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .content {
            display: none;
        }

        > .hover-overlay {
            backdrop-filter: brightness(0.5);
        }

        &:hover {
            > .title {
                margin-left: 0;
            }

            .subtitle {
                margin-left: 0;
            }

            .action {
                margin-left: 0;
            }
        }
    }
}
</style>
