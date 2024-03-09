import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const { token } = getQuery(event)
		if (token) {
			const supabase = await serverSupabaseServiceRole(event)
			const { data, error } = await supabase.from("tester-tokens").select().eq("token", token)
			return data
		}
	}
);