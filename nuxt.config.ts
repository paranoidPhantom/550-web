// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ['@nuxt/ui', '@nuxt/content', 'nuxt-icon', '@nuxthq/studio', '@nuxtjs/supabase', '@nuxtjs/mdc'],
	app: {
		pageTransition: { name: 'page', mode: 'out-in' },
		layoutTransition: { name: 'page', mode: 'out-in' }
	},
	routeRules: {
		"/docs": {
			redirect: "/docs/base/intro"
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
		redirect: false
	},
	runtimeConfig: {
		public: {
			service_domain: process.env.SUPABASE_URL?.split(":8000")[0].split("://")[1]
		}
	}
})
