import { createClient } from '@supabase/supabase-js';

// Fallback to the exact Supabase credentials provided by the user
let SUPABASE_URL = (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : undefined) ||
  ((import.meta as any).env?.VITE_SUPABASE_URL) ||
  "https://evzpyeeafmcnrnoxtfwz.supabase.co";

if (!SUPABASE_URL || typeof SUPABASE_URL !== 'string' || !SUPABASE_URL.startsWith('http')) {
  SUPABASE_URL = "https://evzpyeeafmcnrnoxtfwz.supabase.co";
}

let SUPABASE_ANON_KEY = (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : undefined) ||
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2enB5ZWVhZm1jbnJub3h0Znd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjE1MzgsImV4cCI6MjA5ODMzNzUzOH0.LbZ3L_ZPJwRiT_0_QYAGQ1z-gxOOiKGivMWeYDwB30Q";

if (!SUPABASE_ANON_KEY || typeof SUPABASE_ANON_KEY !== 'string' || SUPABASE_ANON_KEY.startsWith('sb_publishable') || SUPABASE_ANON_KEY.length < 50) {
  SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2enB5ZWVhZm1jbnJub3h0Znd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjE1MzgsImV4cCI6MjA5ODMzNzUzOH0.LbZ3L_ZPJwRiT_0_QYAGQ1z-gxOOiKGivMWeYDwB30Q";
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
