<script setup lang="ts">
const scrolled = ref(0);
const feedbackForm = useState("feedback_form_enabled", () => false);
const clamp = (val: number, min: number, max: number) =>
    Math.min(Math.max(val, min), max);
onMounted(() => {
    document?.addEventListener("scroll", () => {
        scrolled.value = clamp(window.scrollY / 64, 0, 1);
    });
});

const buttons = [
    {
        text: "Новости",
        href: "/news",
    },
    {
        text: "Сведения об ОУ",
        sectionMacher: (route: string) => route.startsWith("/info"),
        dropdown: [
            [
                {
                    text: "Основные",
                    href: "/info/primary",
                },
                {
                    text: "Структура и органы управления образовательной организацией",
                    href: "/info/structure",
                },
                {
                    text: "Документы",
                    href: "/info/documents",
                },
                {
                    text: "Оброзование",
                    href: "/info/education",
                },
                {
                    text: "Образоват​ельные стандарты",
                    href: "/info/standards",
                },
                {
                    text: "Руководство. Педагогический (научно-педагогический) состав школы",
                    href: "/info/teachers",
                },
                {
                    text: "Материально-техническое обеспечение и оснащенность образовательного процесса",
                    href: "/info/equipment",
                },
                {
                    text: "​​​Стипендии и иные виды материальной поддержки",
                    href: "/info/scholarship",
                },
                {
                    text: "​​​​​​​​​Платные образовательные услуги",
                    href: "/info/paid",
                },
                {
                    text: "Финансово-хозяйственная деятельность",
                    href: "/info/finance",
                },
                {
                    text: "Вакантные места для приёма (перевода) обучающихся",
                    href: "/info/vacancies",
                },
                {
                    text: "Доступная среда",
                    href: "/info/accessible-environment",
                },
                {
                    text: "​​​​Международное сотрудничество",
                    href: "/info/collaboration",
                },
                {
                    text: "Организация питания",
                    href: "/info/food",
                },
                {
                    text: "Учебно-методические материалы",
                    href: "/info/materials",
                },
                {
                    text: "Доступная среда",
                    href: "/accessible-environment",
                },
            ],
        ],
    },
    {
        text: "Родителям",
        sectionMacher: (route: string) => route.startsWith("/for-parents"),
        dropdown: [
            [
                {
                    text: "Новости",
                    href: "/for-parents/news",
                },
                {
                    text: "​​​Обучение с использованием дистанционных образовательных технологий",
                    href: "/for-parents/distantedu",
                },
                {
                    text: "Информация о ГИА",
                    href: "/for-parents/gia",
                },
                {
                    text: "О приёме в школу",
                    href: "/for-parents/admission",
                },
                {
                    text: "О толкерантности",
                    href: "/for-parents/tolerance",
                },
                {
                    text: "ОРКСЭ",
                    href: "/for-parents/orkse",
                },
            ],
        ],
    },
    {
        text: "Партнёры",
        href: "/partners"
    },
    {
        text: "Медалисты школы",
        href: "/medalists"
    },
    {
        text: "Противодействие коррупции",
        href: "/anti-corruption"
    },
    {
        text: "Безопасная среда",
        href: "/safe-environment"
    },
    {
        text: "Функциональная грамотность",
        href: "/funclit",
    },
    {
        text: "Школьный спортивный клуб",
        href: "/sportclub",
    },
    {
        text: "Наставничество",
        href: "/mentoring",
    },
];

const buttonStates: Ref<boolean[]> = ref([]);

buttons.forEach((button, index) => {
    buttonStates.value[index] = false;
});

const mobileHeaderOpen = ref(false);

const currentRoute = computed(() => {
    const { path } = useRoute();
    mobileHeaderOpen.value = false;
    return path;
});
const globalSearchBar = useState("search_bar_open", () => false)
</script>

