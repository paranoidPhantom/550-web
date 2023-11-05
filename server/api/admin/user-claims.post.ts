import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		if (event.context.authenticated) {
            const uid = event.headers.get("uid") as string
			const claim_changed = event.headers.get("claim_changed") as string
			const value = (event.headers.get("value") === "true") as boolean
			await supabase.rpc("set_claim", { uid: uid, claim: claim_changed, value: value } as any)
		}
	}
);