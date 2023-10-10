<script setup lang="ts">
import { useAutocomplete } from "@/composables/useAutocomplete";
import type {
    completion,
    completionField,
    runnerFields,
} from "@/composables/useAutocomplete";
import { WatchSource } from "nuxt/dist/app/compat/capi";

const properties = defineProps<{
    input: string;
    index: number;
}>();

const suggestions = computed(() => {
    return useAutocomplete(properties.input, properties.index);
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
    currentInput.value = `${properties.input.slice(
        0,
        properties.index
    )}${completion}${properties.input.slice(properties.index)}`;
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
</script>

<template>
    <div class="__autocomplete">
        <div class="suggestions">
            <UTooltip
                v-for="suggestion in suggestions"
                :text="suggestion.title"
            >
                <UButton
                    class="suggestion"
                    color="white"
                    @click="suggestionExecute(suggestion)"
                    ><Icon :name="suggestion.icon"
                /></UButton>
            </UTooltip>
        </div>
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
.suggestions {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    flex-shrink: 2;
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
