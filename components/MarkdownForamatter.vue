<template>
    <div class="md-formatter">
        <slot />
    </div>
</template>

<style lang="scss">
.md-formatter {
    >div {
        >* {
            margin: 1rem 0;
        }

        >h1 {
            font-size: xx-large;
        }

        >h2 {
            font-size: x-large;
        }

        >h3 {
            font-size: larger;
        }

        >hr {
            opacity: 0.15;
            border-color: rgb(var(--inverted-rgb))
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

        >pre {
            overflow: hidden;
            border-radius: 0.5rem;
            padding: 0.5rem 0;

            >code {
                >.line {
                    padding: 0 0.5rem;
                }
            }
        }
    }
}
</style>