<script setup lang="ts">
import { computedAsync, useMouse, useWindowScroll } from "@vueuse/core";
import { getReadableFileSizeString } from "@/utils/useFormattedFileSize";
import normalize from "normalize-path";
interface props {
    bucket: string;
    root: string;
    picker_mode?: {
        key: string;
        type?: string | string[];
        multiple: boolean;
    };
}
const props = defineProps<props>();
const picker_mode_enabled = props.picker_mode !== undefined;

const toast = useToast();

const {
    public: { service_domain },
} = useRuntimeConfig();
const loading = ref(false);

const pathComponents: Ref<string[]> = ref([]);

const { auth } = useSupabaseClient();

const {
    data: { session },
} = await auth.getSession();

const user = useSupabaseUser();

const pending = ref(false);
const pendingText: Ref<string> = ref("");
const recompute = ref(true);

const recomputeSubpath = (status?: Ref<string>, label?: string) => {
    recompute.value = false;
    if (status) {
        pending.value = true;
        pendingText.value = label || "";
        const stopWatch = watchEffect(() => {
            if (status.value === "success") {
                stopWatch();
                recompute.value = true;
                pending.value = false;
            }
        });
    } else {
        setTimeout(() => {
            recompute.value = true;
        }, 100);
    }
};

const subpath = computed(() => {
    if (!recompute.value) return;
    loading.value = true;
    return pathComponents.value.join("/");
});

const rawFileData = computedAsync(async () => {
    const path = `${props.root}/${subpath.value}`;
    const { data } = await useFetch(
        encodeURI(`/fs/list_files/${props.bucket}/${path}`)
    );
    return data.value;
}, null);

interface fsEntity {
    name: string;
    isFile?: boolean;
    size?: number;
    id?: number;
}

const currentFiles = computed(() => {
    let result: fsEntity[] = [];
    const raw = rawFileData.value;
    if (raw === null) {
        return null;
    }
    for (let index = 0; index < raw.length; index++) {
        let resultEntity: fsEntity = {
            name: "",
        };
        const fsEntity = raw[index];
        resultEntity.name = fsEntity.name;
        resultEntity.isFile = fsEntity.file;
        if (resultEntity.isFile) {
            resultEntity.size = fsEntity.size;
            if (picker_mode_enabled && props.picker_mode.type !== undefined) {
                const type = props.picker_mode.type;
                if (Array.isArray(type)) {
                    let mathed = false;
                    type.some((element) => {
                        if (fsEntity.name.endsWith(element)) mathed = true;
                    });
                    if (!mathed) continue;
                } else {
                    if (!fsEntity.name.endsWith(type)) continue;
                }
            }
        }
        result.push(resultEntity);
    }
    loading.value = false;
    return result;
});

const accessFile = (
    subpath: string,
    file: string | undefined,
    download: boolean
) => {
    const path = normalize(`${props.root}/${subpath}/${file}`);
    const publicUrl = `/fs/${download ? "download/" : ""}${
        props.bucket
    }${path}`;
    if (download) {
        window.location = publicUrl as unknown as typeof window.location;
    } else {
        window.open(publicUrl);
    }
};

const handledragAndDrop = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
};

const enterdragAndDrop = (event: Event) => {
    handledragAndDrop(event);
    uploadOverlay.value = true;
};

const exitdragAndDrop = (event: Event) => {
    handledragAndDrop(event);
    uploadOverlay.value = false;
};

const handleFileUpload = (event: any) => {
    handledragAndDrop(event);
    uploadOverlay.value = false;
    const dataTransfer = event.dataTransfer;
    const files: FileList = dataTransfer
        ? dataTransfer.files
        : event.target.files;
    const path = `${props.bucket}/${props.root}/${subpath.value}`;
    let formData = new FormData();
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        formData.append("file", file, encodeURI(file.name));
    }
    if (!session?.access_token) return;
    const { status, error } = useFetch(`/fs/upload`, {
        method: "post",
        query: { folder: path },
        body: formData,
        headers: {
            access_token: session.access_token,
        },
    });
    recomputeSubpath(status, "Загружаем");
};

const uploadOverlay = ref(false);
const factualInput = ref();

const newFolderModal = reactive({
    enabled: false,
    name: "",
});

const createFolder = () => {
    if (!session?.access_token) return;
    const { status, error } = useFetch(`/fs/newdir`, {
        method: "post",
        query: {
            folder: `${props.bucket}/${props.root}/${subpath.value}/${newFolderModal.name}`,
        },
        headers: {
            access_token: session.access_token,
        },
    });
    newFolderModal.enabled = false;
    newFolderModal.name = "";
    recomputeSubpath(status, "Создаём папку");
};

const confirmationForDeleteEntity = (event: Event) => {
    event.stopPropagation();
    toast.add({
        id: `delete_entity_confirmation`,
        title: "Чтобы удалить элемент кликнете дважды",
        icon: "i-heroicons-exclamation-triangle-20-solid",
        color: "yellow",
        timeout: 3000,
    });
};

