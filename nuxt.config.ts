// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        "@nuxt/ui",
        "@nuxt/content",
        "nuxt-icon",
        "@nuxtjs/supabase",
        "@nuxtjs/mdc",
        "@nuxt/image",
    ],
    app: {
        pageTransition: { name: "page", mode: "out-in" },
        layoutTransition: { name: "page", mode: "out-in" },
    },
    css: ["assets/global.scss"],
    routeRules: {
        "/docs": {
            redirect: "/docs/base/intro",
        },
        "/supabase": {
            redirect: "/project/default/editor",
        },
    },
    content: {
        highlight: {
            theme: "github-dark",
            preload: ["vue", "ts"],
        },
        markdown: {
            anchorLinks: false,
        },
    },
    colorMode: {
        preference: "light", // default value of $colorMode.preference
        fallback: "light", // fallback value if not system preference found
        storageKey: "nuxt-color-mode",
    },
    supabase: {
        redirect: false,
    },
    robots: {
        rules: {
            Disallow: ["/admin/", "/docs/"],
        },
    },
    sitemap: {
        sources: ["/api/public/_sitemap-urls"],
        xslTips: false,
    },
    runtimeConfig: {
        public: {
            access: process.env.ACCESS,
            build_id: process.env.BUILD_ID,
            service_domain: (
                process.env.NUXT_PUBLIC_SITE_URL ?? "https://portal.ort.spb.ru"
            ).split("://")[1],
        },
        supabase_network: process.env.SUPABASE_IN_NETWORK,
    },
});
