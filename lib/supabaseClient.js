import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yifeyrosuuhwubrgzdaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZmV5cm9zdXVod3Vicmd6ZGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzYxODksImV4cCI6MjEwMzI1MjE4OX0.l3e4UIa4F2lmjScSjMrezj0uX3vZ-4MsfzHmYoaS8pQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
