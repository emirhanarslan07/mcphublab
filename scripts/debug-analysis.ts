import { createClient } from '@supabase/supabase-js';
import { analyzeServerWithClaude } from '../lib/scanner';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAnalysis() {
  console.log("Starting Debug Scan for Fastmcp...");
  
  // 1. Get server
  const { data: server } = await supabase
    .from('mcp_servers')
    .select('*')
    .ilike('name', '%fastmcp%')
    .single();

  if (!server) { console.error("Server not found"); return; }
  console.log(`Found Server: ${server.name} (ID: ${server.id})`);

  // 2. Mock context (What the API would use)
  let context = server.description;
  const repoPath = server.github_url.replace('https://github.com/', '');
  console.log(`Fetching README for ${repoPath}...`);
  
  try {
     let readmeRes = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`);
     if (!readmeRes.ok) {
        console.log("README from 'main' failed, trying 'master'...");
        readmeRes = await fetch(`https://raw.githubusercontent.com/${repoPath}/master/README.md`);
     }
     
     if (readmeRes.ok) {
        const text = await readmeRes.text();
        context += "\n\nREADME Content:\n" + text;
        console.log(`Got README! (${text.length} chars)`);
     } else {
        console.log("No README found in main or master.");
     }
  } catch (e) {
     console.error("Fetch Error:", e);
  }

  // 3. AI Analysis
  console.log("Sending context to Claude...");
  try {
     const analysis = await analyzeServerWithClaude(context);
     console.log("Analysis Result:", JSON.stringify(analysis, null, 2));

     const { error: updateError } = await supabase
        .from('mcp_servers')
        .update({
          structured_overview: analysis.overview,
          current_risk_level: analysis.safety.risk_level,
          supports_scoping: analysis.safety.supports_scoping
        })
        .eq('id', server.id);

     if (updateError) {
        console.error("DB Update Error:", updateError);
     } else {
        console.log("SUCCESS! DB Updated.");
     }
  } catch (err: any) {
     console.error("AI/Scanner Error:", err.message);
  }
}

testAnalysis();
