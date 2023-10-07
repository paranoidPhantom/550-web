<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";

const { metaSymbol } = useShortcuts();

definePageMeta({
    name: "Редактор",
    layout: "admin",
    // middleware: "auth"
});

const supabase = useSupabase();
const toast = useToast();

const input = ref("");
const initialInput = ref(input.value);
const preview = computedAsync(async () => {
    let initialText = input.value;
    const tree = await parseMarkdown(initialText);
    return tree;
}, null);

// Handling content_pages reactivity
const content_pages: Ref<page[]> = ref([]);
const { data, error } = await supabase.from("content").select();
content_pages.value = data as page[];

interface page {
    content: string;
    created_at: string;
    name: string;
    route: string;
}

const contentRealtime = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "content",
        },
        (payload) => {
            content_pages.value.forEach((page: page, index: number) => {
                if (page.route === (payload.new as page).route) {
                    content_pages.value[index] = payload.new as unknown as page;
                }
            });
        }
    )
    .subscribe();

const current_route = ref();
const content_routes_list = computed(() => {
    let result: {
        label: string;
        href: string;
    }[] = [];
    content_pages.value.forEach((page: page) => {
        result.push({
            label: page.name,
            href: page.route,
        });
    });
    current_route.value = result[0];
    return result;
});
// Done with content_pages

watchEffect(async () => {
    if (current_route.value) {
        const request_href = current_route.value.href;
        const { data, error } = await supabase
            .from("content")
            .select(request_href)
            .single();
        input.value = (data as unknown as page).content;
        initialInput.value = input.value;
    }
});

const publishChanges = () => {
    toast.add({
        id: "publish_confirmation",
        title: "Подтвердите действие",
        description: "Изменения станут доступны публично! Вы уверенны?",
        icon: "i-heroicons-exclamation-triangle-20-solid",
        color: "red",
        timeout: 0,
        actions: [
            {
                label: "Опубликовать",
                color: "red",
                click: confirmPublishChanges,
            },
        ],
    });
};

const confirmPublishChanges = async () => {
    if (!current_route.value) {
        return;
    }
    const { error } = await supabase
        .from("content")
        .update({ content: input.value })
        .eq("route", current_route.value.href);
    initialInput.value = input.value;
    toast.add({
        id: "publish_complete",
        title: "Публикация успешна!",
        icon: "i-heroicons-check-badge-20-solid",
        color: "green",
        timeout: 3000,
    });
};

defineShortcuts({
    ctrl_s: {
        usingInput: true,
        handler: publishChanges,
    },
    ctrl_shift_s: {
        usingInput: true,
        handler: confirmPublishChanges,
    },
});

const slideoverOpen = ref(false);
const settingsFieldsDefaults = {
    name: "",
};

const pageCreateOpen = ref(false);

const pageCreateFields = settingsFieldsDefaults

const settingsFields = reactive(settingsFieldsDefaults);

const updatePageField = async (field: string, value: any) => {
    let setVal: { [key: string]: any } = {};
    setVal[field] = value;
    const { error } = await supabase
        .from("content")
        .update(setVal)
        .eq("route", current_route.value.href);
    settingsFields[field as keyof typeof settingsFieldsDefaults] = "";
    slideoverOpen.value = false;
};

const deletePage = () => {
    slideoverOpen.value = false;
    toast.add({
        id: "delete_confirmation",
        title: "Подтвердите действие",
        description:
            "Страница и все данные связанные с ней будут удалены навсегда!",
        icon: "i-heroicons-exclamation-triangle-20-solid",
        color: "red",
        timeout: 0,
        actions: [
            {
                label: "Удалить",
                color: "red",
                click: confirmDeletePage,
            },
        ],
    });
};

const confirmDeletePage = async () => {};
</script>

