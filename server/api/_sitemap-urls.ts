import { serverSupabaseServiceRole } from '#supabase/server'

export default defineCachedEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		const { data } = await supabase
			.from("content")
			.select("route, created_at") as { data: any }
		return data.map((p) => {
			const actualDate: Date = new Date(p.created_at)
			return {
				loc: p.route,
				lastmod: actualDate,
			};
		});
	},
	{
		name: 'sitemap-dynamic-url',
		maxAge: 60 * 10, // cache URLs for 10 minutes
	}
);