const deleteEntity = (subpath: string, file: string) => {
    toast.remove("delete_entity_confirmation");
    const path = `${props.bucket}/${props.root}/${subpath}/${file}`;
    if (!session?.access_token) return;
    const { status, error } = useFetch(`/fs/remove`, {
        method: "post",
        query: { entity: path },
        headers: {
            access_token: session.access_token,
        },
    });
    recomputeSubpath(status, "Удаляем");
};

const fileExtIcon = (name: string) => {
    if (name.endsWith("pdf")) return "codicon:file-pdf";
    else if (
        name.endsWith("png") ||
        name.endsWith("jpg") ||
        name.endsWith("jpeg") ||
        name.endsWith("webp")
    )
        return "codicon:file-media";
    else return "codicon:file-binary";
};

const pickerState = picker_mode_enabled
    ? useState<undefined | null | string[]>(props.picker_mode.key, () => undefined)
    : null;

const selectedFiles = reactive<{ [key: string]: boolean | undefined }>({});

const selectedCount = computed(() => {
    let selected = 0;
    const keys = Object.keys(selectedFiles);
    keys.forEach((key) => {
        if (selectedFiles[key] === true) selected++;
    });
    return selected;
});

const pickerLabel = computed(() => {
    const count = selectedCount.value;
    let w_picked = "Выбрано";
    let w_file = "файлов";
    if (count === 1) {
        w_picked = "Выбран";
        w_file = "файл";
    } else if (count < 5) {
        w_file = "файла";
    }
    return `${w_picked} ${count} ${w_file}`;
});

const finishFilePick = () => {
    if (pickerState) {
        if (selectedCount.value <= 0) {
            pickerState.value = null
            return
        }
        let selected: string[] = [];
        const keys = Object.keys(selectedFiles);
        keys.forEach((key) => {
            if (selectedFiles[key] === true) selected.push(key);
        });
        pickerState.value = selected;
        Object.assign(selectedFiles, {});
    }
};
</script>

