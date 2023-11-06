import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		if (event.context.authenticated) {
			const body = await readBody(event)
			body.value = body.value === "true"
			await supabase.rpc("set_claim", body as any)
		}
	}
);