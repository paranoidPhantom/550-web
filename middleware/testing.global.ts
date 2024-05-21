export default defineNuxtRouteMiddleware(async (to, from) => {
	const testerAuthPage = "/tester"
	const { public: { access } } = useRuntimeConfig()
	if (access === "testers" && process.server && to.path !== testerAuthPage) {
		const event = useRequestEvent();
		const testerToken = event?.context.testerToken
		if (event && testerToken !== undefined) {
			const tokens = (await $fetch(`/api/public/_validate-test-token`, {
				query: {
					testerToken,
				},
			})) as any[];
			if (tokens.length === 0) return navigateTo({
				path: testerAuthPage,
				query: {
					redirect: to.fullPath
				}
			});
		} else {
			return navigateTo({
				path: testerAuthPage,
				query: {
					redirect: to.fullPath
				}
			});
		}
	} else if (to.path === testerAuthPage) if (from && from.query.justvalidated === "1") return abortNavigation()
})
