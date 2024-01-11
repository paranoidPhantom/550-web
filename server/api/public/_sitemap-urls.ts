import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
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
				_sitemap: 'pages',
			};
		});
	}
);
