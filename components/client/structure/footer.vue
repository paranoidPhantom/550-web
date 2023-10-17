
<template>
    <footer class="__footer">
        <hr />
        <div class="bottom">
            <p style="opacity: 0.5;">&copy Школа №550, {{ new Date().getFullYear() }}</p>
            <ClientUtilitySocial />
        </div>
    </footer>
</template>

<style scoped lang="scss">
.__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    border-top: 1px solid rgb(var(--color-primary-DEFAULT));
    hr {
        width: 100%;
        opacity: 0.05;
    }
    .bottom {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }
}
</style>
