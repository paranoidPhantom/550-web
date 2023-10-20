<script setup lang="ts">
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
definePageMeta({
    name: "Новости",
});

interface article {
    route: string;
    title?: string;
    description?: string;
    created_at: string;
    thumbnail: string;
    link_text: string;
    content: { content: string };
}

const {
    tableNames: { content: contentTableName, news: newsTableName },
} = useAppConfig();

const supabase = useSupabaseClient();
const news: Ref<article[]> = ref([]);

let { data, error } = await supabase
    .from("news")
    .select("*, content (content)");

news.value = data as unknown as article[];

const reparseContent = () => {
    news.value.forEach(async (article: article, index: number) => {
        const content = article.content.content;
        const {
            data: { title, description },
        } = await parseMarkdown(content);
        news.value[index].title = title;
        news.value[index].description = description;
    });
};

const handle_postgres_changes = (
    payload: RealtimePostgresChangesPayload<{ [key: string]: any }>
) => {
    if (payload.table === newsTableName) {
        switch (payload.eventType) {
            case "INSERT":
                const newArticle = payload.new as article;
                news.value.push(newArticle);
                break;
            case "UPDATE":
                const updatedArticle = payload.new as article;
                const updatedRoute = updatedArticle.route;
                news.value.forEach((article: article, index: number) => {
                    if (article.route === updatedRoute) {
                        const contentPreserver = article.content;
                        news.value[index] = updatedArticle;
                        news.value[index].content = contentPreserver;
                    }
                });
                reparseContent();
                break;
            case "DELETE":
                const deletedArticle = payload.old as article;
                const deletedRoute = deletedArticle.route;
                news.value.forEach((article: article, index: number) => {
                    if (article.route === deletedRoute) {
                        news.value.splice(index);
                    }
                });
                break;
        }
    } else if (payload.table === contentTableName) {
        const updatedRoute =
            (payload.old as { route: string }).route ||
            (payload.new as { route: string }).route;
        switch (payload.eventType) {
            case "UPDATE":
                news.value.forEach((article: article, index: number) => {
                    if (article.route === updatedRoute) {
                        news.value[index].content.content = payload.new.content;
                        reparseContent();
                    }
                });
                break;
        }
    }
};

const listener = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news" },
        handle_postgres_changes
    )
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content" },
        handle_postgres_changes
    )
    .subscribe();

reparseContent();

onMounted(reparseContent);
</script>

<template>
    <div class="__news">
        <ClientUtilityNewsList :news="news" />
    </div>
</template>
