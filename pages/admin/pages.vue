<script setup lang="ts">
import { useFormatedDate } from "@/utils/useFormatedDate";
definePageMeta({
    name: "Страницы",
    layout: "admin",
    middleware: "auth",
    login_message: "Для доступа к списку страниц необходимо авторизоваться",
});

const columns = [
    {
        key: "article_thumbnail",
    },
    {
        key: "name",
        label: "Название",
        sortable: true
    },
    {
        key: "route",
        label: "Путь",
        sortable: true
    },
    {
        key: "created_at",
        label: "Создана",
        sortable: true
    },
    {
        key: "actions",
    },
];

const {
    tableNames: { content: tableName, news: newsTableName },
} = useAppConfig();

const supabase = useSupabaseClient();

const { push } = useRouter();

const { data: pages } = await supabase
    .from(tableName)
    .select(`route, created_at, name, ${newsTableName}(thumbnail)`);

const formattedPages = computed(() => {
    let result: any[] = [];
    pages?.map((page: any, index: number) => {
        let correspondingObject = page;
        correspondingObject.article_thumbnail = page.news
            ? page.news.thumbnail
            : null;
        correspondingObject.news = undefined;
        correspondingObject.created_at = page.created_at;
        result[index] = correspondingObject;
    });
    return result;
});

const q = ref('')
const filteredRows = computed(() => {
  if (!q.value) {
    return formattedPages.value
  }
  return formattedPages.value.filter((page) => {
    return Object.values(page).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})
</script>

<template>
    <div class="__admin-pages">
        <div class="page-list">
            <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
                <UInput v-model="q" placeholder="Поиск..." />
            </div>
            <UTable style="width: 100%;" :rows="filteredRows" :columns="columns">
                <template #article_thumbnail-data="{ row }">
                    <img
                        class="article-thumbnail"
                        :src="row.article_thumbnail"
                        alt=""
                        v-if="row.article_thumbnail"
                    />
                    <UPopover v-else mode="hover">
                        <Icon
                            style="width: 30%; margin: 0 35%; height: 100%; min-width: 1rem;"
                            :name="
                                row.article_thumbnail === null
                                    ? `i-heroicons-x-mark-solid`
                                    : `i-streamline-interface-layout-border-none-border-cell-format-formatting-none`
                            "
                        />
                        <template #panel>
                            <p class="p-2">
                                {{
                                    row.article_thumbnail === null
                                        ? `У страницы нет ассоциированной статьи`
                                        : `У статьи нет ассоциированной картинки`
                                }}
                            </p>
                        </template>
                    </UPopover>
                </template>
                <template #created_at-data="{ row }">
                    {{ useFormatedDate(row.created_at) }}
                </template>
                <template #actions-data="{ row }">
                    <UButton
                        @click="
                            push({
                                path: '/admin/editor',
                                query: { editing: row.route },
                            })
                        "
                        icon="i-heroicons-pencil-square"
                        variant="ghost"
                    />
                </template>
            </UTable>
        </div>
    </div>
</template>

<style scoped lang="scss">
.__admin-pages {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    .article-thumbnail {
        width: 8rem;
        border-radius: 0.5rem;
    }
    .divider {
        width: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    .page-list {
        width: 100%;
        max-height: calc(100vh - 5rem);;
        overflow-y: auto;
    }
}
</style>
