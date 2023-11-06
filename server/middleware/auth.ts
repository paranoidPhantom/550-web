import { serverSupabaseServiceRole } from '#supabase/server'
import type { UserResponse } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    if (!getRequestURL(event).pathname.startsWith("/api/admin")) return
    const supabase = await serverSupabaseServiceRole(event)
    const access_token = event.headers.get("access_token")
    if (access_token) {
        const { data: { user } } = await supabase.auth.getUser(access_token) as UserResponse
        if (user) {
            const { data: claims } = await supabase.rpc("get_claims", { uid: user.id } as any)
            if (claims) {
                if (user.email === "root@ort" || claims["can_edit_users"] === true) {
                    event.context.authenticated = true
                    return
                }
            }
        }
    }
    throw createError({
        statusCode: 401,
        message: 'Insufficient rights'
    })
})