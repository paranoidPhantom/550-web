<script setup lang="ts">
const props = defineProps<{
    state_key: string;
    enabled: boolean;
    multiple?: boolean;
    type?: string | string[];
    bucket?: string;
    root?: string;
}>();

const ModalState = ref(props.enabled);

watchEffect(() => {
    ModalState.value = props.enabled;
});
</script>

<template>
    <UModal v-model="ModalState">
        <FolderViewer
            :picker_mode="{ key: state_key, type: type, multiple: props.multiple === true }"
            :bucket="bucket || ''"
            :root="root || ''"
        />
    </UModal>
</template>
