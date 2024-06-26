export default defineNitroPlugin((nitroApp) => {
	const { public: { access } } = useRuntimeConfig()
	if (access === "testers") nitroApp.hooks.hook('request', (event) => {
		let cookies: Record<string, string> = {}
		event.headers.get("Cookie")?.split("; ").forEach(cookieKV => {
			const [key, value] = cookieKV.split("=")
			cookies[key] = value
		});
		event.context.testerToken = cookies["tester-token"]
	})
})