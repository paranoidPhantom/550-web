<script setup lang="ts">
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime";
import { computedAsync } from "@vueuse/core";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useFormatedDate } from "@/utils/useFormatedDate";
import normalize from "normalize-path";
const props = defineProps<{
    filters?: {
        match: string;
        value: string;
    };
}>();

interface post {
    route: string;
    restricted: boolean;
    created_at: string;
    tags: {
        ids: string[];
        labels: string[];
    };
    content: { content: string };
}

const {
    tableNames: { content: contentTableName, blog: blogTableName },
} = useAppConfig();

const supabase = useSupabaseClient();

const posts = ref<post[]>([]);
let { data, error } = await supabase
    .from(blogTableName)
    .select("*, content (content)");

posts.value = data as post[];

const { express_server_port } = useAppConfig();

const {
    public: { service_domain },
} = useRuntimeConfig();

const express_server = `http://${service_domain}:${express_server_port}/`;

const renderedPosts = computedAsync(async () => {
    const {
        data: { value: user_meta },
    } = useFetch("/api/user-meta");
    const retval = await Promise.all(
        posts.value.map(async (post: post, index: number) => {
            if (!post.restricted) {
                const tree = (await parseMarkdown(post.content.content)) as any;
                const split = post.route.split("/");
                const username = split[2];
                const href = `/blog/${username}?post=${split[3]}`;
                if (!props.filters || props.filters.value === username) {
                    return {
                        tree: tree,
                        href: href,
                        date: post.created_at,
                        tags: post.tags,
                        author: (user_meta as any)[username],
                    };
                } else {
                    return null;
                }
            }
        })
    );
    return retval;
}, []);

const handle_postgres_changes = (
    payload: RealtimePostgresChangesPayload<{ [key: string]: any }>
) => {
    if (payload.table === blogTableName) {
        switch (payload.eventType) {
            case "INSERT":
                const newPost = payload.new as post;
                posts.value.push(newPost);
                break;
            case "UPDATE":
                const updatedPost = payload.new as post;
                const updatedRoute = updatedPost.route;
                posts.value.forEach((post: post, index: number) => {
                    if (post.route === updatedRoute) {
                        const contentPreserver = post.content;
                        posts.value[index] = updatedPost;
                        posts.value[index].content = contentPreserver;
                    }
                });
                break;
            case "DELETE":
                const deletedPost = payload.old as post;
                const deletedRoute = deletedPost.route;
                posts.value.forEach((post: post, index: number) => {
                    if (post.route === deletedRoute) {
                        posts.value.splice(index);
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
                posts.value.forEach((post: post, index: number) => {
                    if (post.route === updatedRoute) {
                        posts.value[index].content.content =
                            payload.new.content;
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
        { event: "*", schema: "public", table: blogTableName },
        handle_postgres_changes
    )
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: contentTableName },
        handle_postgres_changes
    )
    .subscribe();
</script>

<template>
    <div class="__blog-posts">
        <template v-for="post in renderedPosts">
            <div class="post" v-if="post" :key="post?.href">
                <div class="author flex gap-4 items-center" v-if="post">
                    <UAvatar
                        size="md"
                        :src="`${express_server}${normalize(post?.author.pfp)}`"
                    />
                    <div class="flex flex-col">
                        <h2>
                            {{
                                `${post?.author.first_name} ${post?.author.middle_name} ${post?.author.last_name}`
                            }}
                        </h2>
                        <div class="list flex gap-4 pt-1">
                            <UBadge
                                variant="subtle"
                                size="xs"
                                v-for="tag in post.tags.labels" :label="tag"
                            />
                        </div>
                    </div>
                    <p class="text-sm opacity-50 ml-auto">
                        {{ useFormatedDate(post.date, true) }}
                    </p>
                </div>
                <hr style="border-color: rgba(var(--inverted-rgb), 0.2)" />
                <MarkdownForamatter>
                    <MDC :value="post?.tree" />
                </MarkdownForamatter>
            </div>
        </template>
    </div>
</template>

<style scoped lang="scss">
.__blog-posts {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    .post {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 50rem;
        max-width: 100%;
        border-radius: 1rem;
        outline: rgba(var(--inverted-rgb), 0.2) 1px solid;
        padding: 1rem 1rem;
    }
}
</style>
