<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
interface props {
    bucket: string;
    root: string;
}
const { bucket, root: rootPath } = defineProps<props>();
const { express_server_port } = useAppConfig();

const { public: { service_domain } } = useRuntimeConfig();
const loading = ref(false);

const express_server = `http://${service_domain}:${express_server_port}/`;

const pathComponents = ref([]);

const subpath = computed(() => {
    loading.value = true;
    return pathComponents.value.join("/");
});

const rawFileData = computedAsync(async () => {
    const path = `${rootPath}${subpath.value}`;
    const { data } = await useFetch(
        `${express_server}api/list_files/${bucket}/${path}`
    );
    return data.value;
}, null);

interface fsEntity {
    name: string;
    isFile?: boolean;
    size?: number;
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
    const path = `${rootPath}${subpath}/${file}`;
    const publicUrl = `${express_server}${
        download ? "download/" : ""
    }${bucket}/${path}`;
    if (download) {
        window.location = publicUrl;
    } else {
        window.open(publicUrl);
    }
};

const getReadableFileSizeString = (fileSizeInBytes: number) => {
    var i = -1;
    var byteUnits = [" КБ", " МБ", " ГБ", " ТБ", "ПБ", "ЭБ", "ЗБ", "ЙБ"];
    do {
        fileSizeInBytes /= 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
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
    const files: FileList = dataTransfer.files;
    const path = `${bucket}/${rootPath}${
        subpath.value
    }`;
    let formData = new FormData();
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        formData.append("file", file, encodeURI(file.name));
    }
    console.log(formData.values)
    const { error } = useFetch(`${express_server}upload`, {
        method: "post",
        query: { folder: path },
        body: formData,
    });
    pathComponents.value.push(undefined as never)
    setTimeout(() => {
        pathComponents.value.pop()
    }, 100);
};

const uploadOverlay = ref(false);
</script>

<template>
    <div class="root">
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
        </div>
        <hr />
        <div
            class="body"
            @dragenter="enterdragAndDrop"
            @dragleave="exitdragAndDrop"
            @dragover="handledragAndDrop"
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
                >
                    <div class="main-data">
                        <Icon
                            :name="
                                entity.isFile
                                    ? 'codicon:file-pdf'
                                    : 'codicon:folder'
                            "
                        />
                        <p>{{ entity.name }}</p>
                    </div>
                    <div class="actions" v-if="entity.isFile">
                        <p class="size">
                            {{ getReadableFileSizeString(entity.size || 0) }}
                        </p>
                        <UButton
                            @click="accessFile(subpath, entity.name, true)"
                            variant="ghost"
                        >
                            <Icon name="codicon:cloud-download" />
                        </UButton>
                        <UButton
                            @click="accessFile(subpath, entity.name, false)"
                            variant="ghost"
                        >
                            <Icon name="codicon:eye" />
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.root {
    max-width: 25rem;

    background-color: rgba(var(--inverted-rgb), 0.05);
    outline: 1px solid rgba(var(--inverted-rgb), 0.2);

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
        height: 10rem;
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
            transition: all 0.3s;
            pointer-events: none;
        }
        .files {
            display: flex;
            flex-direction: column;

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
                    max-width: calc(100% - 10rem);
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

        .loading,
        .empty {
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
}

.dnd-overlay-enter-from,
.dnd-overlay-leave-to {
    opacity: 0;
}
</style>
