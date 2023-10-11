export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return
    const { public: { supabase_init_params } } = useRuntimeConfig()
    const { auth } = useSupabase(supabase_init_params as any)
    const { data: { user }, error } = await auth.getUser()
    if (!user) { return navigateTo(`/auth/login?callback=${to.fullPath}&message=${to.meta.login_message}`) }
})