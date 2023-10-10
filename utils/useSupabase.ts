import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from "@supabase/supabase-js"

let supabase: SupabaseClient | undefined = undefined

export interface init_params {
    host: string;
    port: number;
    key: string;
}

const default_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"

export const useSupabase = (init_params?: init_params) => {
    if (!supabase) {
        console.warn("New supabase client initiated!")
        supabase = createClient(`http://${init_params ? init_params.host : "localhost"}:${init_params ? init_params.port : 8000}`, init_params && init_params.key? init_params.key : default_key)
    }
    return supabase
}