<template>
    <div class="__editor">
        <UModal v-model="pageCreateOpen" :transition="false">
            <div class="__editor-page-create">
                <div class="header">
                    <h1>Новая страница</h1>
                </div>
                <div class="body">
                    <h1>Техническое название страницы</h1>
                    <UInput
                        v-model="settingsFields.name"
                    />
                    <UButton
                        label="Обновить"
                        variant="soft"
                        :disabled="
                            settingsFields.name === ''
                        "
                        @click="updatePageField('name', settingsFields.name)"
                    />
                </div>
            </div>
        </UModal>
        <USlideover v-model="slideoverOpen">
            <div class="__editor-slideover">
                <h1>Техническое название страницы</h1>
                <UInput
                    :placeholder="current_route.label"
                    v-model="settingsFields.name"
                />
                <UButton
                    label="Обновить"
                    variant="soft"
                    :disabled="
                        settingsFields.name === '' ||
                        settingsFields.name === current_route.label
                    "
                    @click="updatePageField('name', settingsFields.name)"
                />
                <hr />
                <h1 class="font-bold text-red-500 dark:text-red-400">
                    Опасная зона
                </h1>
                <UButton
                    label="Удалить страницу"
                    variant="outline"
                    color="red"
                    @click="deletePage"
                />
            </div>
        </USlideover>
        <div class="input">
            <div class="options">
                <UButton
                    @click="pageCreateOpen = true"
                    class="add-page"
                    color="white"
                    ><Icon name="material-symbols:add-circle-rounded"
                /></UButton>
                <USelectMenu
                    selected-icon="i-heroicons-pencil-square-solid"
                    v-model="current_route"
                    :options="content_routes_list"
                    class="select-route"
                    :disabled="input !== initialInput"
                />
                <UButton
                    @click="slideoverOpen = !slideoverOpen"
                    class="edit-page"
                    color="white"
                    ><Icon name="clarity:cog-solid"
                /></UButton>
            </div>
            <UTextarea
                :disabled="!current_route"
                class="area"
                :placeholder="
                    current_route
                        ? 'Введите Markdown разметку...'
                        : 'Выберите страницу для редактирования'
                "
                v-model="input"
            />
            <div class="unsaved" v-if="input !== initialInput">
                <div class="side">
                    <Icon name="material-symbols:edit-rounded" />
                    <p>Вы внесли изменения</p>
                </div>
                <div class="side">
                    <UTooltip>
                        <template #text> Отменить действия </template>
                        <UButton
                            @click="input = initialInput"
                            icon="i-heroicons-trash-20-solid"
                            color="white"
                        />
                    </UTooltip>
                    <UTooltip :shortcuts="['CTRL', 'S']">
                        <template #text> Опубликовать </template>
                        <UButton
                            @click="publishChanges"
                            icon="i-heroicons-check-circle-20-solid"
                            color="red"
                    /></UTooltip>
                </div>
            </div>
        </div>
        <div class="line"></div>
        <div class="preview">
            <MarkdownForamatter>
                <ContentRendererMarkdown v-if="preview" :value="preview" />
                <div
                    class="no-preview"
                    style="opacity: 0.8"
                    v-if="input === ''"
                >
                    <h3 style="display: flex; align-items: center; gap: 0.5rem">
                        <Icon name="line-md:question-circle" /> Начните писать в
                        поле и увидите изменения в этом окне
                    </h3>
                    <li>
                        Чтобы добавить заголовок напишите:
                        <blockquote># [Заголовок]</blockquote>
                    </li>
                    <li>
                        Чтобы добавить элемент списка напишите:
                        <blockquote>- [Элемент списка]</blockquote>
                    </li>
                </div>
            </MarkdownForamatter>
        </div>
    </div>
</template>

<style lang="scss">
.__editor-page-create {
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1rem;
        border-bottom: 1px solid rgba(var(--inverted-rgb), 0.05);
        h1 {
            font-size: 1.2rem;
        }
    }
    .body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        button {
            width: fit-content;
        }
    }
}

.__editor-slideover {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;

    h1 {
        font-size: 1.2rem;
    }

    hr {
        opacity: 0.1;
    }

    button {
        width: fit-content;
    }
}

.__editor {
    display: flex;
    padding: 1rem;
    gap: 1rem;
    justify-content: space-between;
    height: calc(100vh - 3rem);

    .line {
        background-color: rgba(var(--inverted-rgb), 0.2);
        width: 1px;
    }

    .input {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: calc(50% - 2rem);
        max-height: 100%;

        .options {
            display: flex;
            gap: 0.5rem;
            .select-route {
                min-width: 12rem;
            }
        }

        .unsaved {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .side {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
        }

        .area {
            height: 100%;
            textarea {
                height: 100%;
            }
        }
    }

    .preview {
        min-width: calc(50% - 2rem);
        height: 100%;
        overflow-y: auto;
    }
}
</style>
