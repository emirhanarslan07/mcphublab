require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log("Checking Supabase tables...");
  const { data, error } = await supabase
    .from('mcp_servers')
    .select('id')
    .limit(1);

  if (error) {
    console.error("Error accessing mcp_servers table:", error.message);
    
    console.log("Attempting to list all tables in public schema...");
    const { data: tables, error: tableError } = await supabase.rpc('get_tables'); // This might fail if RPC not defined
    if (tableError) {
      console.log("Could not list tables via RPC. Trying manual query...");
      const { data: rawTables, error: rawError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (rawError) {
        console.error("Total failure retrieving table info:", rawError.message);
      } else {
        console.log("Tables found:", rawTables);
      }
    } else {
      console.log("Tables found via RPC:", tables);
    }
  } else {
    console.log("SUCCESS: mcp_servers table found and accessible.");
  }
}

checkTables();
