<script setup lang="ts">
const suffix = ref(true)
const suffixSymbol = "|"
const binaryLines: Ref<string[]> = ref([])

const fallingBinary = computed(() => {
    return binaryLines.value.join("<br>")
})

onMounted(() => {
    setTimeout(() => {
        setInterval(() => {
            let stringGenerated = ``
            for (let index = 0; index < 300; index++) {
                stringGenerated = `${stringGenerated}${Math.round(Math.random())}`
            }
            binaryLines.value.unshift(stringGenerated)
            if (binaryLines.value.length > 25) { binaryLines.value.pop() }
        }, 50)
    }, 4000);
    setInterval(() => {
        suffix.value = !suffix.value
    }, 800)
})
</script>

<template>
    <div class="__hero">
        <div class="backgrounds">
            <svg id="stroke" xmlns="http://www.w3.org/2000/svg" width="0" height="0">
                <defs>
                    <path id="line" d="M2 2c49.7 2.6 100 3.1 150 1.7-46.5 2-93 4.4-139.2 7.3 45.2-1.5 90.6-1.8 135.8-.6"
                        fill="none" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                </defs>
            </svg>
            <div class="background-1">
            </div>
            <div class="background-2">
                <p class="binary" v-html="fallingBinary"></p>
            </div>
            <div class="background-3">
                <div class="overlay"></div>
            </div>
            <div class="background-4">

            </div>
        </div>
        <div class="center-container">
            <h1 class="school-text">Школа</h1>
            <div class="spinner">
                <div class="front">
                    <h1>№550{{ suffix ? suffixSymbol : "" }}</h1>
                    <svg class="underline" viewBox="0 0 154 13">
                        <use href="#line"></use>
                    </svg>
                </div>
                <div class="back">
                    <h1 style="display: flex; align-items: center; gap: 1rem;"><span
                            style="text-transform: uppercase; font-size: 5rem;">Больших</span> Возможностей{{ suffix ?
                                suffixSymbol : "" }}</h1>
                </div>
                <div class="top">
                    <h1>Информационных технологий{{ suffix ? suffixSymbol : "" }}</h1>
                </div>
                <div class="bottom">
                    <h1>Мечты.{{ suffix ? suffixSymbol : "" }}</h1>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@keyframes spin {
    0% {
        -webkit-transform: rotateX(0deg);
        width: 130px;
    }

    23% {
        -webkit-transform: rotateX(0deg);
        width: 130px;
    }

    25% {
        -webkit-transform: rotateX(90deg);
        width: 750px;
    }

    48% {
        -webkit-transform: rotateX(90deg);
        width: 750px;
    }

    50% {
        -webkit-transform: rotateX(180deg);
        width: 680px;
    }

    73% {
        -webkit-transform: rotateX(180deg);
        width: 680px;
    }

    75% {
        -webkit-transform: rotateX(270deg);
        width: 180px;
    }

    98% {
        -webkit-transform: rotateX(270deg);
        width: 180px;
    }

    100% {
        -webkit-transform: rotateX(360deg);
        width: 130px;
    }
}

@keyframes text-transparency {
    0% {
        opacity: 1;
        display: unset;
    }

    23% {
        opacity: 1;
        display: unset;
    }

    25% {
        opacity: 0;
        display: unset;
    }

    26% {
        display: none;
    }

    97% {
        display: none;
    }

    98% {
        opacity: 0;
        display: unset;
    }

    100% {
        opacity: 1;
        display: unset;
    }
}

@keyframes underline {
    0% {
        stroke-dashoffset: 650px;
    }

    15% {
        stroke-dashoffset: 0;
    }

    25% {
        stroke-dashoffset: 650px;
    }

    100% {
        stroke-dashoffset: 650px;
    }
}

@keyframes center {
    0% {
        background-color: transparent;
    }

    73% {
        background-color: transparent;
    }

    75% {
        background-color: rgba(0, 0, 0, 1);
    }

    98% {
        background-color: rgba(0, 0, 0, 1);
    }

    100% {
        background-color: transparent;
    }
}

@keyframes school-text {
    0% {
        color: rgb(var(--inverted-rgb));
    }

    23% {
        color: rgb(var(--inverted-rgb));
    }

    25% {
        color: white;
    }

    47% {
        color: white;
    }

    50% {
        color: rgb(var(--inverted-rgb));
    }

    73% {
        color: rgb(var(--inverted-rgb));
    }

    75% {
        color: white;
    }

    98% {
        color: white;
    }

    100% {
        color: rgb(var(--inverted-rgb));
    }
}

.underline {
    display: block;
    width: calc(120px);
    height: 20px;
    stroke: transparent;
    position: absolute;
    bottom: -10px;
    stroke-width: 4;

    &:nth-child(2) {
        animation: underline 16s ease-in-out infinite;
        stroke-dasharray: 650px;
        stroke: rgb(var(--inverted-rgb));
        stroke-width: 2;
    }
}

