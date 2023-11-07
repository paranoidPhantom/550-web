<script setup lang="ts">
const formatter = ref();

onMounted(() => {
    setTimeout(() => {
        const anchors = formatter.value.querySelectorAll(
            "a"
        ) as HTMLAnchorElement[];
        anchors.forEach((anchor: HTMLAnchorElement) => {
            anchor.target = "_blank";
        });
    }, 1000);
});

</script>

<template>
    <div class="md-formatter" ref="formatter">
        <slot />
    </div>
</template>

<style lang="scss">
.md-formatter {
    > div, > article {
        font-weight: 300;
        > * {
            margin: 1rem 0;
        }

        color: rgba(var(--inverted-rgb), 0.8);
        
        strong {
            font-weight: 600;
        }

        > h1 {
            font-size: xx-large;
            font-weight: 700;
            color: rgba(var(--inverted-rgb), 1);
        }

        > h2 {
            font-size: x-large;
            font-weight: 600;
            color: rgba(var(--inverted-rgb), 1);
        }

        > h3 {
            font-size: larger;
            font-weight: 500;
            color: rgba(var(--inverted-rgb), 1);
        }

        > hr {
            opacity: 0.15;
            border-color: rgb(var(--inverted-rgb));
        }

        a {
            color: rgb(var(--color-primary-DEFAULT));
            text-decoration: underline 1px dotted;
        }

        h1 > a,
        h2 > a,
        h3 > a,
        h4 > a,
        h5 > a,
        h6 > a {
            color: unset;
        }

        table {
            width: fit-content;
            overflow: hidden;
            border-radius: 1rem;
            outline: 1px solid rgba(var(--inverted-rgb), 0.2);
            th,
            td {
                padding: 0.2rem 1rem;
                outline: 1px solid rgba(var(--inverted-rgb), 0.2);
                text-align: center;
            }
        }

        blockquote {
            background-color: rgba(var(--inverted-rgb), 0.1);
            border-radius: 0.25rem;
            padding: 0.25rem 1rem;
            margin: 1rem 0;
            width: fit-content;
        }
        font-family: "Oswald", sans-serif;
        li {
            list-style: disc;
            margin-left: 2rem;
        }

        ol > li {
            list-style-type: decimal;
        }

        > pre {
            overflow: hidden;
            border-radius: 0.5rem;
            padding: 0.5rem 0;

            > code {
                > .line {
                    padding: 0 0.5rem;
                }
            }
        }
        img {
            border-radius: 0.5rem;
            border: 2px solid rgba(var(--inverted-rgb), 0.1);
        }
    }
}
</style>
