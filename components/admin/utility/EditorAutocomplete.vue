<script setup lang="ts">
import { useAutocomplete } from "@/utils/useAutocomplete";
import normalize from "normalize-path";
import type {
    completion,
    completionField,
    runnerFields,
} from "@/utils/useAutocomplete";

const properties = defineProps<{
    input: string | undefined;
    index: number;
}>();

const suggestions = computed(() => {
    return useAutocomplete(properties.input as string, properties.index);
});

const suggestionFieldsModal: {
    title: string;
    enabled: boolean;
    fields: completionField[] | undefined;
    callback: Function | undefined;
    button: string | undefined;
    fieldValues: runnerFields;
} = reactive({
    title: "",
    enabled: false,
    fields: undefined,
    callback: undefined,
    button: undefined,
    fieldValues: {},
});

const currentInput = useState("editor_input_global", () => "");

const applyCompletion = (completion: string) => {
    currentInput.value = `${(properties.input as string).slice(
        0,
        properties.index
    )}${completion}${(properties.input as string).slice(properties.index)}`;
};

const suggestionExecute = (suggestion: completion) => {
    if (suggestion.fields) {
        suggestionFieldsModal.title = suggestion.title;
        suggestionFieldsModal.enabled = true;
        suggestionFieldsModal.fields = suggestion.fields;
        suggestionFieldsModal.callback = suggestion.runner;
        suggestionFieldsModal.button = suggestion.button;
    } else {
        const completion = suggestion.runner.call(this);
        applyCompletion(completion);
    }
};

const fireModalInput = () => {
    suggestionFieldsModal.enabled = false;
    if (suggestionFieldsModal.callback) {
        const completion = suggestionFieldsModal.callback.call(
            this,
            suggestionFieldsModal.fieldValues
        );
        applyCompletion(completion);
        suggestionFieldsModal.fieldValues = {};
    }
};

const file_pickers = reactive({
    image: false,
    attachment: false,
});

const set_file_picker = (event: Event, key: keyof typeof file_pickers) => {
    event.stopPropagation();
    file_pickers[key] = false;
    setTimeout(() => {
        file_pickers[key] = true;
    }, 0);
};

const image_picked = useState("image_picked", undefined);
const attachment_picked = useState("attachment_picked", undefined);

watchEffect(() => {
    if (image_picked.value !== undefined) {
        file_pickers.image = false;
        const picked_list = image_picked.value as any;
        image_picked.value = undefined;
        if (picked_list) {
            applyCompletion(`:image{src='${normalize(picked_list[0])}'}
`);
        }
    }
});

watchEffect(() => {
    if (attachment_picked.value !== undefined) {
        file_pickers.attachment = false;
        const picked_list = attachment_picked.value as any;
        attachment_picked.value = undefined;
        if (picked_list) {
            applyCompletion(
                `::attachments
---
file_urls: ['${picked_list
                    .map((url: string) => normalize(url).slice(1))
                    .join("', '")}']
---
::
`
            );
        }
    }
});
</script>

<template>
    <div class="__autocomplete">
        <ClientOnly>
            <FilePicker
                state_key="image_picked"
                bucket="images"
                :enabled="file_pickers.image"
            />
            <FilePicker
                state_key="attachment_picked"
                :multiple="true"
                :enabled="file_pickers.attachment"
            />
        </ClientOnly>
        <UPopover :popper="{ placement: 'bottom-end' }">
            <UButton
                :disabled="!suggestions || suggestions.length === 0"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
                color="white"
            />
            <template #panel>
                <div class="suggestions p-1">
                    <UTooltip
                        v-for="suggestion in suggestions"
                        :text="suggestion.title"
                    >
                        <UButton
                            class="suggestion"
                            color="white"
                            @click="suggestionExecute(suggestion)"
                            ><UIcon :name="suggestion.icon"
                        /></UButton>
                    </UTooltip>
                    <UTooltip text="Создать картинку">
                        <UButton
                            class="suggestion"
                            color="white"
                            @click="(event) => set_file_picker(event, 'image')"
                            ><UIcon name="lucide:image"
                        /></UButton>
                    </UTooltip>
                    <UTooltip text="Прикрепить файлы">
                        <UButton
                            class="suggestion"
                            color="white"
                            @click="
                                (event) => set_file_picker(event, 'attachment')
                            "
                            ><UIcon name="lucide:file-stack"
                        /></UButton>
                    </UTooltip>
                </div>
            </template>
        </UPopover>
        <UModal v-model="suggestionFieldsModal.enabled">
            <div class="__autocomplete-modal">
                <div class="header">
                    <h1>{{ suggestionFieldsModal.title }}</h1>
                </div>
                <div class="body">
                    <UFormGroup
                        v-for="field in suggestionFieldsModal.fields"
                        :label="field.name"
                    >
                        <UInput
                            v-if="field.type === 'input'"
                            v-model="
                                suggestionFieldsModal.fieldValues[field.key]
                            "
                        />
                        <UTextarea
                            :resize="true"
                            v-else-if="field.type === 'textarea'"
                            v-model="
                                suggestionFieldsModal.fieldValues[field.key]
                            "
                        />
                    </UFormGroup>
                    <UButton
                        :label="suggestionFieldsModal.button"
                        @click="fireModalInput"
                    />
                </div>
            </div>
        </UModal>
    </div>
</template>

<style lang="scss">
.__autocomplete-modal {
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1rem;
        border-bottom: 1px solid rgba(var(--inverted-rgb), 0.05);
        h1 {
            font-size: 1.2rem;
        }
    }
    .body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        button {
            width: fit-content;
        }
    }
}
</style>

<style scoped lang="scss">
.__autocomplete {
    margin-left: auto;
}
.suggestions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    flex-shrink: 2;
    max-width: 6rem;
    justify-content: space-evenly;
    height: 100%;
    .suggestion {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.1rem;
    }
    ::-webkit-scrollbar {
        display: none;
    }
}
</style>