<template>
    <header
        :style="{
            '--scrolled': mobileHeaderOpen ? 1 : scrolled,
            backdropFilter: feedbackForm ? 'none' : '',
        }"
    >
        <div class="left" @click="navigateTo('/')">
            <h1 class="logo-placeholder-text">Школа №550</h1>
        </div>
        <div class="center">
            <UButton
                v-for="(button, root_index) in buttons"
                class="header-link"
                color="white"
                variant="link"
                :to="button.href"
                :class="{
                    current: button.href === currentRoute || (button.sectionMacher && button.sectionMacher(currentRoute)),
                }"
            >
                {{ button.text }}
                <ClientOnly>
                    <div class="bridge" />
                    <div class="dropdown" v-if="button.dropdown">
                        <div
                            class="section"
                            v-for="(section, index) in button.dropdown"
                        >
                            <hr v-if="index !== 0" />
                                <UButton
                                    v-for="subbutton in section"
                                    class="dropdown-link"
                                    color="white"
                                    size="xs"
                                    variant="ghost"
                                    :class="{
                                        current: currentRoute === subbutton.href,
                                    }"
                                    :title="subbutton.text"
                                    :to="subbutton.href"
                                    :label="subbutton.text"
                                />
                        </div>
                    </div>
                </ClientOnly>
            </UButton>
        </div>
        <div class="right flex gap-4">
            <UTooltip text="Поиск" :shortcuts="['CTRL + K']">
                <UButton icon="i-heroicons-magnifying-glass" variant="link" color="white" size="xs" @click="globalSearchBar = true"/>
            </UTooltip>
            <ColorModeSwitch />
        </div>
        <div class="mobile-right">
            <UButton
                color="white"
                variant="link"
                @click="mobileHeaderOpen = !mobileHeaderOpen"
            >
                <Icon
                    :name="
                        mobileHeaderOpen
                            ? 'material-symbols:close'
                            : 'charm:menu-hamburger'
                    "
                />
            </UButton>
        </div>
    </header>
    <div class="header-placeholder" />
    <Transition name="mobile-header">
        <div class="mobile-header" v-if="mobileHeaderOpen">
            <div class="links">
                <template v-for="(button, index) in buttons">
                    <hr v-if="index !== 0" />
                    <UButton
                        :label="button.text"
                        variant="link"
                        @click="buttonStates[index] = !buttonStates[index]"
                        :to="button.href"
                    />
                    <div
                        class="dropdown"
                        v-if="buttonStates[index] && button.dropdown"
                    >
                        <div
                            class="section"
                            v-for="(section, sectionIndex) in button.dropdown"
                        >
                            <hr v-if="sectionIndex !== 0" />
                            <UButton
                                v-for="subbutton in section"
                                class="dropdown-link truncate"
                                color="white"
                                variant="link"
                                :to="subbutton.href"
                                :label="subbutton.text"
                            />
                        </div>
                    </div>
                </template>
            </div>
            <div class="global">
                <ColorModeSwitch />
                <ClientUtilitySocial />
            </div>
        </div>
    </Transition>
</template>

<style lang="scss">
header .current {
    text-decoration: underline rgb(var(--color-primary-DEFAULT));
}
header .header-link .dropdown .current {
    border-left: rgb(var(--color-primary-DEFAULT)) 2px solid;
    text-decoration: none;
    background-color: rgba(var(--color-primary-DEFAULT) / 0.1);
}

.dropdown-link {
    width: 100%;
    span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
    }
}
</style>

<style scoped lang="scss">
header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
    padding: 0 2rem;
    border-bottom: 1px solid rgb(var(--color-primary-DEFAULT) / var(--scrolled));
    background-color: rgba(var(--normal-rgb), calc(var(--scrolled) * 0.8));
    position: fixed;
    width: 100%;
    backdrop-filter: blur(8px);
    z-index: 2;
    .logo-placeholder-text {
        font-weight: 700;
        font-size: 20px;
        color: rgb(var(--color-primary-DEFAULT));
    }

    .left {
        cursor: pointer;
    }
    .header-link {
        position: relative;
        .bridge {
            display: none;
            position: absolute;
            top: calc(100%);
            left: 50%;
            translate: -50% 0;
            width: 100%;
            height: 1rem;
        }
        &:hover .bridge, &:focus .bridge {
            display: block;
        }
        .dropdown {
            display: none;
            top: calc(100% + 0.5rem);
            left: 50%;
            translate: -50% 0;
            position: absolute;
            background-color: rgba(var(--normal-rgb), 1);
            width: 15rem;
            z-index: 2;
            outline: 1px solid rgba(var(--inverted-rgb), 0.2);
            border-radius: 0.75rem;
            padding: 0.5rem 0;
            flex-direction: column;
            gap: 0.5rem;
            hr {
                border-color: rgba(var(--inverted-rgb), 0.1);
            }
            .section {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                padding: 0 0.5rem;
            }
        }
        &:hover .dropdown, &:focus .dropdown, .dropdown:has(*:focus) {
            display: flex;
        }
    }
    .mobile-right {
        display: none;
        button {
            font-size: 1.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}

.header-placeholder {
    height: 4rem;
    opacity: 0;
    pointer-events: none;
}

.mobile-header {
    backdrop-filter: blur(3rem);
    position: fixed;
    z-index: 2;
    inset: 0;
    top: 4rem;
    .links {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        max-height: calc(100% - 3rem);
        overflow-y: auto;
        hr {
            border-color: rgba(var(--inverted-rgb), 0.25);
        }
        .dropdown {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            hr {
                border-color: rgba(var(--inverted-rgb), 0.1);
            }
            .section {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                padding: 0 1rem;
            }
        }
    }
    .global {
        position: absolute;
        width: 100%;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 3rem;
        padding: 0 1rem;
        border-top: 1px solid rgba(var(--inverted-rgb), 0.3);
    }
}

.mobile-header-enter-from,
.mobile-header-leave-to {
    opacity: 0;
}

.mobile-header-enter-active,
.mobile-header-leave-active {
    transition: all 0.5s;
}

@media (max-width: 500px) {
    header {
        .center,
        .right {
            display: none;
        }
        .mobile-right {
            display: block;
        }
    }
}
</style>
