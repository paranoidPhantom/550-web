<script setup lang="ts">
import { computedAsync } from "@vueuse/core"
import { getReadableFileSizeString } from "@/utils/useFormattedFileSize"
import normalize from 'normalize-path'
const props = defineProps<{
    file_urls: string[],
}>()

const { express_server_port } = useAppConfig();

const {
    public: { service_domain },
} = useRuntimeConfig();
const express_server = `http://${service_domain}:${express_server_port}/`;

const completeList = computedAsync(async () => {
    let retval: {
            href: string;
            icon: string;
            size: string;
            name: string;
    }[] = []
    const { data: file_data, error } = await useFetch(`${express_server}file_data?routes=${props.file_urls.concat(",")}`)
    if (error.value) return { error: error.value }
    props.file_urls.forEach((route: string, index: number) => {
        const dotSplit = route.split(".")
        const slashSplit = route.split("/")
        retval.push({
            href: normalize(`${express_server}download/${route}`),
            icon: `ph-file:${dotSplit[dotSplit.length - 1]}-light`,
            size: getReadableFileSizeString((file_data.value as { size: number }[])[index].size),
            name: slashSplit[slashSplit.length - 1]
        })
    })
    return retval
})
</script>

<template>
    <div class="__attachments">
        <a v-if="completeList && !completeList.hasOwnProperty('error')" class="attachment" v-for="link in completeList">
            <pre>{{ link }}</pre>
        </a>
        <p v-else-if="completeList && completeList.hasOwnProperty('error')" class="text-red-500">{{ completeList.error }}</p>
    </div>
</template>
