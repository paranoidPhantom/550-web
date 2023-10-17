import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(
	async (event) => {
		const supabase = await serverSupabaseServiceRole(event)
		const { data, error } = await supabase
			.from("content")
			.select("route, created_at")
		console.log(data)
		return data.map((p) => {
			return {
				loc: p.route,
				lastmod: p.created_at,
			};
		});
	},
	{
		name: 'sitemap-dynamic-url',
		maxAge: 60 * 10, // cache URLs for 10 minutes
	}
);
