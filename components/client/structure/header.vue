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
        text: "Сведения об ОУ",
        dropdown: [
            [
                {
                    text: "Основные",
                    href: "/info/primary",
                },
            ],
        ],
    },
];

const buttonStates: Ref<boolean[]> = ref([]);

buttons.forEach((button, index) => {
    buttonStates.value[index] = false;
});

const mobileHeaderOpen = ref(false);


const currentRoute = computed(() => {
    const { path } = useRoute()
    return path
})
    const { path } = useRoute();
    mobileHeaderOpen.value = false;
    return path;
});

const socialLinks = [
    {
        icon: "i-mdi-vk",
        link: "https://vk.com/school_550_spb"
    },
    {
        icon: "i-mdi-telegram",
        link: "https://t.me/school550_spb"
    }
]
</script>

<template>
    <header
        :style="{
            '--scrolled': mobileHeaderOpen ? 1 : scrolled,
            backdropFilter: feedbackForm ? 'none' : 'unset',
        }"
    >
        <div class="left" @click="navigateTo('/')">
            <h1 class="logo-placeholder-text">Школа №550</h1>
        </div>
        <div class="center">
            <UButton
                v-for="button in buttons"
                class="header-link"
                color="white"
                variant="link"
            >
                {{ button.text }}
                <ClientOnly>
                    <div class="bridge" />
                    <div class="dropdown">
                        <div
                            class="section"
                            v-for="(section, index) in button.dropdown"
                        >
                            <hr v-if="index !== 0" />
                            <UButton
                                v-for="subbutton in section"
                                class="dropdown-link"
                                color="white"
                                variant="ghost"
                                :class="{
                                    current: currentRoute === subbutton.href,
                                }"
                                :to="subbutton.href"
                                :label="subbutton.text"
                            />
                        </div>
                    </div>
                </ClientOnly>
            </UButton>
        </div>
        <div class="right">
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
                    />
                    <div class="dropdown" v-if="buttonStates[index]">
                        <div
                            class="section"
                            v-for="(section, sectionIndex) in button.dropdown"
                        >
                            <hr v-if="sectionIndex !== 0" />
                            <UButton
                                v-for="subbutton in section"
                                class="dropdown-link"
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
                <div class="social">
                    <UButton v-for="link in socialLinks" :to="link.link" variant="link"
                    target="_blank"
                        ><Icon :name="link.icon" style="font-size: 1.5rem"
                    /></UButton>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style>
header .header-link .dropdown .current {
    background-color:  rgba(var(--color-primary-DEFAULT) / 0.2);
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
    z-index: 1;
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
        &:hover .bridge {
            display: block;
        }
        .dropdown {
            display: none;
            top: calc(100% + 0.5rem);
            left: 50%;
            translate: -50% 0;
            position: absolute;
            background-color: rgba(var(--normal-rgb), 1);
            min-width: 10rem;
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
                padding: 0 0.25rem;
            }
        }
        &:hover .dropdown {
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
