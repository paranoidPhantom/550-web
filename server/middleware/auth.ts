import { serverSupabaseServiceRole } from '#supabase/server'
import type { User, UserResponse } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    if (!getRequestURL(event).pathname.startsWith("/api/admin")) return
    const supabase = await serverSupabaseServiceRole(event)
    const access_token = event.headers.get("access_token")
    let progress = 0
    if (access_token) {
        const { data: { user } } = await supabase.auth.getUser(access_token) as UserResponse
        progress++
        if (user) {
            progress++
            const { data: claims } = await supabase.rpc("get_claims", { uid: user.id } as any)
            if (claims) {
                progress++
                if (user.email === "root@ort" || claims["can_edit_users"] === true) {
                    event.context.authenticated = true
                    return
                }
                console.log("Claims fetched")
            }
            console.log("Access token valid | Got user")
        }
        console.log("Got access_token")
    }
    throw createError({
        statusCode: 401,
        message: 'Insufficient rights - '+progress,
    })
})