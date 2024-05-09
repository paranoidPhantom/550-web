// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	sitemap: {
		sources: [
			'/api/public/_sitemap-urls'
		],
		xslTips: false
	},
	modules: ['@nuxtjs/turnstile', '@nuxt/ui', '@nuxt/content', 'nuxt-icon', '@nuxtjs/supabase', '@nuxtjs/mdc', '@nuxtjs/robots', '@nuxtjs/sitemap'],
	app: {
		pageTransition: { name: 'page', mode: 'out-in' },
		layoutTransition: { name: 'page', mode: 'out-in' },
	},
	turnstile: {
		siteKey: '0x4AAAAAAAP-6VsidBtdKXE8',
		addValidateEndpoint: true
	},
	routeRules: {
		"/docs": {
			redirect: "/docs/base/intro"
		},
		"/supabase": {
			redirect: "/project/default/editor"
		}
	},
	content: {
		highlight: {
			theme: 'github-dark',
			preload: [
				'vue',
				'ts'
			]
		},
		markdown: {
			anchorLinks: false
		}
	},
	css: [
		"assets/global.scss"
	],
	colorMode: {
		preference: 'light', // default value of $colorMode.preference
		fallback: 'light', // fallback value if not system preference found
		storageKey: 'nuxt-color-mode'
	},
	supabase: {
		redirect: false,
	},
	robots: {
		rules: {
			Disallow: ["/admin/", "/docs/"]
		}
	},
	runtimeConfig: {
		public: {
			// access: process.env.ACCESS,
			// build_id: process.env.BUILD_ID,
			service_domain: process.env.SUPABASE_URL?.split(":8000")[0].split("://")[1]
		},
	}
})
