// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	nitro: {
		preset: "node-cluster"
	},
	sitemap: {
	  xslTips: false,
	},
	modules: ['@nuxt/ui', '@nuxt/content', 'nuxt-icon', '@nuxtjs/supabase', '@nuxtjs/mdc', '@nuxtjs/robots', 'nuxt-simple-sitemap'],
	app: {
		pageTransition: { name: 'page', mode: 'out-in' },
		layoutTransition: { name: 'page', mode: 'out-in' },
		head: {
		  htmlAttrs: {
			lang: 'ru',
		  },
		},
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
	robots: {
		rules: {
			Disallow: ["/admin/", "/docs/"]
		}
	},
	runtimeConfig: {
		public: {
			service_domain: process.env.SUPABASE_URL?.split(":8000")[0].split("://")[1]
		}
	}
})
