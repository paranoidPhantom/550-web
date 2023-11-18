<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
import { getReadableFileSizeString } from "@/utils/useFormattedFileSize";
import normalize from "normalize-path";
const props = defineProps<{
    file_urls: string[];
}>();

const { express_server_port } = useAppConfig();

const {
    public: { service_domain },
} = useRuntimeConfig();
const express_server = `http://${service_domain}:${express_server_port}/`;

const completeList = computedAsync(async () => {
    let retval: {
        preview: string;
        href: string;
        icon: string;
        size: string;
        name: string;
    }[] = [];
    const { data: file_data, error } = await useFetch(
        `${express_server}file_data?routes=${props.file_urls.concat(",")}`
    );
    if (error.value) return { error: error.value };
    props.file_urls.forEach((route: string, index: number) => {
        const dotSplit = route.split(".");
        const slashSplit = route.split("/");
        const ext = dotSplit[dotSplit.length - 1];
        const good_ext = [
            "css",
            "csv",
            "doc",
            "html",
            "jpg",
            "js",
            "png",
            "ppt",
            "rs",
            "sql",
            "svg",
            "ts",
            "tsx",
            "vue",
            "xls",
            "zip",
            "pdf"
        ];
        retval.push({
            preview: `${express_server}` + normalize(`${route}`),
            href: `${express_server}` + normalize(`download/${route}`),
            icon: good_ext.includes(ext)
                ? `ph:file-${ext}-light`
                : `ph:file-light`,
            size: getReadableFileSizeString(
                (file_data.value as { size: number }[])[index].size
            ),
            name: decodeURI(slashSplit[slashSplit.length - 1]),
        });
    });
    return retval;
});

const previewAttachment = (event: Event, preview_link: string) => {
    event.preventDefault();
    window.open(preview_link)
}
</script>

<template>
    <div class="__attachments">
        <UButton
            v-if="Array.isArray(completeList)"
            class="attachment"
            v-for="link in completeList"
            :download="link.name"
            :to="link.href"
            variant="ghost"
        >
            <Icon :name="link.icon" />
            <div class="info">
                <p class="name">{{ link.name }}</p>
                <p class="size">{{ link.size }}</p>
            </div>
            <UButton @click="event => previewAttachment(event, link.preview)" class="_preview" variant="ghost" icon="i-heroicons-eye"></UButton>
        </UButton>
        <p
            v-else-if="completeList && completeList.hasOwnProperty('error')"
            class="text-red-500"
        >
            {{ completeList.error }}
        </p>
    </div>
</template>

<style lang="scss">
.__attachments {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    .attachment {
        display: flex;
        text-decoration: none !important;
        max-width: fit-content;
        padding: 0.7rem;
        >svg {
            font-size: 1.5rem;
        }
        .size {
            font-size: 0.7rem;
        }
        ._preview {
            opacity: 0;
            margin-left: 0.5rem;
            flex-shrink: 2;
        }
        &:hover {
            ._preview {
                opacity: 1;
            }
        }
    }
}
</style>
