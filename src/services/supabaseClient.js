import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hafwgyagagxqakqmxkyw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZndneWFnYWd4cWFrcW14a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjA3MTgsImV4cCI6MjA5NjkzNjcxOH0.QFEp3_OaVbqc8LA8-3OtgtATNKZ6RQRFjbfW5tHw578';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});