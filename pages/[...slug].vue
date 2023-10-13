<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";
definePageMeta({
    middleware: async (to, from) => {
        const supabase = useSupabaseClient();
        const { data, error } = await supabase
            .from("content")
            .select()
            .eq("route", to.path);
        if (!data || data.length === 0) {
            abortNavigation(
                createError({
                    statusCode: 404,
                    statusMessage: "Страница не найдена...",
                })
            );
        }
    },
});

const {
    params: { slug },
} = useRoute();

let current_url = slug;
if (Array.isArray(current_url)) {
    current_url = current_url.join("/");
}

current_url = `/${current_url}`


const routeData = ref()
const routeContent = ref()
const pageLoaded = ref(false)

const routeContentTree = computedAsync(async () => {
    const ast = await parseMarkdown(routeContent.value)
    return ast
}, null)

const updateFromData = (data: any) => {
    routeData.value = data
    routeContent.value = routeData.value.content
    if (process.server) return
    pageLoaded.value = true
}

const supabase = useSupabaseClient();
const { data, error } = await supabase
    .from("content")
    .select()
    .eq("route", current_url)
    .single();

updateFromData(data)

const content = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content", filter: `route=eq.${current_url}` },
        (payload) => {
            switch (payload.eventType) {
                case "UPDATE":
                    updateFromData(payload.new)
                    break;
                case "DELETE":
                    if (!window) return
                    window.location.reload()
                default:
                    break;
            }
        }
    )
    .subscribe();
</script>

<template>
    <div class="__content">
        <Icon name="svg-spinners:ring-resize" v-if="!pageLoaded" class="page-await"/>
        <Head v-if="routeContentTree">
            <Title>{{ routeContentTree.data.title }}</Title>
            <Meta name="description" :content="routeContentTree.data.description" />
        </Head>
        <MarkdownForamatter>
            <ContentRendererMarkdown
                v-if="routeContentTree"
                :value="routeContentTree"
            />
        </MarkdownForamatter>
    </div>
</template>

<style lang="scss">
.__content {
    padding: 0 10%;
    display: flex;
    justify-content: center;
    align-items: center;
    .page-await {
        font-size: 2rem;
        margin-top: calc(50vh - 5rem);
    }
}

@media (max-width: 800px) {
    .__content {
        padding: 0 1rem;
    }
}
</style>