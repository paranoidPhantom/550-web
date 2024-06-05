import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const { token } = getQuery(event);
    if (token) {
        const supabase = serverSupabaseServiceRole(event);
        const { data, error } = await supabase
            .from("tester-tokens")
            .select()
            .eq("token", token);
        if (error)
            throw createError({
                message: String(token),
            });
        return data ?? [];
    } else return [];
});
