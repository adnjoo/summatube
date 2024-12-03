import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://vwrsyglhdrmossyrdchh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cnN5Z2xoZHJtb3NzeXJkY2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3ODUyNTUsImV4cCI6MjA0NjM2MTI1NX0.do1Us12Mm2ObDaE9534Mhv2Rr-EaHyCa54TZ5rDjWg4'
);
