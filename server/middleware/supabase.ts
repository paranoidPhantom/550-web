import { createClient } from "@supabase/supabase-js";
import { useRuntimeConfig } from "#imports";

export default defineCachedEventHandler(
    async (event) => {
        const {
            supabase: { serviceKey },
            supabase_network,
        } = useRuntimeConfig();

        const auth = {
            detectSessionInUrl: false,
            persistSession: false,
            autoRefreshToken: false,
        };

        const supabaseClient = createClient(supabase_network, serviceKey, {
            auth,
        });

        event.context._supabaseServiceRole = supabaseClient;
    },
    { maxAge: 60 * 60 /* 1 hour */ }
);
