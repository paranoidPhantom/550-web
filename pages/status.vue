<script setup lang="ts">
import type { _AsyncData } from "nuxt/dist/app/composables/asyncData";
import type { FetchError } from "ofetch";
definePageMeta({
    name: "Server component status",
    layout: "empty",
});

const { service_domain } = useAppConfig();

const fetching = ref(true);
const counterClass = computed(() => {
    if (fetching.value) {
        return "warning";
    }
    return checksPassed.value >= checks.length ? "success" : "error";
});

interface result {
    text: string;
    class: string;
}

const checkResults: Ref<_AsyncData<unknown, FetchError<any> | null>[]> = ref(
    []
);

const authRefrehInterval = 20

const checksPassed = ref(0);

const checks = [
    {
        name: "File storage",
        port: 3000,
        test_route: "/status",
    },
    {
        name: "Supabase API (HTTP)",
        port: 8000,
        test_route: "/",
    },
    {
        name: "Supabase API (HTTPS)",
        port: 8443,
        test_route: "/",
        https: true,
    },
];

const executeChecks = async () => {
    const Root = document.documentElement;
    if (Root) {
        Root.classList.remove("light");
        Root.classList.add("dark");
    }
    checkResults.value = [];
    checksPassed.value = 0;
    console.log("RESET");
    fetching.value = true;
    for (let index = 0; index < checks.length; index++) {
        const check = checks[index];
        const { data, error, status, pending } = await useFetch(
            `${check.https ? "https" : "http"}://${service_domain}:${
                check.port
            }${check.test_route}`
        );
        checkResults.value[index] = {
            pending: true,
        };
        setTimeout(() => {
            checkResults.value[index] = {
                data: data,
                error: error,
                status: status,
                pending: pending,
            };
        }, 1000);
        await data;
    }
    fetching.value = false;
};

let currentTimeout: ReturnType<typeof setTimeout> | undefined;

const resultList: ComputedRef<result[]> = computed(() => {
    checksPassed.value = 0;
    let returnValue: result[] = [];
    checkResults.value.forEach((resultInRef) => {
        const result = resultInRef as any;
        let setText = "";
        let setClass = "";
        let passed = true;
        if (result.pending === true) {
            setText = "Refetching...";
            setClass = "warning";
            passed = false;
        } else {
            if (result.status === "success") {
                setText = `Server responded with '${result.data}'` as string;
                setClass = "success";
            } else if (result.status === "error") {
                const error = result.error;
                if (result.error.statusCode !== 500) {
                    setText =
                        `Server responded, but with an error - '${error}'` as string;
                    setClass = "warning";
                } else {
                    setText = `No response - '${error}'` as string;
                    setClass = "error";
                    passed = false;
                }
            }
        }
        if (passed) {
            checksPassed.value++;
        }
        const formattedResult: result = {
            text: setText,
            class: setClass,
        };
        returnValue.push(formattedResult);
    });
    return returnValue;
});

onMounted(() => {
    setTimeout(executeChecks, 100);
    setTimeout(executeChecks, authRefrehInterval * 1000);
});
</script>

<template>
    <main>
        <h1>
            <Icon name="line-md:cloud-braces-loop" /> Server component status
        </h1>
        <code
            >Services responded &nbsp;
            <p :class="counterClass">
                {{ checksPassed }}/{{ checks.length }}
            </p></code
        >
        <br />
        <code v-for="(check, index) in checks">
            <p>{{ check.name }} -&nbsp;</p>
            <p v-if="resultList[index]" :class="resultList[index].class">
                {{ resultList[index].text }}
            </p>
            <p class="inactive" v-else>Waiting to fetch...</p>
        </code>
        <Icon name="svg-spinners:ring-resize" v-if="fetching" />
    </main>
</template>

<style scoped lang="scss">
main {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background-color: black;
    min-height: 100vh;
    h1 {
        font-size: 2rem;
        margin: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    h1,
    p {
        color: white;
    }
    .refresh {
        width: fit-content;
    }
    code {
        display: flex;

        p {
            &.success {
                color: lime;
            }

            &.warning {
                color: yellow;
            }

            &.error {
                color: red;
            }
            &.inactive {
                color: grey;
            }
        }
    }
}
</style>
