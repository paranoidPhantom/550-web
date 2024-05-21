<script setup lang="ts">
defineProps<{
    title: string;
    icon: string;
    home: string;
}>();

const options = [
    {
        label: "Изображения",
        id: "images",
    },
    {
        label: "Документы",
        id: "docs",
    },
    {
        label: "Другое",
        id: "misc",
    },
];

const folderViewerBucket = ref(options[0]);
const fs_state = ref(false);

const {
    public: { service_domain },
} = useRuntimeConfig();
</script>

<template>
    <header>
        <USlideover v-model="fs_state">
            <div class="__fs-wrapper">
                <USelectMenu v-model="folderViewerBucket" :options="options">
                    <UAlert
                        :title="folderViewerBucket.label"
                        variant="subtle"
                        icon="i-heroicons-command-line"
                        color="primary"
                    />
                </USelectMenu>
                <UIcon name="i-heroicons-arrow-down-solid" class="arrow" />
                <FolderViewer
                    class="fs full"
                    :bucket="folderViewerBucket.id"
                    root=""
                />
            </div>
        </USlideover>
        <div class="title" @click="navigateTo(home)">
            <UIcon :name="icon" />
            <h1>{{ title }}</h1>
        </div>

        <div class="edge">
            <UButton variant="soft" @click="fs_state = true"
                ><UIcon name="heroicons:folder-open-20-solid"
            /></UButton>
            <UButton
                variant="soft"
                :to="`/supabase`"
                target="_blank"
                class="h-full"
                color="green"
                ><UIcon name="ri:supabase-fill"
            /></UButton>
            <ColorModeSwitch />
            <AccountInfo />
        </div>
    </header>
    <div class="header-placeholder" />
</template>

<style lang="scss">
.__fs-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    flex-shrink: 0;
    height: 100%;
    .arrow {
        font-size: 1.5rem;
        width: 100%;
    }
    .fs {
        max-width: unset;
        --files-frame-height: 20rem;
    }
}
</style>

<style scoped lang="scss">
header {
    z-index: 1;
    height: 3rem;
    position: fixed;
    border-bottom: 1px solid rgba(var(--inverted-rgb), 0.1);
    backdrop-filter: blur(8px);
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    .title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        svg {
            width: 1.5rem;
        }
        svg,
        h1 {
            font-size: 1.2rem;
        }
    }
    .edge {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
}

.header-placeholder {
    height: 3rem;
    opacity: 0;
    pointer-events: none;
}
</style>
