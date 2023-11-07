import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		if (event.context.authenticated) {
			const body = await readBody(event)
			const { error } = await supabase.auth.admin.updateUserById(
				body.id,
				body.value
			)
			if (error) throw createError({
				statusCode: error.status,
				message: error.message
			})
		}
	}
);