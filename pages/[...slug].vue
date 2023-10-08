<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";
definePageMeta({
    middleware: async (to, from) => {
        const supabase = useSupabase();
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
    current_url.join("/");
}

current_url = `/${current_url}`

const routeData = ref()
const routeContent = ref()

const routeContentTree = computedAsync(async () => {
    const ast = await parseMarkdown(routeContent.value)
    return ast
}, null)

const updateFromData = (data: any) => {
    routeData.value = data
    routeContent.value = routeData.value.content
}

const supabase = useSupabase();
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
            updateFromData(payload.new)
        }
    )
    .subscribe();
</script>

<template>
    <main>
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
    </main>
</template>
