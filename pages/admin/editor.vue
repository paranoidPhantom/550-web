<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";
import type { PostgrestError } from "@supabase/supabase-js";

definePageMeta({
    name: "Редактор",
    layout: "admin",
    // middleware: "auth"
});

const supabase = useSupabase();
const toast = useToast();

const tableName = "content";

const input = ref("");
const initialInput = ref(input.value);
const preview = computedAsync(async () => {
    let initialText = input.value;
    const tree = await parseMarkdown(initialText);
    return tree;
}, null);

const handleDBError = (error: PostgrestError | null) => {
    if (!error) { return }
    let errorDescription = `${error.message}`
    switch (parseInt(error.code)) {
        case 23505:
            errorDescription = "Страница с этим путём или названием уже существует!"
            break;
    }
    toast.add({
        id: `postgrest_error_${error.code}`,
        title: `Ошибка ${error.code}`,
        description: errorDescription,
        icon: "i-heroicons-x-circle-20-solid",
        color: "red",
        timeout: 10000,
    });
}


// Handling content_pages reactivity
const content_pages: Ref<page[]> = ref([]);
const { data, error } = await supabase.from(tableName).select();
handleDBError(error)
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
            table: tableName,
        },
        (payload) => {
            switch (payload.eventType) {
                case "INSERT": {
                    content_pages.value.push(payload.new as page);
                    break;
                }
                case "UPDATE": {
                    content_pages.value.forEach((page: page, index: number) => {
                        if (page.route === (payload.new as page).route) {
                            content_pages.value[index] = payload.new as page;
                        }
                    });
                    break;
                }
                case "DELETE": {
                    content_pages.value.forEach((page: page, index: number) => {
                        if (page.route === (payload.old as page).route) {
                            content_pages.value = content_pages.value
                                .slice(0, index)
                                .concat(content_pages.value.slice(index + 1));
                        }
                    });
                    break;
                }
                default:
                    break;
            }
        }
    )
    .subscribe();

const editing_route_cookie = useCookie("editing_route");
const editing_value_cookie = useCookie("editing_value");

const current_route = ref();
const content_routes_list = computed(() => {
    let result: {
        label: string;
        href: string;
    }[] = [];
    let lastHref = current_route.value ? current_route.value.href : undefined;
    if (!lastHref) {
        if (editing_route_cookie.value) {
            lastHref = editing_route_cookie.value;
        }
    }
    content_pages.value.forEach((page: page, index: number) => {
        const option_object = {
            label: page.name,
            href: page.route,
        };
        result.push(option_object);
        if (lastHref && lastHref === page.route) {
            current_route.value = option_object;
        } else if (!current_route.value && index === content_pages.value.length - 1) {
            current_route.value = option_object;
        }
    });

    return result;
});
// Done with content_pages

const firstLoadComplete = ref(false);

watchEffect(async () => {
    if (current_route.value) {  
        const request_href = current_route.value.href;
        const { data, error } = await supabase
            .from(tableName)
            .select()
            .eq("route", request_href)
            .single();
        if (error) { handleDBError(error); return }
        const loadedVal = (data as unknown as page).content;
        input.value =
            editing_route_cookie.value === request_href
                ? editing_value_cookie.value || loadedVal
                : loadedVal;
        editing_route_cookie.value = request_href;
        initialInput.value = data ? loadedVal : "";
        firstLoadComplete.value = true;
        input.value = input.value.toString()
        initialInput.value = initialInput.value.toString()
    }
});

const publishChanges = () => {
    if (input.value === initialInput.value) {
        return;
    }
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
    if (input.value === initialInput.value) {
        return;
    }
    if (!current_route.value) {
        return;
    }
    const { error } = await supabase
        .from(tableName)
        .update({ content: input.value })
        .eq("route", current_route.value.href);
    if (error) { handleDBError(error); return }
    editing_value_cookie.value = undefined;
    initialInput.value = input.value;
    toast.add({
        id: `publish_complete_${input.value}`,
        title: "Публикация успешна!",
        icon: "i-heroicons-check-badge-20-solid",
        color: "green",
        timeout: 3000,
    });
};

