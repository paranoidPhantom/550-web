<script lang="ts" setup>
definePageMeta({
    name: "Авторизация тестера",
    layout: "empty",
});

let code = reactive([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
]);
const initialCode = [...code];
const oldCodeValue = reactive([...code]);

const testerToken = useCookie("tester-token");

const focusedIndex = ref(1);

const randomButton = ref();
const correct = ref(false);

const {
    query: { redirect },
} = useRoute();

const toast = useToast();
const router = useRouter();

watch(code, async (to) => {
    let deleting = false;
    to = to.map((num) => `${num}`);
    for (let i = 0; i <= to.length; i++) {
        if (deleting) {
            const input = document.querySelector(
                `.code-field .input-${i} input`
            ) as HTMLInputElement;
            if (input) {
                input.value = "";
            }
            continue;
        }
        const comparison = to[i] !== oldCodeValue[i] && to[i] !== "";
        oldCodeValue[i] = to[i];
        if (comparison) {
            if (to[i].length > 1) {
                if (to[i].length >= code.length / 2) {
                    const pasted = to[i].replaceAll("-", "");
                    for (let i = 0; i <= to.length; i++) code[i] = pasted[i];
                    return;
                }
                code[i] = to[i][to[i].length - 1];
            }
            const input = document.querySelector(
                `.code-field .input-${i + 2} input`
            ) as HTMLInputElement;
            if (input) {
                input.focus();
                input.select();
            }
            deleting = true;
        }
        if (!to.includes("")) {
            const token = code.join("");
            const tokens = (await $fetch(`/api/public/_validate-test-token`, {
                query: {
                    token,
                },
            })) as any[];
            if (tokens.length === 0) {
                window.location.reload();
                return;
            }
            correct.value = true;
            toast.add({
                title: `Добро пожаловать${
                    tokens[0].owner ? ", " + tokens[0].owner : ""
                }!`,
            });
            randomButton.value.focus();
            testerToken.value = token;
            router.push({
                path: (redirect as string) || "/",
                query: { justvalidated: 1 },
            });
            break;
        }
    }
});

//
defineShortcuts({
    backspace: {
        handler: () => {
            if (code[focusedIndex.value - 1] === "") {
                const input = document.querySelector(
                    `.code-field .input-${focusedIndex.value - 1} input`
                ) as HTMLInputElement;
                if (input) {
                    input.focus();
                    input.select();
                }
            } else code[focusedIndex.value - 1] = "";
        },
        usingInput: true,
    },
});
</script>

<template>
    <div class="tester-auth flex flex-col justify-center items-center p-8">
        <div class="entry flex flex-col gap-8 items-center">
            <UAlert
                title="Доступ ограничен!"
                description="Подтвердите право на доступ к ресурсу введя код доступа."
                :color="correct ? 'green' : 'red'"
                style="transition: all 1s; transition-delay: 0.5s"
                variant="soft"
                class="w-72 sm:w-96"
            >
                <template #title="{ title }"
                    ><div class="flex gap-4 text-2xl mb-4">
                        <UIcon
                            style="translate: 0 0.2rem"
                            name="mdi:badge-account"
                        />
                        <h2>{{ title }}</h2>
                    </div></template
                >
            </UAlert>
            <div class="code-field flex gap-4 flex-wrap px-8 justify-center">
                <UInput
                    v-for="index in code.length"
                    v-model="code[index - 1]"
                    :autofocus="index === 1"
                    placeholder="X"
                    :color="correct ? 'green' : 'red'"
                    size="lg"
                    :padded="false"
                    :autofocus-delay="0"
                    :class="`input-${index} popout-input${
                        correct ? ' success' : ''
                    }`"
                    :style="{ 'transition-delay': `${30 * (index - 1)}ms` }"
                    @focus="focusedIndex = index"
                />
            </div>
        </div>
        <button
            ref="randomButton"
            style="opacity: 0; pointer-events: none"
        ></button>
    </div>
</template>

<style lang="scss">
.tester-auth {
    overflow: hidden;
    height: 100vh;
}

.popout-input {
    input {
        transition: all 1s cubic-bezier(0.67, -0.76, 0.41, 1.53);
        width: 2rem;
        padding: 0.5rem;
        text-align: center;
    }
    &.success {
        input {
            rotate: 360deg;
            scale: 1.1;
            width: 3rem;
            aspect-ratio: 1;
        }
    }
}
</style>
