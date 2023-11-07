<script lang="ts" setup>
import { useFormatedDate } from "@/utils/useFormatedDate";
import type { Session, User } from "@supabase/supabase-js";
definePageMeta({
    name: "Пользователи",
    layout: "admin",
    middleware: "auth",
    login_message:
        "Для доступа к списку пользователей необходимо авторизоваться",
});

const unRef = (input: any) => {
    return JSON.parse(JSON.stringify(input));
};

const users = ref<User[]>();

const claimsFetched = ref<{
    [key: string]: any;
}>({});

const permsTemplate = [
    {
        label: "Редактирование основного контента",
        claim: "can_edit_content",
    },
    {
        label: "Редактирование блога",
        claim: "can_edit_blog",
    },
    {
        label: "Редактирование пользователей",
        claim: "can_edit_users",
    },
];

const stringToColour = (str: string) => {
    let hash = 0;
    str.split("").forEach((char) => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += value.toString(16).padStart(2, "0");
    }
    return colour;
};

const list_columns = [
    {
        label: "Почта",
        key: "email",
        sortable: true,
    },
    {
        label: "Имя пользователя",
        key: "user_metadata.username",
        sortable: true,
    },
    {
        label: "Права",
        key: "perms",
    },
    {
        label: "Создан",
        key: "created_at",
    },
    {
        label: "Последний вход",
        key: "last_sign_in_at",
    },
    {
        label: "Последнее изменение",
        key: "updated_at",
    },
    {
        label: "UID",
        key: "id",
    },
];

const supabase = useSupabaseClient();

const current_session = ref();

const refreshUsers = async () => {
    if (current_session.value && current_session.value?.access_token) {
        const { data: users_r } = (await useFetch(`/api/admin/users`, {
            headers: {
                "access-token": current_session.value.access_token,
            },
        })) as { data: Ref<User[]> };
        users.value = users_r.value;
    }
};

onMounted(async () => {
    const {
        data: { session },
    } = (await supabase.auth.getSession()) as { data: { session: Session } };
    current_session.value = session;
    refreshUsers();
});

const editedTable = computed(() => {
    if (users.value) {
        let result: User[] = [];
        users.value.map((user: User, index: number) => {
            let object = user;
            const keys = Object.keys(user) as (keyof User)[];
            keys.forEach((key) => {
                if (key.endsWith("at"))
                    object[key] = useFormatedDate(user[key] as string) as any;
            });
            result[index] = object;
            const claims = Object.keys(object.app_metadata);
            claimsFetched.value[user.id] = unRef(object.app_metadata);
            claims.map((claim: string) => {
                claimsFetched.value[user.id][claim] =
                    unRef(object.app_metadata)[claim] === true;
            });
        });
        return result;
    } else return null;
});

const toast = useToast();

const toClipboard = async (text: string) => {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
        const result = document.execCommand("copy");
        result ? res(1) : rej();
        textArea.remove();
        toast.add({
            id: `clipboard_copy_${result ? "success" : "error"}_${text}`,
            title: `UID скопирован`,
            icon: "i-heroicons-check-badge-20-solid",
            color: "green",
            timeout: 2000,
        });
    });
};

interface FormState extends Partial<User> {
    username?: string;
    password?: string;
}

let EU_template: FormState = {
    email: undefined,
    user_metadata: {
        username: undefined,
    },
    password: undefined,
};
const editing = ref(false);
const editing_id = ref();
const userInitial = ref<FormState>(unRef(EU_template));
const editingUser = reactive<FormState>(EU_template);

const editUser = (user: FormState) => {
    editing_id.value = user.id;
    editing.value = true;
    const keys = Object.keys(EU_template) as (keyof typeof EU_template)[];
    keys.forEach((key) => {
        editingUser[key] = unRef(user[key]) as any;
        userInitial.value[key] = user[key] ? (unRef(user[key]) as any) : "";
    });
};

const onEditUser = async () => {
    const oldForm = unRef(userInitial.value);
    oldForm.password = "";
    const newForm = unRef(editingUser);
    const keys = Object.keys(newForm);
    let sendval: {
        [key: string]: any;
    } = {};
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const oldVal = oldForm[key];
        const newVal = newForm[key];
        if (typeof newVal === "object") {
            if (!Object.is(oldVal.username, newVal.username)) {
                sendval["user_metadata"] = newVal;
            }
        } else if (!Object.is(oldVal, newVal)) {
            sendval[key] = newVal;
        }
    }
    const { error } = await useFetch("/api/admin/update-user", {
        headers: {
            "access-token": current_session.value.access_token,
        },
        body: {
            id: editing_id.value,
            value: sendval,
        },
        method: "post",
    });
    if (!error.value) editing.value = false;
    refreshUsers();
};

const userEdited = computed(() => {
    const oldForm = unRef(userInitial.value);
    oldForm.password = "";
    const newForm = unRef(editingUser);
    const keys = Object.keys(newForm);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const oldVal = oldForm[key];
        const newVal = newForm[key];
        if (typeof newVal === "object") {
            if (!Object.is(oldVal.username, newVal.username)) return true;
        } else if (!Object.is(oldVal, newVal)) return true;
    }
    return false;
});