const slideoverOpen = ref(false);
const settingsFieldsDefaults = {
    name: "",
    route: "",
};

const pageCreateOpen = ref(false);

const pageCreateFields = reactive(settingsFieldsDefaults);

const settingsFields = reactive(settingsFieldsDefaults);

const createPage = async () => {
    if (pageCreateFields.name === "" || pageCreateFields.route === "") { return }
        pageCreateOpen.value = false;
    const { error } = await supabase.from(tableName).insert({
        route: pageCreateFields.route,
        name: pageCreateFields.name,
        content: `::editorWelcome\n---\nparams: ${JSON.stringify(pageCreateFields)}\n---\n::`,
    });
    if (error) { handleDBError(error); return }
    current_route.value = {
        href: pageCreateFields.route,
        name: pageCreateFields.name
    }
    pageCreateFields.name = "";
    pageCreateFields.route = "";
};

const updatePageField = async (field: string, value: any) => {
    let setVal: { [key: string]: any } = {};
    setVal[field] = value;
    const { error } = await supabase
        .from(tableName)
        .update(setVal)
        .eq("route", current_route.value.href);
    if (error) { handleDBError(error); return }
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

const confirmDeletePage = async () => {
    if (!current_route.value) {
        return;
    }
    const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("route", current_route.value.href);
    if (error) { handleDBError(error); return }

    current_route.value = content_routes_list.value[0]
};

watchEffect(() => {
    if (input.value === "") {
        return;
    }
    editing_value_cookie.value = input.value;
});

defineShortcuts({
    ctrl_s: {
        usingInput: true,
        handler: publishChanges,
    },
    ctrl_shift_s: {
        usingInput: true,
        handler: confirmPublishChanges,
    },
    enter: {
        usingInput: true,
        whenever: [pageCreateOpen],
        handler: createPage,
    },
});
</script>

<template>
    <div class="__editor">
        <UModal v-model="pageCreateOpen" :transition="false">
            <div class="__editor-page-create">
                <div class="header">
                    <h1>Новая страница</h1>
                </div>
                <div class="body">
                    <UFormGroup
                        label="Путь к странице"
                        name="route"
                        help="Нельзя менять после создания"
                    >
                        <UInput v-model="pageCreateFields.route" />
                    </UFormGroup>
                    <UFormGroup
                        label="Название страницы"
                        name="name"
                        help="Не используется публично"
                    >
                        <UInput v-model="pageCreateFields.name" />
                    </UFormGroup>
                    <UButton
                        label="Создать"
                        variant="soft"
                        :disabled="
                            pageCreateFields.name === '' ||
                            pageCreateFields.route === ''
                        "
                        @click="createPage"
                    />
                </div>
            </div>
        </UModal>
        <USlideover v-model="slideoverOpen">
            <div class="__editor-slideover">
                <UFormGroup
                    label="Путь к странице"
                    name="route"
                    help="Нельзя менять после создания"
                >
                    <UInput v-model="current_route.href" :disabled="true" />
                </UFormGroup>
                <hr />
                <UFormGroup
                    label="Название страницы"
                    name="name"
                    help="Не используется публично"
                >
                    <UInput
                        :placeholder="current_route.label"
                        v-model="settingsFields.name"
                    />
                </UFormGroup>
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
                    :disabled="input !== initialInput || !firstLoadComplete"
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
                    :disabled="input !== initialInput || !firstLoadComplete"
                />
                <UButton
                    @click="slideoverOpen = !slideoverOpen"
                    class="edit-page"
                    color="white"
                    :disabled="!firstLoadComplete"
                    ><Icon name="clarity:cog-solid"
                /></UButton>
                <UButton :to="current_route.href" target="_blank" color="white"><Icon name="ic:baseline-remove-red-eye"/></UButton>
                <Icon
                    name="svg-spinners:ring-resize"
                    class="load-spinner"
                    v-if="!firstLoadComplete"
                />
            </div>
            <UTextarea
                :disabled="!firstLoadComplete"
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
        font-family: "CascadiaCode";

        .options {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            .select-route {
                min-width: 12rem;
            }
            > * {
                height: 100%;
            }
            .load-spinner {
                width: 1.2rem;
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