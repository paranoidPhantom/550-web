<script setup lang="ts">
const visImpairment = useState("vis_impairment_enabled", () => false)

const actions = [
    {
        name: "Увеличить",
        keys: [
            "Ctrl",
            "+"
        ]
    },
    {
        name: "Уменьшить",
        keys: [
            "Ctrl",
            "-"
        ]
    },
    {
        name: "Вернуться к 100%",
        keys: [
            "Ctrl",
            "0"
        ]
    },
    {
        name: "Действие",
        keys: [
            "Enter"
        ]
    },
    {
        name: "Переход вперед по последовательности элементов на веб-странице, в адресной строке и на панели ссылок",
        keys: [
            "Tab"
        ]
    },
    {
        name: "Переход назад по последовательности элементов на веб-странице, в адресной строке и на панели ссылок",
        keys: [
            "Shift",
            "Tab"
        ]
    },
    {
        name: "Переход на домашнюю страницу",
        keys: [
            "Alt",
            "Home"
        ]
    },
    {
        name: "Переход на следующую страницу",
        keys: [
            "Alt",
            "→"
        ]
    },
    {
        name: "Переход на предыдущую страницу",
        keys: [
            "Alt",
            "←"
        ]
    },
    {
        name: "Прокрутка к началу документа",
        keys: [
            "↑"
        ]
    },
    {
        name: "Прокрутка к концу документа",
        keys: [
            "↓"
        ]
    },
    {
        name: "Прокрутка к началу документа большими шагами",
        keys: [
            "Shift",
            "Space"
        ]
    },
    {
        name: "Прокрутка к концу документа большими шагами",
        keys: [
            "Space"
        ]
    },
    {
        name: "Переход в начало документа",
        keys: [
            "Home"
        ]
    },
    {
        name: "Переход в конец документа",
        keys: [
            "End"
        ]
    },
    {
        name: "Поиск на текущей странице",
        keys: [
            "Ctrl",
            "F"
        ]
    },
    {
        name: "Вызов контекстного меню ссылки",
        keys: [
            "Shift",
            "F10"
        ]
    },
    {
        name: "Обновить текущую страницу",
        keys: [
            "Ctrl",
            "R"
        ]
    },
    {
        name: "Перкратить загрузку страницы",
        keys: [
            "Esc"
        ]
    },
    {
        name: "Сохранить текущую страницы",
        keys: [
            "Ctrl",
            "S"
        ]
    },
    {
        name: "Напечатать текущую страницы",
        keys: [
            "Ctrl",
            "P"
        ]
    },
    {
        name: "Закрыть текущую страницы",
        keys: [
            "Ctrl",
            "W"
        ]
    },
    {
        name: "Вывод справки",
        keys: [
            "F1",
            ""
        ]
    },
    {
        name: "Переключение между полноэкранным и обычным режимами окна обозревателя",
        keys: [
            "F11",
            ""
        ]
    },
]
</script>

<template>
    <Transition name="visual-impairment-window">
        <div class="__vis-impairment" v-if="visImpairment">
            <UButton @click="visImpairment = false" class="leave" color="white" icon="i-heroicons-arrow-left" label="Выйти" />
            <h1>Рекомендации для людей с нарушением зрения</h1>
            <template v-for="(action, action_index) in actions">
                <hr v-if="action_index !== 0">
                <div class="action">
                    <p>{{ action.name }}</p>
                    <div class="shortcut">
                        <template v-for="(key, index) in action.keys">
                            {{ index > 0 ? "+" : "" }}
                            <UKbd size="lg">{{ key }}</UKbd>
                        </template>
                    </div>
                </div>
            </template>
        </div>
    </Transition>
</template>

<style scoped lang="scss">
.__vis-impairment {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: fixed;
    inset: 0;
    top: 4rem;
    z-index: 3;
    background-color: rgba(var(--normal-rgb));
    transition: all 0.5s;
    padding: 2rem;
    max-height: calc(100% - 4rem);
    overflow-y: auto;
    border-top: 1px solid rgba(var(--inverted-rgb), 0.2);
    .leave {
        width: fit-content;
    }
    h1 {
        font-size: 2rem;
        text-align: center;
    }
    hr {
        border-color: rgba(var(--inverted-rgb), 0.5);
    }
    .action {
        display: flex;
        justify-content: space-between;
        p {
            font-size: 1.5rem;
            max-width: calc(100% - 10rem);
        }
        .shortcut {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 1.5rem;
            kbd {
                font-size: 1.2rem;
            }
        }
    }
}

.visual-impairment-window-enter-from,
.visual-impairment-window-leave-to {
    opacity: 0;
    top: 100%;
}

@media (max-width: 500px) {
    .__vis-impairment {
        padding: 1rem;
    }
}
</style>