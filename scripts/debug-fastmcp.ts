import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data } = await supabase
    .from('mcp_servers')
    .select('id, name, structured_overview')
    .ilike('name', '%fastmcp%')
    .single();

  console.log("Structured Overview:", JSON.stringify(data.structured_overview, null, 2));
}

check();
