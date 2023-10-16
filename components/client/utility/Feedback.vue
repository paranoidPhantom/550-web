<script setup lang="ts">
const feedbackForm = useState("feedback_form_enabled", () => false);

let msgListener: EventListener | undefined | void = undefined
onMounted(() => {
    if (msgListener) { return }
    msgListener = window.addEventListener('message', function (event) {
        if (event.data.close) {
            feedbackForm.value = false
        }
    }, false);
})
</script>

<template>
    <Transition name="form">
        <div id="feeback-form" v-if="feedbackForm">
            <div class="form-overlay" @click="feedbackForm = false" />
            <div id="feedback-frame-container">
                <iframe ref="iframe" src="https://pos.gosuslugi.ru/form/?opaId=268828&fz59=false" frameborder="0" />
            </div>
        </div>
    </Transition>
</template>

<style scoped lang="scss">
#feedback-frame-container {
    background: white;
    position: fixed;
    max-width: 620px;
    max-height: 768px;
    margin: auto;
    inset: 0px;
    z-index: 3;
    scale: 0.95;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: inherit;

    >iframe {
        width: 100%;
        height: 100%;
        border: 0px;
    }
}

.form-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    z-index: 1;
    transition: inherit;
}

.form-enter-from,
.form-leave-to {
    > .form-overlay {
        background-color: rgba(0, 0, 0, 0);
    }

    > #feedback-frame-container {
        scale: 0.8;
        opacity: 0;
    }
}

.form-enter-active,
.form-leave-active {
    transition: all 0.3s ease-in-out;
}
</style>
