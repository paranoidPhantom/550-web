import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		if (event.context.authenticated) {
			const { data } = await supabase.auth.admin.listUsers()
			return data.users
		}
	}
);
