import { createClient } from '@supabase/supabase-js';
import { analyzeServerWithClaude } from '../lib/scanner';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data: server } = await supabase
    .from('mcp_servers')
    .select('*')
    .ilike('name', '%fastmcp%')
    .single();

  if (!server) {
     console.error("Fastmcp not found in DB");
     return;
  }

  console.log(`Analyzing: ${server.name}...`);
  try {
     let context = server.description;
     const repoPath = server.github_url.replace('https://github.com/', '');
     const res = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`);
     if (res.ok) {
        context += "\n\n" + await res.text();
     }
     
     console.log("Context size:", context.length);
     const analysis = await analyzeServerWithClaude(context);
     console.log("Analysis success:", JSON.stringify(analysis, null, 2));
     
     await supabase
        .from('mcp_servers')
        .update({
          structured_overview: analysis.overview,
          current_risk_level: analysis.safety.risk_level,
          supports_scoping: analysis.safety.supports_scoping
        })
        .eq('id', server.id);
     
     console.log("Database updated.");
  } catch (err) {
     console.error("Analysis Error:", err);
  }
}

run();
