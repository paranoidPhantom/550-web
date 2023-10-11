export default defineNuxtRouteMiddleware(async (to, from) => {
    const { auth } = useSupabaseClient()
    const { data: { user }, error } = await auth.getUser()
    if (!user) { return navigateTo(`/auth/login?callback=${to.fullPath}&message=${to.meta.login_message}`) }
})