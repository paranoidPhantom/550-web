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
    authorMode?: boolean;
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

const loaderStatus = ref(false);

const {
    tableNames: { content: contentTableName, blog: blogTableName },
} = useAppConfig();

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const posts = ref<post[]>([]);
let { data: initial_posts } = await supabase
    .from(blogTableName)
    .select("*, content (content)");

posts.value = initial_posts as post[];

const {
    public: { service_domain },
} = useRuntimeConfig();

const renderedPosts = ref<any[]>([]);

const searchQuery = ref("")
const selectedTag = ref()

const renderPosts = async () => {
    if (!props.authorMode) {
        loaderStatus.value = true
    }
    const {
        data: { value: user_meta },
    } = await useFetch("/api/public/_user-meta");
    const retval = await Promise.all(
        posts.value.map(async (post: post, index: number) => {
            if (!post.restricted || props.authorMode) {
                const tree = (await parseMarkdown(post.content.content)) as any;
                const split = post.route.split("/");
                const username = split[2];
                const href = `/blog/${username}?post=${split[3]}`;
                let visible = true
                if (selectedTag.value && !post.tags.labels.includes(selectedTag.value)) visible = false
                if (searchQuery.value !== "") {
                    let match = false
                    const lower = post.content.content.toLowerCase()
                    const splitQuery = searchQuery.value.trim().split(" ")
                    splitQuery.forEach((querySegment: string) => {
                        if (lower.includes(querySegment.toLowerCase())) match = true
                    })
                    if (!match) {
                        visible = false
                    }
                }
                if (
                    !props.filters ||
                    props.filters.value === username ||
                    (props.authorMode &&
                        user.value?.app_metadata.can_edit_content)
                ) {
                    return {
                        tree: tree,
                        href: href,
                        date: post.created_at,
                        tags: post.tags,
                        author: user_meta ? (user_meta as any)[username] : {},
                        restricted: post.restricted,
                        route: post.route,
                        visible: visible,
                        id: split[3]
                    };
                } else {
                    return null;
                }
            }
        })
    );
    renderedPosts.value = retval;
    loaderStatus.value = false
};

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
    renderPosts();
};

const newTagForms = ref<{ [key: string]: string }>({});

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

const toggleRestricted = async (route: string, setTo: boolean) => {
    const { error } = await supabase
        .from(blogTableName)
        .update({ restricted: setTo } as never)
        .eq("route", route);
    if (!error) {
        posts.value.forEach((post: post, index: number) => {
            if (post.route === route) {
                posts.value[index].restricted = setTo;
            }
        });
    }
};

const createTag = (route: string) => {
    const newTagName = newTagForms.value[route];
    if (!newTagName) return;
    posts.value.forEach(async (post: post, index: number) => {
        if (post.route === route) {
            const tags = post.tags;
            tags.labels.push(newTagName);
            const { error } = await supabase
                .from(blogTableName)
                .update({ tags: tags } as never)
                .eq("route", route);
        }
    });
    newTagForms.value[route] = "";
};

const deleteTag = (route: string, deleteTageName: string) => {
    posts.value.forEach(async (post: post, index: number) => {
        if (post.route === route) {
            const tags = post.tags;
            tags.labels.splice(tags.labels.indexOf(deleteTageName), 1);
            const { error } = await supabase
                .from(blogTableName)
                .update({ tags: tags } as never)
                .eq("route", route);
        }
    });
};

watchEffect(() => {
    if (posts.value) renderPosts();
});

const availableTags = computed(() => {
    let tags = new Set()
    posts.value.forEach(async (post: post) => {
        post.tags.labels.map((tag: string) => tags.add(tag))
    });
    return tags
})

onMounted(renderPosts);
</script>

<template>
    <div class="__blog-posts">
        <div class="options flex justify-between" v-if="!authorMode">
            <div class="tags flex gap-4 items-center">
                <UBadge class="flex gap-1 items-center cursor-pointer" @click="selectedTag = tag" v-for="tag in availableTags" :variant="selectedTag === tag ? 'outline' : 'subtle'" size="lg">
                    <Icon v-if="selectedTag === tag" @click="(event: Event) => { selectedTag = undefined; event.stopPropagation() }" class="text-lg" name="i-heroicons-x-mark-solid"/>
                    {{ (tag as string) }}
                </UBadge>
                <Icon style="font-size: 1rem" v-show="loaderStatus" name="svg-spinners:ring-resize" />
            </div>
            <UInput placeholder="Поиск..." v-model="searchQuery"/>
        </div>
        <template v-for="post in renderedPosts">
            <div class="post" v-if="post" v-show="post.visible" :id="post.id" :key="post?.href">
                <div class="author flex gap-4 items-center" v-if="post">
                    <UAvatar
                        size="md"
                        :alt="`${post.author.first_name} ${post.author.middle_name}`"
                        :icon="
                            authorMode &&
                            post.author.username ===
                                user?.user_metadata.username
                                ? 'i-heroicons-pencil-square'
                                : undefined
                        "
                        :src="
                            authorMode &&
                            post.author.username ===
                                user?.user_metadata.username || !post?.author.pfp
                                ? ``
                                : `https://${service_domain}/fs/${normalize(
                                      post?.author.pfp
                                  )}`
                        "
                    />
                    <div class="flex flex-col">
                        <h2>
                            {{
                                authorMode &&
                                post.author.username ===
                                    user?.user_metadata.username
                                    ? `Ваша публикация`
                                    : `${post?.author.first_name} ${post?.author.middle_name} ${post?.author.last_name}`
                            }}
                        </h2>
                        <div v-if="!authorMode" class="list flex gap-4 pt-1">
                            <UBadge
                                variant="subtle"
                                size="xs"
                                v-for="tag in post.tags.labels"
                                :label="tag"
                            />
                        </div>
                    </div>
                    <p class="text-sm opacity-50 ml-auto text-right">
                        {{ useFormatedDate(post.date, true) }}
                    </p>
                </div>
                <template v-if="authorMode">
                    <hr style="border-color: rgba(var(--inverted-rgb), 0.2)" />
                    <p class="flex items-center gap-4 pl-4">
                        Пост скрыт:
                        <UToggle
                            @click="
                                toggleRestricted(post.route, !post.restricted)
                            "
                            :model-value="post.restricted"
                        />
                    </p>
                    <p class="ml-4">Теги:</p>
                    <div class="flex flex-col gap-4 ml-8">
                        <template v-for="tag in post.tags.labels"
                            ><div class="flex gap-4">
                                <UBadge
                                    variant="subtle"
                                    size="xs"
                                    class="gap-2"
                                    >{{ tag }}</UBadge
                                ><UButton
                                    size="2xs"
                                    icon="i-heroicons-trash"
                                    variant="link"
                                    color="red"
                                    @click="deleteTag(post.route, tag)"
                                /></div
                        ></template>
                        <div class="flex gap-2">
                            <UInput
                                size="2xs"
                                class="w-fit"
                                placeholder="Новый тег..."
                                v-model="newTagForms[post.route]"
                            />
                            <UButton
                                size="2xs"
                                icon="i-heroicons-plus-solid"
                                variant="soft"
                                color="green"
                                @click="createTag(post.route)"
                            />
                        </div>
                    </div>
                </template>
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

    .options, .post {
        width: 50rem;
        max-width: 100%;
    }
    .post {
        display: flex;
        flex-direction: column;
        border-radius: 1rem;
        background-color: rgba(var(--inverted-rgb), 0.05);
        padding: 1rem 1rem;
        gap: 1rem;
    }
}
</style>