.__hero {
    height: 30rem;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;
    user-select: none;

    h1 {
        font-family: CascadiaCode, sans-serif;
        font-weight: 200;
        font-size: 3rem;
    }

    .center-container {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: center 16s ease-in-out infinite;
        border-radius: 0.5rem;
    }

    .school-text {
        animation: school-text 16s ease-in-out infinite;
    }

    .backgrounds {
        position: absolute;
        inset: 0;
        overflow: hidden;

        >div {
            position: absolute;
            inset: 0;
            z-index: -2;
            opacity: 0;
            transition: all 0.3s;

            >* {
                object-fit: cover;
                object-position: 50% 100%;
            }
        }

        .background-1 {
            animation: text-transparency 16s ease-in-out infinite;
        }

        .background-2 {
            animation: text-transparency 16s ease-in-out infinite 4s;
            background-color: black;

            .binary {
                background-image: linear-gradient(0deg, #00000000 0%, rgba(34, 255, 0, 0.5) 100%);
                background-size: contain;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }

        .background-3 {
            animation: text-transparency 16s ease-in-out infinite 8s;
            background-image: linear-gradient(to right top, #ff0000, #ff0045, #ff0078, #ea00aa, #b81cd7, #a34dea, #8d69f7, #797fff, #a19dff, #c4bdff, #e2deff, #ffffff);

            .overlay {
                position: absolute;
                inset: 5rem;
                box-shadow: 0 0 2rem 4rem rgb(var(--normal-rgb));
                border-radius: 1rem;
                background: rgb(var(--normal-rgb));
                z-index: 0
            }
        }

        .background-4 {
            animation: text-transparency 16s ease-in-out infinite 12s;
            background-size: 100% 100%;
            background-position: center;
            background-image: radial-gradient(18% 28% at 24% 50%, #CEFAFFFF 7%, #073AFF00 100%), radial-gradient(18% 28% at 18% 71%, #FFFFFF59 6%, #073AFF00 100%), radial-gradient(70% 53% at 36% 76%, #73F2FFFF 0%, #073AFF00 100%), radial-gradient(42% 53% at 15% 94%, #FFFFFFFF 7%, #073AFF00 100%), radial-gradient(42% 53% at 34% 72%, #FFFFFFFF 7%, #073AFF00 100%), radial-gradient(18% 28% at 35% 87%, #FFFFFFFF 7%, #073AFF00 100%), radial-gradient(31% 43% at 7% 98%, #FFFFFFFF 24%, #073AFF00 100%), radial-gradient(21% 37% at 72% 23%, #D3FF6D9C 24%, #073AFF00 100%), radial-gradient(35% 56% at 91% 74%, #8A4FFFF5 9%, #073AFF00 100%), radial-gradient(74% 86% at 67% 38%, #6DFFAEF5 24%, #073AFF00 100%);
        }
    }

    .spinner {
        -webkit-transform-style: preserve-3d;
        -webkit-animation: spin 16s infinite ease-out;
        position: relative;
        transition: all 0.3s;
        height: 50px;

        >div {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            min-width: 100%;
            width: fit-content;
            display: flex;
            align-items: center;
            backface-visibility: hidden;

            >h1 {
                overflow: hidden;
                text-overflow: clip;
                white-space: nowrap;
            }
        }

        >.front {
            translate: 0 0 25px;

            >h1 {
                animation: text-transparency 16s ease-in-out infinite;
                background: rgb(var(--inverted-rgb));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }

        >.back {
            translate: 0 0 -25px;
            rotate: 1 0 0 180deg;

            >h1 {
                animation: text-transparency 16s ease-in-out infinite 8s;
                background-image: linear-gradient(to right top, #ff0000, #ff0045, #ff0078, #ea00aa, #b81cd7, #a34dea, #8d69f7, #797fff, #a19dff, #c4bdff, #e2deff, #ffffff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }

        >.top {
            translate: 0 25px 0;
            rotate: 1 0 0 -90deg;

            >h1 {
                animation: text-transparency 16s ease-in-out infinite 4s;
                background: -webkit-linear-gradient(45deg, rgb(12, 241, 39), rgb(21, 212, 4));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }

        >.bottom {
            translate: 0 -25px 0;
            rotate: 1 0 0 90deg;
            border-radius: 1rem;

            >h1 {
                animation: text-transparency 16s ease-in-out infinite 12s;
                background-size: 100% 100%;
                background-position: 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px, 0px 0px;
                background-image: radial-gradient(18% 28% at 24% 50%, #CEFAFFFF 7%, #073AFF00 100%), radial-gradient(18% 28% at 18% 71%, #FFFFFF59 6%, #073AFF00 100%), radial-gradient(70% 53% at 36% 76%, #73F2FFFF 0%, #073AFF00 100%), radial-gradient(42% 53% at 15% 94%, #FFFFFFFF 7%, #073AFF00 100%), radial-gradient(42% 53% at 34% 72%, #FFFFFFFF 7%, #073AFF00 100%), radial-gradient(18% 28% at 35% 87%, #FFFFFFFF 7%, #073AFF00 100%), radial-gradient(31% 43% at 7% 98%, #FFFFFFFF 24%, #073AFF00 100%), radial-gradient(21% 37% at 72% 23%, #D3FF6D9C 24%, #073AFF00 100%), radial-gradient(35% 56% at 91% 74%, #8A4FFFF5 9%, #073AFF00 100%), radial-gradient(74% 86% at 67% 38%, #6DFFAEF5 24%, #073AFF00 100%), linear-gradient(125deg, #4EB5FFFF 1%, #4C00FCFF 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        }
    }
}

@media (max-width: 1024px) {
    .center-container {
        flex-wrap: wrap;
    }

    .spinner {
        width: 6rem;

        >div {
            display: none !important;

            &.front {
                display: flex !important;
            }

            >h1 {
                white-space: wrap !important;
                max-width: 100vw;
            }
        }
    }

    * {
        animation: none !important;
    }
}</style>