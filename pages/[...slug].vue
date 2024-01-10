<script setup lang="ts">
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";

definePageMeta({
    middleware: async (to, from) => {
        const supabase = useSupabaseClient();
        const { data, error } = await supabase
            .from("content")
            .select()
            .eq("route", to.path);
        if (!data || data.length === 0 || to.path.startsWith("/blog")) {
            abortNavigation(
                createError({
                    statusCode: 404,
                    message: "Страница не найдена...",
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
const pageLoaded = ref(false)
const routeContentTree = ref()

const updateFromData = async (data: any) => {
    routeData.value = data
    pageLoaded.value = true
    routeContentTree.value = await parseMarkdown(data.content)
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
        (payload: RealtimePostgresChangesPayload) => {
            switch (payload.eventType) {
                case "UPDATE":
                    updateFromData(payload.new)
                    break;
                case "DELETE":
                    if (!window) return
                    window.location.reload()
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
            <Meta property="og:title" :content="routeContentTree.data.title" />
            <Meta property="og:description" :content="routeContentTree.data.description" />
        </Head>
        <MarkdownForamatter>
            <MDC
                v-if="routeData && routeData.content"
                tag="article"
                :value="routeData.content"
            />
        </MarkdownForamatter>
    </div>
</template>

<style lang="scss">
.__content {
    display: flex;
    justify-content: center;
    align-items: center;
	max-width: 100%;
	padding: 0 10%;
    .page-await {
		max-width: 1000px;
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