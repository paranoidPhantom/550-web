<script setup lang="ts">
import { computedAsync } from "@vueuse/core";
const modal_state = reactive({
    open: false,
    selected: undefined,
    searching: false,
    results: undefined,
});

const globalModalOpen = useState("search_bar_open", () => false);

defineShortcuts({
    ctrl_k: {
        handler: () => {
            modal_state.open = true;
        },
    },
});

const supabase = useSupabaseClient();

const searchResults = async (query: string) => {
    const pattern = query.trim().split(" ").map(str => `(${str}:*)`).join("|");
    console.log(pattern)
    modal_state.searching = true;
    let { data: results } = query
        ? await supabase.rpc(`content_and_name`, { query: pattern } as any) //
        : await supabase.from("content").select();
    modal_state.searching = false;
    if (!results) {
        modal_state.results = [] as any;
        return [];
    }
    modal_state.results = results as any;
    if (!Array.isArray(results)) results = [results];
    return results.map((result: any) => ({
        id: result.route,
        label: result.name,
        route: result.route,
    }));
};

const groups = [
    {
        key: "results",
        label: (q: string) => q && `Поиск по запросу “${q}”...`,
        search: searchResults,
    },
];

const router = useRouter();

watchEffect(() => {
    if (modal_state.selected) {
        modal_state.open = false;
        const route = (modal_state.selected as any).route;
        window.location = route;
    }
});

watchEffect(() => {
    globalModalOpen.value = modal_state.open;
});

watchEffect(() => {
    modal_state.open = globalModalOpen.value;
});
</script>

<template>
    <UModal v-model="modal_state.open">
        <UCommandPalette
            ref="pallete"
            v-model="modal_state.selected"
            :groups="groups"
            placeholder="Поиск..."
        >
            <template #empty-state>
                <div
                    class="flex flex-col items-center justify-center py-6 gap-3"
                >
                    <Icon
                        class="text-4xl"
                        :name="
                            modal_state.results === undefined
                                ? 'line-md:search-twotone'
                                : modal_state.searching
                                ? 'svg-spinners:180-ring'
                                : 'line-md:cloud-off-outline-loop'
                        "
                    />
                    <span class="italic text-sm">{{
                        modal_state.results === undefined
                            ? "Поиск по сайту"
                            : modal_state.searching
                            ? ""
                            : "По данному запросу не найдено результатов"
                    }}</span>
                </div>
            </template>
        </UCommandPalette>
    </UModal>
</template>
