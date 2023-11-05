import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		if (event.context.authenticated) {
			const body = await readBody(event)
			await supabase.auth.admin.createUser({
				email: body.email,
				password: body.password,
				email_confirm: true,
				user_metadata: body.user_metadata
			})
		}
	}
);