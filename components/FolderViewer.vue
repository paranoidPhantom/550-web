<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
interface props {
    bucket: string,
    root: string
}
const { bucket, root: rootPath } = defineProps<props>()
const { storage } = useSupabase()
const loading = ref(false)

const pathComponents = ref([])

const subpath = computed(() => {
    loading.value = true
    return pathComponents.value.join("/")
})

const rawFileData = computedAsync(async () => {
    const path = `${rootPath}/${subpath.value}`
    const { data, error } = await storage
        .from(bucket)
        .list(path, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });
    return data
}, null)

interface fsEntity {
    name: string;
    isFile?: boolean;
    size?: number;
    id?: string;
}

const currentFiles = computed(() => {
    let result: fsEntity[] = []
    const raw = rawFileData.value
    if (raw === null) { return null }
    for (let index = 0; index < raw.length; index++) {
        let resultEntity: fsEntity = {
            name: ""
        }
        const fsEntity = raw[index];
        resultEntity.name = fsEntity.name
        resultEntity.isFile = fsEntity.id !== null
        if (resultEntity.isFile) {
            resultEntity.size = fsEntity.metadata.contentLength
            resultEntity.id = fsEntity.id
        }
        result.push(resultEntity)
    }    
    loading.value = false
    return result
})

function downloadURI(uri: string, name: string) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const { express_server_url, express_server_port } = useAppConfig()

const accessFile = (subpath: string, file: string | undefined, download: boolean) => {
    const path = `${rootPath}/${subpath}/${file}`
    const publicUrl = `http://${express_server_url}:${express_server_port}/${bucket}/${rootPath}/${subpath}/${file}`
    if (!download) {
        window.open(publicUrl)
    } else {
        downloadURI(publicUrl, file as string)
    }
}

const getReadableFileSizeString = (fileSizeInBytes: number) => {
    var i = -1;
    var byteUnits = [' КБ', ' МБ', ' ГБ', ' ТБ', 'ПБ', 'ЭБ', 'ЗБ', 'ЙБ'];
    do {
        fileSizeInBytes /= 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}
</script>

<template>
    <div class="root">
        <div class="path">
            <div class="node" @click="pathComponents = []">
                <Icon name="codicon:root-folder" />
            </div>
            <template v-for="(node, index) in pathComponents">
                <Icon name="codicon:arrow-right" />
                <div class="node" @click="pathComponents = pathComponents.splice(0, index + 1)">
                    <Icon name="codicon:folder" />
                    <p>{{ node }}</p>
                </div>
            </template>
        </div>
        <hr>
        <div class="body">
            <div class="loading" v-if="currentFiles === null || loading">
                <Icon name="svg-spinners:blocks-shuffle-3" />
            </div>
            <div class="empty" v-else-if="Array.isArray(currentFiles) && currentFiles.length === 0">
                <Icon name="mdi:magnify-close" />
                <p>Тут пусто...</p>
            </div>
            <div class="files" v-else>
                <div class="entity" v-for="(entity) in currentFiles" :key="`${entity.name}_${entity.id}`"
                    @click="() => { entity.name && !entity.isFile ? pathComponents.push(entity.name) : null }">

                    <div class="main-data">
                        <Icon :name="entity.isFile ? 'codicon:file-pdf' : 'codicon:folder'" />
                        <p>{{ entity.name }}</p>
                    </div>
                    <div class="actions" v-if="entity.isFile">
                        <p class="size">{{ getReadableFileSizeString(entity.size || 0) }}</p>
                        <UButton @click="accessFile(subpath, entity.name, true)" variant="ghost">
                            <Icon name="codicon:cloud-download" />
                        </UButton>
                        <UButton @click="accessFile(subpath, entity.name, false)" variant="ghost">
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

            >svg {
                font-size: 1.5rem;
            }
        }
    }
}
</style>