const changeClaims = async (uid: string, claim_changed: string) => {
    await useFetch(`/api/admin/user-claims`, {
        headers: {
            "access-token": current_session.value.access_token,
        },
        body: {
            uid: uid,
            claim: claim_changed,
            value: claimsFetched.value[uid][claim_changed] ? "false" : "true",
        },
        method: "post",
    });
};

const creating = ref(false);
const create_form = reactive({
    email: "",
    username: "",
    password: "",
});

const onCreateUser = async () => {
    const { error } = await useFetch(`/api/admin/new-user`, {
        headers: {
            "access-token": current_session.value.access_token,
        },
        body: {
            email: create_form.email,
            password: create_form.password,
            user_metadata: {
                username: create_form.username,
            },
        },
        method: "post",
    });
    if (!error.value) {
        await refreshUsers();
        creating.value = false;
    }
};
</script>

<template>
    <div class="__admin-users">
        <UModal class="user-create" v-model="creating">
            <div class="wrapper">
                <h1>Создание пользователя</h1>
                <hr style="opacity: 0.1" />
                <UFormGroup label="Почта" help="Нельзя менять после создания">
                    <UInput
                        v-model="create_form.email"
                        placeholder="user@example.com"
                    />
                </UFormGroup>
                <UFormGroup
                    label="Имя пользователя"
                    help="Короткое имя пользователя без киррилицы"
                >
                    <UInput v-model="create_form.username" />
                </UFormGroup>
                <UFormGroup label="Пароль">
                    <UInput type="password" v-model="create_form.password" />
                </UFormGroup>
                <UButton type="submit" @click="onCreateUser" variant="soft">
                    Создать
                </UButton>
            </div>
        </UModal>
        <USlideover class="user-edit" v-model="editing">
            <div class="wrapper">
                <UFormGroup label="Почта" help="Нельзя менять после создания">
                    <UInput disabled v-model="editingUser.email" />
                </UFormGroup>
                <UFormGroup label="Имя пользователя">
                    <UInput
                        v-model="(editingUser.user_metadata as any).username"
                    />
                </UFormGroup>
                <UFormGroup
                    label="Пароль"
                    help="Оставте пустым чтобы не менять"
                >
                    <UInput type="password" v-model="editingUser.password" />
                </UFormGroup>
                <UButton
                    type="submit"
                    :disabled="!userEdited"
                    @click="onEditUser"
                    variant="soft"
                >
                    Сохранить
                </UButton>
            </div>
        </USlideover>
        <div class="user-list">
            <UButton
                label="Создать пользователя"
                style="width: fit-content"
                color="white"
                @click="creating = true"
            />
            <hr />
            <UTable
                v-if="editedTable && editedTable.length"
                :rows="editedTable"
                :columns="list_columns"
            >
                <template #id-data="{ row }">
                    <div class="flex gap-8">
                        <UTooltip :text="row.id">
                            <UButton
                                icon="i-heroicons-clipboard-document-solid"
                                size="2xs"
                                color="white"
                                @click="toClipboard(row.id)"
                            />
                        </UTooltip>
                        <UButton
                            icon="i-heroicons-pencil-solid"
                            size="2xs"
                            color="white"
                            @click="editUser(row)"
                            :disabled="
                                (row.email !== current_session.user.email &&
                                    current_session.user.email !==
                                        'root@ort') ||
                                (row.email !== current_session.user.email &&
                                    row.email === 'root@ort')
                            "
                        />
                    </div>
                </template>
                <template #perms-data="{ row }">
                    <div class="flex gap-2">
                        <UTooltip
                            v-for="perm in permsTemplate"
                            :text="perm.label"
                        >
                            <UCheckbox
                                v-if="claimsFetched[row.id]"
                                v-model="claimsFetched[row.id][perm.claim]"
                                @click="changeClaims(row.id, perm.claim)"
                                :disabled="
                                    row.email === current_session.user.email ||
                                    row.email === 'root@ort'
                                "
                            />
                            <Icon v-else name="svg-spinners:ring-resize" />
                        </UTooltip>
                    </div>
                </template>
            </UTable>
            <Icon v-else class="loader" name="svg-spinners:ring-resize" />
        </div>
    </div>
</template>

<style lang="scss">
.user-edit,
.user-create {
    .wrapper {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        gap: 1rem;
    }
}
</style>

<style lang="scss" scoped>
.__admin-users {
    height: calc(100vh - 3rem);
    overflow-y: auto;

    .user-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        position: relative;
        width: 100%;
        height: 100%;
        border-right: 1px solid rgba(var(--inverted-rgb), 0.1);
        hr {
            opacity: 0.25;
        }
        .loader {
            position: absolute;
            left: 50%;
            top: 50%;
        }
    }
}
</style>
