<script setup lang="ts">
import type {
    PostgrestError,
    RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface article {
    route: string;
    created_at: string;
    thumbnail: string;
    link_text: string;
}

definePageMeta({
    name: "Редактор",
    layout: "admin",
    middleware: "auth",
    login_message: "Для доступа к редактору контента необходимо авторизоваться",
});

const supabase = useSupabaseClient();
const toast = useToast();
const loaderStatus = reactive({
    enabled: false,
    message: "",
});

const {
    tableNames: {
        content: tableName,
        news: newsTableName,
        blog: blogTableName,
    },
} = useAppConfig();

const input = ref();
const initialInput = ref("");

const handleDBError = (error: PostgrestError | null) => {
    if (!error) {
        return;
    }
    loaderStatus.enabled = false;
    let errorDescription = `${error.message}`;
    switch (parseInt(error.code)) {
        case 23505:
            errorDescription =
                "Страница с этим путём или названием уже существует!";
            break;
        case 42501:
            errorDescription = `Недостаточно прав (${error.message})`;
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
};

// Handling content_pages reactivity
const content_pages: Ref<page[]> = ref([]);

const { data, error } = await supabase
    .from(tableName)
    .select(`*, ${newsTableName}(*)`);

handleDBError(error);
content_pages.value = data as unknown as page[];

interface page {
    content: string;
    created_at: string;
    name: string;
    route: string;
    news: article;
}

const handle_postgres_changes = (
    payload: RealtimePostgresChangesPayload<{ [key: string]: any }>
) => {
    if (payload.table === tableName) {
        switch (payload.eventType) {
            case "INSERT": {
                content_pages.value.push(payload.new as page);
                break;
            }
            case "UPDATE": {
                content_pages.value.forEach((page: page, index: number) => {
                    if (page.route === (payload.new as page).route) {
                        const newsPreserve = page.news;
                        content_pages.value[index] = payload.new as page;
                        content_pages.value[index].news = newsPreserve;
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
                current_route.value = content_pages.value[0];
                break;
            }
        }
    } else if (payload.table === newsTableName) {
        let { route: editedRoute } = payload.old as { route: string };
        if (!editedRoute)
            editedRoute = (payload.new as { route: string }).route;
        content_pages.value.forEach((page: page, index: number) => {
            if (page.route === editedRoute) {
                content_pages.value[index].news = payload.new as article;
            }
        });
    }
};

const contentRealtime = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: tableName,
        },
        handle_postgres_changes
    )
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: newsTableName,
        },
        handle_postgres_changes
    )
    .subscribe();

const editing_route_cookie = useCookie("editing_route");

const { query: routeQuery } = useRoute();

const current_route = ref();
const content_routes_list = computed(() => {
    let result: {
        label: string;
        href: string;
    }[] = [];
    content_pages.value.forEach((page: page, index: number) => {
        const option_object = {
            label: page.name,
            href: page.route,
        };
        result.push(option_object);
    });

    return result;
});

let lastHref = current_route.value ? current_route.value.href : undefined;
if (!lastHref) {
    if (editing_route_cookie.value) lastHref = editing_route_cookie.value;
    if (routeQuery.editing) lastHref = routeQuery.editing;
}
content_pages.value.forEach((page: page, index: number) => {
    const option_object = {
        label: page.name,
        href: page.route,
    };
    if (lastHref && lastHref === page.route) {
        current_route.value = option_object;
    } else if (
        !current_route.value &&
        index === content_pages.value.length - 1
    ) {
        current_route.value = option_object;
    }
});

// Done with content_pages

const firstLoadComplete = ref(false);

watchEffect(async () => {
    if (current_route.value) {
        const request_href = current_route.value.href;
        loaderStatus.enabled = true;
        loaderStatus.message = "Загрузка страницы...";
        const { data, error } = await supabase
            .from(tableName)
            .select()
            .eq("route", request_href)
            .single();
        if (error) {
            handleDBError(error);
            loaderStatus.enabled = false;
            return;
        }
        const loadedVal = (data as unknown as page).content;
        const editing_value_cookie = localStorage.getItem(
            "editing_value_cookie"
        );
        input.value =
            editing_route_cookie.value === request_href
                ? editing_value_cookie || loadedVal
                : loadedVal;
        editing_route_cookie.value = request_href;
        initialInput.value = data ? loadedVal : "";
        if (!firstLoadComplete.value) firstLoadComplete.value = true;
        input.value = input.value.toString();
        initialInput.value = initialInput.value.toString();
        loaderStatus.enabled = false;
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
    loaderStatus.enabled = true;
    loaderStatus.message = "Публикуем изменения";
    const { error } = await supabase
        .from(tableName)
        .update({ content: input.value })
        .eq("route", current_route.value.href);
    if (error) {
        handleDBError(error);
        return;
    }
    loaderStatus.enabled = false;
    localStorage.removeItem("editing_value_cookie");
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
    if (pageCreateFields.name === "" || pageCreateFields.route === "") {
        return;
    }
    pageCreateOpen.value = false;
    loaderStatus.enabled = true;
    loaderStatus.message = "Создаём страницу";
    const { error } = await supabase.from(tableName as any).insert({
        route: pageCreateFields.route,
        name: pageCreateFields.name,
        content: `::editorWelcome\n---\nparams: ${JSON.stringify(
            pageCreateFields
        )}\n---\n::`,
    } as any);
    if (pageCreateFields.route.startsWith("/blog")) {
        await supabase.from(blogTableName as any).insert({
            route: pageCreateFields.route,
            restricted: true,
        } as any);
    }
    loaderStatus.enabled = false;
    if (error) {
        handleDBError(error);
        return;
    }
    current_route.value = {
        href: pageCreateFields.route,
        name: pageCreateFields.name,
    };
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
    if (error) {
        handleDBError(error);
        return;
    }
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
    if (error) {
        handleDBError(error);
        return;
    }

    current_route.value = content_routes_list.value[0];
};

const currentInput = useState("editor_input_global", () => undefined);

const editor = ref();
const textArea: Ref<HTMLTextAreaElement | undefined> = ref();
const selectionIndex = ref(0);

const updateSI = () => {
    selectionIndex.value = textArea.value ? textArea.value.selectionEnd : 0;
};

watchEffect(() => {
    if (currentInput.value) {
        input.value = currentInput.value;
        updateSI();
    }
});

watchEffect(() => {
    if (input.value === undefined) {
        return;
    }
    localStorage.setItem("editing_value_cookie", input.value);
    updateSI();
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

onMounted(() => {
    const root = editor.value;
    const textAreaSelection = root.querySelector("textarea");
    textArea.value = textAreaSelection;
    //
    textArea.value?.addEventListener("keyup", updateSI),
        textArea.value?.addEventListener("click", updateSI);
});

onUnmounted(() => {
    textArea.value?.removeEventListener("keyup", updateSI),
        textArea.value?.removeEventListener("click", updateSI);
});

const currentPageData = computed(() => {
    const currentHref = current_route.value.href;
    const pages = content_pages.value;
    let result: page | undefined;
    pages.forEach((page: page, index: number) => {
        if (page.route === currentHref) {
            result = page;
        }
    });
    return result;
});

const associateNewsEntryPending = ref(false);

const associateNewsEntry = async () => {
    associateNewsEntryPending.value = true;
    const { error } = await supabase.from(newsTableName as any).insert({
        route: current_route.value.href,
    } as any);
    if (error) {
        handleDBError(error);
        associateNewsEntryPending.value = false;
        return;
    }
};

const editNewsEntry = reactive({
    thumbnail: "",
    link_text: "",
});

const openSlideover = () => {
    slideoverOpen.value = true;
    if (currentPageData.value && currentPageData.value.news) {
        editNewsEntry.thumbnail = currentPageData.value?.news.thumbnail;
        editNewsEntry.link_text = currentPageData.value?.news.link_text;
    }
};

const updateNewsEntry = async (key: keyof typeof editNewsEntry) => {
    const setTo = {};
    setTo[key] = editNewsEntry[key];
    const { error } = await supabase
        .from(newsTableName as any)
        .update(setTo)
        .eq("route", current_route.value.href);
    if (error) {
        handleDBError(error);
        associateNewsEntryPending.value = false;
        return;
    }
};

const deleteAssociatedArticle = async () => {
    const { error } = await supabase
        .from(newsTableName as any)
        .delete()
        .eq("route", current_route.value.href);
    if (error) {
        handleDBError(error);
        return;
    }
    window.location.reload();
};

const news_edit_settings: {
    label: string;
    name: string;
    help: string;
    placeholder: string;
    key: keyof typeof editNewsEntry;
}[] = [
    {
        label: "Обложка",
        name: "thumbnail",
        help: "Ссылка на картинку обложку для новости",
        placeholder: "https://example.com/image.png",
        key: "thumbnail",
    },
    {
        label: "Текст ссылки",
        name: "link_text",
        help: "Текст для ссылки (в форме кнопки) на новость",
        placeholder: "Подробнее",
        key: "link_text",
    },
];

const test = "test";

const blog_url = (route: string) => {
    const split = route.split("/");
    return `/${split[1]}/${split[2]}#${split[3]}`;
};
</script>

<template>
    <div class="__editor" ref="editor">
        <UModal class="loader" v-model="loaderStatus.enabled" prevent-close>
            <div class="flex flex-col items-center gap-4 p-4 select-none">
                <UIcon
                    style="font-size: 2rem"
                    name="svg-spinners:ring-resize"
                />
                <p class="text-current">{{ loaderStatus.message }}</p>
            </div>
        </UModal>
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
                        <template #hint>
                            <UPopover mode="hover">
                                <UIcon
                                    style="font-size: 1.2rem"
                                    name="line-md:alert-circle-twotone"
                                />
                                <template #panel>
                                    <div class="p-1">
                                        <ul
                                            style="
                                                list-style: disc;
                                                padding-left: 1.5rem;
                                            "
                                        >
                                            <li>
                                                <i>НЕ должен</i> содержать
                                                кириллицу
                                            </li>
                                            <li>
                                                <i>Должен</i> начинаться на '/'
                                            </li>
                                            <li>
                                                <strong
                                                    >Для новосных
                                                    страниц:</strong
                                                >
                                                <ul
                                                    style="
                                                        list-style: circle;
                                                        padding-left: 1.5rem;
                                                    "
                                                >
                                                    <li>
                                                        Должен начинаться на
                                                        '/news/'
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong
                                                    >Для страниц личного
                                                    блога:</strong
                                                >
                                                <ul
                                                    style="
                                                        list-style: circle;
                                                        padding-left: 1.5rem;
                                                    "
                                                >
                                                    <li>
                                                        Должен начинаться на
                                                        '/blog/<i
                                                            >[имя
                                                            пользователя]</i
                                                        >/'
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </template>
                            </UPopover>
                        </template>
                    </UFormGroup>
                    <UFormGroup
                        label="Название страницы"
                        name="name"
                        help="Используется публично"
                    >
                        <UInput v-model="pageCreateFields.name" />
                    </UFormGroup>
                    <UButton
                        label="Создать"
                        variant="soft"
                        :disabled="
                            pageCreateFields.name === '' ||
                            pageCreateFields.route === '' ||
                            !pageCreateFields.route.startsWith('/')
                        "
                        @click="createPage"
                    />
                </div>
            </div>
        </UModal>
        <USlideover v-model="slideoverOpen">
            <div class="__editor-slideover">
                <h1 class="font-bold">Основная информация</h1>
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
                    help="Используется публично"
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
                <template
                    v-if="
                        current_route &&
                        current_route.href &&
                        current_route.href.startsWith('/news')
                    "
                >
                    <h1 class="font-bold">Новостная страница</h1>
                    <template v-if="currentPageData && !currentPageData.news">
                        <h2>У этой страницы нет привязанной новости</h2>
                        <UButton
                            :loading="associateNewsEntryPending"
                            :disabled="associateNewsEntryPending"
                            label="Создать"
                            variant="soft"
                            @click="associateNewsEntry"
                        />
                    </template>
                    <template
                        v-else-if="currentPageData && currentPageData.news"
                    >
                        <UFormGroup
                            v-for="edit_setting in news_edit_settings"
                            :label="edit_setting.label"
                            :name="edit_setting.name"
                            :help="edit_setting.help"
                        >
                            <UInput
                                v-model="editNewsEntry[edit_setting.key]"
                                :placeholder="edit_setting.placeholder"
                                :ui="{
                                    icon: { trailing: { pointer: '' } },
                                }"
                            >
                                <template
                                    #trailing
                                    v-if="
                                        editNewsEntry[edit_setting.key] !==
                                        currentPageData.news[edit_setting.key]
                                    "
                                >
                                    <UButton
                                        variant="link"
                                        icon="i-heroicons-arrow-path-rounded-square"
                                        @click="
                                            editNewsEntry[edit_setting.key] =
                                                currentPageData.news[
                                                    edit_setting.key
                                                ]
                                        "
                                    />
                                    <UButton
                                        variant="link"
                                        icon="i-heroicons-check-20-solid"
                                        @click="
                                            updateNewsEntry(edit_setting.key)
                                        "
                                    />
                                </template>
                            </UInput>
                        </UFormGroup>

                        <UButton
                            label="Удалить ассоциированную новость"
                            variant="soft"
                            color="red"
                            icon="i-heroicons-exclamation-triangle"
                            @click="deleteAssociatedArticle"
                        />
                    </template>
                </template>
                <UAlert
                    v-else
                    icon="i-heroicons-information-circle-20-solid"
                    description="Для того чтобы привязывать к страницам новость, путь страницы должен начинаться на '/news/...'"
                    title="Примечание"
                    color="yellow"
                    variant="soft"
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
                >
                    <UIcon name="material-symbols:add-circle-rounded" />
                </UButton>
                <USelectMenu
                    selected-icon="i-heroicons-pencil-solid"
                    v-model="current_route"
                    :options="content_routes_list"
                    class="select-route"
                    :disabled="input !== initialInput || !firstLoadComplete"
                    searchable
                    searchable-placeholder="Поиск..."
                >
                    <template #option="{ option }">
                        <UTooltip :text="option.href" class="max-w-full">
                            <span class="truncate max-w-full">{{
                                option.label
                            }}</span>
                        </UTooltip>
                    </template>
                </USelectMenu>
                <UButton
                    @click="openSlideover"
                    class="edit-page"
                    color="white"
                    :disabled="!firstLoadComplete"
                >
                    <UIcon name="clarity:cog-solid" />
                </UButton>
                <UButton
                    :to="
                        current_route.href.startsWith('/blog')
                            ? blog_url(current_route.href)
                            : current_route.href
                    "
                    target="_blank"
                    color="white"
                >
                    <UIcon name="ic:baseline-remove-red-eye" />
                </UButton>
                <AdminUtilityEditorAutocomplete
                    :input="input"
                    :index="selectionIndex"
                />
                <UIcon
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
            <Transition name="unsaved">
                <div
                    class="unsaved"
                    v-if="input !== initialInput && firstLoadComplete"
                >
                    <div class="side">
                        <UIcon name="material-symbols:edit-rounded" />
                        <p>Изменения не синхронизованы</p>
                    </div>
                    <div class="side">
                        <UTooltip>
                            <template #text
                                >Отменить действия (скачать)</template
                            >
                            <UButton
                                @click="input = initialInput"
                                icon="i-heroicons-trash-20-solid"
                                color="white"
                            />
                        </UTooltip>
                        <UTooltip :shortcuts="['CTRL', 'S']">
                            <template #text
                                >Опубликовать действия (загрузить)</template
                            >
                            <UButton
                                @click="publishChanges"
                                icon="i-heroicons-check-circle-20-solid"
                                color="red"
                            />
                        </UTooltip>
                    </div>
                </div>
            </Transition>
        </div>
        <div class="line"></div>
        <div class="preview">
            <MarkdownForamatter>
                <MDC v-if="input" :value="input" />
                <div
                    class="no-preview"
                    style="opacity: 0.5; user-select: none"
                    v-if="input === ''"
                >
                    [Нет контента]
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

    > .line {
        background-color: rgba(var(--inverted-rgb), 0.2);
        width: 1px;
    }

    .input {
        display: flex;
        flex-direction: column;
        min-width: calc(50% - 2rem);
        max-height: 100%;
        font-family: "CascadiaCode";

        .options {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding-bottom: 0.5rem;

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
            height: 3rem;
            transition: all 0.5s;
            padding-top: 0.5rem;
            overflow: hidden;

            .side {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            &.unsaved-enter-from,
            &.unsaved-leave-to {
                height: 0;
                padding-top: 0;
                opacity: 0;
                translate: 0 1rem;
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
