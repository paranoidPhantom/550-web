import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		const { data: { users } } = await supabase.auth.admin.listUsers()
		let retval: {[key: string]: any} = {}
		users.forEach(user => {
			const meta = user.user_metadata as any
			const username = meta.username
			delete meta.username
			retval[username] = meta
		})
		return retval
	}
);