<script setup lang="ts">
definePageMeta({
    name: "Домашняя",
});

const feedbackForm = useState("feedback_form_enabled", () => false);
const visImpairment = useState("vis_impairment_enabled", () => false);

const colorMode = useColorMode();

interface bubble {
    text: string;
    x_pos?: number;
    progress?: number;
    lifetime_offset?: number;
    id: number;
}

const bubble_config: {
    spawn_rate: number;
    lifetime: number;
} = {
    spawn_rate: 2,
    lifetime: 10,
};

const { home_bubble_text } = useAppConfig();

const bubbles: Ref<bubble[]> = ref([]);
const bubbleIndex = ref(0);

let bubblesCreated = 0;

const spawnBubble = () => {
    bubblesCreated++;
    const index = bubbleIndex.value;
    bubbleIndex.value++;
    if (bubbleIndex.value > home_bubble_text.length - 1) bubbleIndex.value = 0;
    const pushing = { text: home_bubble_text[index] } as bubble;
    pushing.progress = 0;
    pushing.id = bubblesCreated;
    bubbles.value.push(pushing);
    setTimeout(() => {
        const last_index = bubbles.value.length - 1;
        bubbles.value[last_index].progress = 1;
        bubbles.value[last_index].x_pos = Math.random();
        bubbles.value[last_index].lifetime_offset = (Math.random() - 0.5) * 5;
    }, 10);
    setTimeout(() => {
        bubbles.value.shift();
    }, bubble_config.lifetime * 1000);
};

onMounted(() => {
    spawnBubble();
    setInterval(spawnBubble, bubble_config.spawn_rate * 1000);
});
</script>

<template>
    <div class="__home" :class="{ dark: colorMode.value === 'dark' }">
        <ClientStructureDissapearingArrow />
        <section id="primary-hero">
            <div class="primary">
                <h1 class="title">
                    <span class="simple">Школа № 550</span><br><span
                        class="full"
                        >Школа<br />информационных<br />технологий</span
                    >
                </h1>
                <p>
                    Государственное бюджетное общеобразовательное учреждение
                    средняя общеобразовательная школа №550 "Школа информационных
                    технологий" расположена в Центральном районе, в историческом
                    центре города.
                </p>
                <div class="buttons">
                    <UButton>Расписание</UButton>
                    <UButton>Вопросы и ответы</UButton>
                    <UButton class="vis-impairment-btn" @click="visImpairment = !visImpairment" variant="soft" icon="i-heroicons-eye-20-solid">Для пользователей с нарушением зрения</UButton>
                </div>
            </div>
            <div class="render-container">
                <div
                    class="bubble"
                    v-for="(bubble, index) in bubbles"
                    :key="bubble.id"
                    :style="{
                        '--lifetime': `${bubble_config.lifetime}s`,
                        '--x-pos': bubble.x_pos,
                        '--progress': bubble.progress,
                    }"
                    :class="{ 'next-in-line': !(index > 0) }"
                >
                    <p>{{ bubble.text }}</p>
                </div>
                <img
                    class="render"
                    src="/images/monitor.webp"
                    alt="Картинка Монитора"
                />
            </div>
        </section>
        <ClientStructureNewsBlock />
        <UButton @click="feedbackForm = true">Открыть форму госуслуг (вместо кнопки будет банер)</UButton>
    </div>
</template>

<style scoped lang="scss">
.__home {
    #primary-hero {
        display: flex;
        justify-content: space-between;
        height: calc(100vh - 4rem);
        background: linear-gradient(
            rgba(0, 0, 0, 0),
            rgba(var(--color-primary-DEFAULT) / 0.5),
            rgba(var(--color-primary-DEFAULT) / 0.8)
        );
        box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.12);
        .primary {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding: 5% 10%;
            flex-shrink: 3;
            .title {
                font-size: 2.5rem;
                font-weight: 700;
                line-height: 120%;
                .simple {
                    color: rgb(var(--color-primary-500));
                }
                .full {
                    color: rgb(var(--color-slate-800));
                }
            }
            p {
                opacity: 0.8;
                font-size: 1.25rem;
            }
            .buttons {
                display: flex;
                column-gap: 2rem;
                row-gap: 0.5rem;
                flex-wrap: wrap;
                > * {
                    padding-left: 1rem;
                    padding-right: 1rem;
                    max-width: 100%;
                }
            }
        }
        .render-container {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            user-select: none;
            pointer-events: none;
            width: 60%;
            overflow: hidden;
            .render {
                width: 70%;
                aspect-ratio: 1;
                position: absolute;
                z-index: 0
            }
            .bubble {
                z-index: 1;
                transition: all var(--lifetime) ease-in-out;
                --progress: 0;
                position: absolute;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: rgba(var(--normal-rgb), 0.3);
                width: fit-content;
                padding: 0.5rem 2rem;
                backdrop-filter: blur(0.5rem);
                //
                right: calc((100% - 15rem) * var(--x-pos) + 10rem);
                translate: 50% 0;
                bottom: calc(140% * var(--progress) - 20%);
                //
                scale: calc(0.75 + var(--progress) * 0.25);
                border-radius: 1rem;
                box-shadow: 0 0 1rem rgba(var(--normal-rgb), 0.8);
                p {
                    text-align: center;
                }
                &.next-in-line {
                    transition: all 2s;
                    scale: 0.75;
                    box-shadow: 0 0 1rem rgb(var(--color-primary-DEFAULT));
                    opacity: 0.5;
                }
            }
        }
    }

    &.dark {
        #primary-hero {
            box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.5);
        }
    }
}

@media (max-width: 800px) {
    .__home {
        #primary-hero {
            border-radius: 0 0 2rem 2rem;
            .primary {
                max-width: 100vw;
                padding: 1rem;
                justify-content: center;
                .title {
                    font-size: 2rem;
                }
                .buttons {
                    justify-content: space-between;
                    > * {
                        padding-left: 0.5rem;
                        padding-right: 0.5rem;
                        width: 45%;
                        &.vis-impairment-btn {
                            flex-grow: 2;
                        }
                    }
                }
            }
            .render-container {
                display: none;
            }
        }
    }
}
</style>
