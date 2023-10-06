<script setup lang="ts">
import type { _AsyncData } from "nuxt/dist/app/composables/asyncData";
import type { FetchError } from "ofetch";
definePageMeta({
    name: "Service status",
    layout: "empty",
    middleware: "auth",
    login_message: "Для доступа к статусу серверов необходимо авторизоваться",
});

const { service_domain } = useAppConfig();

const fetching = ref(true)

interface result {
    text: string;
    class: string;
}

const checkResults: Ref<_AsyncData<unknown, FetchError<any> | null>[]> = ref(
    []
);

const checks = [
    {
        name: "File storage",
        port: 3000,
        test_route: "/status",
    },
    {
        name: "Authentication",
        port: 8000,
        test_route: "/",
    },
];

const executeChecks = async () => {
    checkResults.value = []
    fetching.value = true
    for (let index = 0; index < checks.length; index++) {
        const check = checks[index];
        const { data, error, status, pending } = await useFetch(
            `http://${service_domain}:${check.port}${check.test_route}`
        );
        setTimeout(() => {
            checkResults.value[index] = {
                data: data,
                error: error,
                status: status,
                pending: pending,
            };
            fetching.value = false
        }, 2000);
    }
};

const resultList: ComputedRef<result[]> = computed(() => {
    let returnValue: result[] = [];
    checkResults.value.forEach((resultInRef) => {
        const result = resultInRef as any;
        let setText = "";
        let setClass = "";
        if (result.pending === true) {
            setText = "Pending";
            setClass = "warning";
        } else {
            if (result.status === "success") {
                setText = `Server responded with '${result.data}'` as string;
                setClass = "success";
            } else if (result.status === "error") {
                const error = result.error;
                if (result.error.statusCode === 500) {
                    setText = `No response - '${error}'` as string;
                    setClass = "error";
                } else {
                    setText =
                        `Server responded, but with an error - '${error}'` as string;
                    setClass = "warning";
                }
            }
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
    setInterval(executeChecks, 10000);
});
</script>

<template>
    <main>
        <code v-for="(check, index) in checks">
            <p>{{ check.name }} -&nbsp;</p>
            <p v-if="resultList[index]" :class="resultList[index].class">
                {{ resultList[index].text }}
            </p>
            <p class="warning" v-else>Pending...</p>
        </code>
        <Icon name="svg-spinners:ring-resize" v-if="fetching"/>
    </main>
</template>

<style scoped lang="scss">
main {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
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
        }
    }
}
</style>
