<script setup lang="ts">
interface props {
    bucket: string;
    root: string;
}
const open = ref(false)

defineProps<props>()

defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [open],
    handler: () => { open.value = false }
  }
})
</script>

<template>
    <div class="__fs">
        <USlideover v-model="open" class="__fs-slideover">
            <div class="component-container">
                <FolderViewer :bucket="bucket" :root="root"/>
            </div>
        </USlideover>
        <UButton color="white" @click="open = true">
            <Icon name="line-md:clipboard-list-twotone"/>
            Посмотреть документы
        </UButton>
    </div>
</template>

<style lang="scss">
.__fs-slideover {
    .component-container {
        .root {
            margin: 1rem;
            width: 100%;
            --files-frame-height: calc(100vh - 4.5rem);
        }
    }
}
</style>