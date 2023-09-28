<script setup lang="ts">
interface Category {
    name: string,
    pages: {
        name: string,
        route: string
    }[]
}

interface Categories {
    [key: string]: Category
}

interface CategorStates {
    [key: string]: boolean
}

const Categories: Categories = {
    "base": {
        name: "Основы",
        pages: [
            {
                name: "Введение",
                route: "intro"
            }
        ]
    },
}

const { params: RouteParams } = useRoute()
const CategoryKeys = Object.keys(Categories)
const CategoryStates = reactive<CategorStates>({})

const updateCategoryStates = () => {
    let States = {}
    for (const index in CategoryKeys) {
        if (Object.prototype.hasOwnProperty.call(CategoryKeys, index)) {
            const key = CategoryKeys[index];
            CategoryStates[key] = RouteParams.category === key
        }
    }
}

onMounted(updateCategoryStates)
</script>

<template>
    <section class="sidebar">
        <div class="category" v-for="(Category, CategoryIndex) in Categories">
            <p class="name" @click="CategoryStates[CategoryIndex] = !CategoryStates[CategoryIndex]">{{ Category.name }}
                <Icon name="material-symbols:arrow-back-ios-new" class="indicator"
                    :style="{ rotate: `${CategoryStates[CategoryIndex] ? -90 : 90}deg` }" />
            </p>
            <div class="pages" v-if="CategoryStates[CategoryIndex]">
                <NuxtLink v-for="Page in Category.pages" :to="`/docs/${CategoryIndex}/${Page.route}`">
                    <div class="indicator"></div>
                    <p class="page-name">{{ Page.name }}</p>
                </NuxtLink>
            </div>
        </div>
    </section>
    <div class="sidebar placeholder" />
</template>

<style scoped lang="scss">
.sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 20%;
    width: 15rem;
    border-right: 1px solid rgba(var(--inverted-rgb), 0.1);
    padding-right: 1rem;
    position: fixed;
    height: calc(100vh - 5rem);

    &.placeholder {
        position: unset;
        opacity: 0;
        pointer-events: none;
    }
    .category {
        >.name {
            display: flex;
            justify-content: space-between;
            width: 100%;
            align-items: center;
            gap: 1rem;
            border-radius: 0.5rem;
            background-color: rgba(var(--inverted-rgb), 0.1);
            border: 1px solid rgba(var(--inverted-rgb), 0.2);
            padding: 0.5rem;
            cursor: pointer;

            .indicator {
                transition: rotate 0.3s ease-in-out;
            }
        }

        .pages {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: 100px;
            padding: 0.5rem;
            a {
                display: flex;
                gap: 1rem;
                .indicator {
                    width: 1px;
                    height: 100%;
                    background-color: rgba(var(--inverted-rgb), 0.3);
                }
                &.router-link-active .indicator {
                    background-color: rgba(var(--inverted-rgb), 0.6);
                    font-weight: 800;
                }
            }
        }
    }
}</style>