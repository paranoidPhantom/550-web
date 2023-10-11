// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ['@nuxt/ui', '@nuxt/content', 'nuxt-icon', '@nuxthq/studio', '@nuxtjs/supabase'],
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
	}
})