<template>
    <div
        class="root"
        :class="{ 'no-user': !user, 'picker-mode': picker_mode_enabled }"
    >
        <UModal v-model="newFolderModal.enabled">
            <div class="new-folder-container">
                <UFormGroup label="Назавние папки">
                    <UInput v-model="newFolderModal.name" />
                </UFormGroup>
                <UButton @click="createFolder" variant="soft">Создать</UButton>
            </div>
        </UModal>
        <div class="path">
            <div class="node" @click="pathComponents = []">
                <Icon name="codicon:root-folder" />
            </div>
            <template v-for="(node, index) in pathComponents">
                <Icon name="codicon:arrow-right" />
                <div
                    class="node"
                    @click="
                        pathComponents = pathComponents.splice(0, index + 1)
                    "
                >
                    <Icon name="codicon:folder" />
                    <p>{{ node }}</p>
                </div>
            </template>
            <div
                v-if="pending"
                style="
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: fit-content;
                    margin-left: auto;
                "
            >
                <p style="font-size: 0.8rem">{{ pendingText }}</p>
                <UProgress style="flex-shrink: 2" animation="carousel" />
            </div>
            <p
                v-if="picker_mode_enabled && selectedCount > 0"
                style="margin-left: auto"
            >
                {{ pickerLabel }}
            </p>
        </div>
        <hr />
        <div
            class="body"
            @dragenter="enterdragAndDrop"
            @dragleave="exitdragAndDrop"
            @dragover="enterdragAndDrop"
            @drop="handleFileUpload"
        >
            <Transition name="dnd-overlay" v-if="uploadOverlay">
                <div class="drag-n-drop-overlay">
                    <Icon name="line-md:uploading-loop" />
                    <p>Загрузка файлов</p>
                </div>
            </Transition>
            <div class="loading" v-if="currentFiles === null || loading">
                <Icon name="svg-spinners:blocks-shuffle-3" />
            </div>
            <div
                class="empty"
                v-else-if="
                    Array.isArray(currentFiles) && currentFiles.length === 0
                "
            >
                <Icon name="mdi:magnify-close" />
                <p>Тут пусто...</p>
            </div>
            <div class="files" v-else>
                <div
                    class="entity"
                    v-for="entity in currentFiles"
                    :key="`${entity.name}_${entity.id}`"
                    @click="
                        () => {
                            entity.name && !entity.isFile
                                ? pathComponents.push(entity.name)
                                : null;
                        }
                    "
                    :title="entity.name"
                >
                    <div class="main-data">
                        <UCheckbox
                            v-if="entity.isFile && picker_mode"
                            :disabled="
                                !(picker_mode.multiple === true) &&
                                selectedCount > 0 &&
                                selectedFiles[`${bucket}/${root}/${subpath}/${entity.name}`] !==
                                    true
                            "
                            v-model="selectedFiles[`${bucket}/${root}/${subpath}/${entity.name}`]"
                        />
                        <Icon
                            :name="
                                entity.isFile
                                    ? fileExtIcon(entity.name)
                                    : 'codicon:folder'
                            "
                        />
                        <p>{{ entity.name }}</p>
                    </div>
                    <div class="actions">
                        <template v-if="entity.isFile && !picker_mode_enabled">
                            <p class="size">
                                {{
                                    getReadableFileSizeString(entity.size || 0)
                                }}
                            </p>
                            <UButton
                                @click="
                                    accessFile(
                                        subpath as string,
                                        entity.name,
                                        true
                                    )
                                "
                                variant="ghost"
                            >
                                <Icon name="codicon:cloud-download" />
                            </UButton>
                            <UButton
                                @click="
                                    accessFile(
                                        subpath as string,
                                        entity.name,
                                        false
                                    )
                                "
                                variant="ghost"
                            >
                                <Icon name="codicon:eye" />
                            </UButton>
                        </template>
                        <UButton
                            v-if="user"
                            @click="
                                (event) => {
                                    confirmationForDeleteEntity(event);
                                }
                            "
                            @dblclick="
                                deleteEntity(subpath as string, entity.name)
                            "
                            variant="ghost"
                        >
                            <Icon name="codicon:trash" />
                        </UButton>
                    </div>
                </div>
            </div>
            <div class="footer" v-if="user || picker_mode_enabled">
                <hr />
                <div class="options">
                    <template v-if="user">
                        <UButton
                            color="white"
                            @click="newFolderModal.enabled = true"
                        >
                            <Icon name="codicon:add" />
                            Создать папку
                        </UButton>
                        <div class="upload-btn">
                            <UButton
                                color="white"
                                @click="factualInput.click()"
                            >
                                <Icon name="codicon:cloud-upload" />
                                Загрузить
                            </UButton>
                            <input
                                type="file"
                                multiple
                                @change="handleFileUpload"
                                ref="factualInput"
                            />
                        </div>
                    </template>
                    <template v-if="picker_mode_enabled">
                        <UButton color="white" @click="finishFilePick">
                            <Icon name="codicon:close" />
                            Отмена
                        </UButton>
                        <UButton color="white" @click="finishFilePick" :disabled="selectedCount <= 0">
                            <Icon name="codicon:check" />
                            Готово
                        </UButton>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.root {
    position: relative;
    max-width: 25rem;
    --files-frame-height: 15rem;
    --footer-height: 4rem;
    background-color: rgba(var(--inverted-rgb), 0.05);
    outline: 1px solid rgba(var(--inverted-rgb), 0.2);

    &.full {
        height: 100%;
        .body {
            height: calc(100% - var(--footer-height));
        }
    }

    &.no-user {
        --footer-height: 0;
        .files {
            max-height: var(--files-frame-height);
        }
    }
    &.picker-mode {
        background: none;
        outline: none;
        width: 100%;
        max-width: none;
    }
    border-radius: 0.5rem;

    hr {
        border-color: rgba(var(--inverted-rgb), 0.1);
    }

    .path {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        height: 2.5rem;

        .node {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem;
            border-radius: 0.25rem;

            &:hover {
                background-color: rgba(var(--inverted-rgb), 0.1);
                cursor: pointer;
            }
        }
    }

    .body {
        height: var(--files-frame-height);
        position: relative;

        .drag-n-drop-overlay {
            position: absolute;
            background-color: rgba(var(--normal-rgb), 0.8);
            border-radius: 0.5rem;
            inset: 0.1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.75rem;
            font-size: 2rem;
            transition: all 1s;
            pointer-events: none;
            z-index: 2;
        }
        .files {
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            height: calc(100% - var(--footer-height));

            .entity {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.25rem 0.5rem;
                height: 2rem;
                cursor: pointer;

                .main-data {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    max-width: calc(100% - 12rem);
                    p {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        max-width: 100%;
                        flex-shrink: 1;
                    }
                    svg {
                        flex-shrink: 0;
                    }
                }

                .actions {
                    display: flex;
                    align-items: center;
                    opacity: 0;
                    gap: 0.5rem;

                    .size {
                        font-size: 0.8rem;
                        opacity: 0.5;
                    }
                }

                &:hover {
                    background-color: rgba(var(--inverted-rgb), 0.05);

                    .actions {
                        opacity: 1;
                    }
                }
            }
        }
        .upload-btn {
            input {
                display: none;
            }
        }
        .loading,
        .empty {
            max-height: calc(100% - var(--footer-height));
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem 0;
            justify-content: center;
            opacity: 0.6;
            user-select: none;
            height: 100%;

            > svg {
                font-size: 1.5rem;
            }
        }
    }
    .footer {
        position: absolute;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem 0;
        bottom: 0;
        height: var(--footer-height);
        .options {
            display: flex;
            gap: 0.5rem;
            padding: 0 0.5rem;
            height: calc(100% - 0.5rem);
            button {
                height: 100%;
            }
        }
    }
}

.new-folder-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.dnd-overlay-enter-active,
.dnd-overlay-leave-active {
    transition: all 1s;
}

.dnd-overlay-enter-from,
.dnd-overlay-leave-to {
    opacity: 0;
}
</style>
