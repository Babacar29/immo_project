import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pfqvxepeuhkutavpvmtj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXZ4ZXBldWhrdXRhdnB2bXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjQzNTYsImV4cCI6MjA3MTMwMDM1Nn0.gfodyUBVqC-NH-mnbZz7DridM23EhYdZsGAHmMliFao";


export const supabase = createClient(supabaseUrl, supabaseAnonKey);