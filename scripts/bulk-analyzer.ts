import { createClient } from '@supabase/supabase-js';
import { analyzeServerWithClaude } from '../lib/scanner';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function bulkAnalyze() {
  console.log('🚀 Starting Bulk Analysis...');

  // Get servers that need analysis (no structured overview or no scope)
  const { data: servers, error } = await supabase
    .from('mcp_servers')
    .select('id, name, github_url, description')
    .or('structured_overview->>what_is.eq."",structured_overview->what_is.is.null')
    .order('stars', { ascending: false })
    .limit(1000); 

  if (error) {
    console.error('Error fetching servers:', error);
    return;
  }

  for (const server of servers) {
    console.log(`\n🔍 Analyzing: ${server.name}...`);
    
    try {
      // 1. Fetch README or Source from GitHub to provide context to the LLM
      const repoPath = server.github_url.replace('https://github.com/', '');
      let readmeResponse = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`);
      
      if (!readmeResponse.ok) {
        readmeResponse = await fetch(`https://raw.githubusercontent.com/${repoPath}/master/README.md`);
      }

      let context = server.description;
      
      if (readmeResponse.ok) {
        context += "\n\nREADME Content:\n" + await readmeResponse.text();
      }

      // 2. Perform AI Analysis
      const analysis = await analyzeServerWithClaude(context);

      // 3. Save Structured Overview
      const { error: ovError } = await supabase
        .from('mcp_servers')
        .update({
          structured_overview: analysis.overview,
          current_risk_level: analysis.safety.risk_level,
          supports_scoping: analysis.safety.supports_scoping
        })
        .eq('id', server.id);

      if (ovError) console.error(`  ❌ Overview Error for ${server.name}:`, ovError.message);

      // 4. Save Security Scope
      const { error: scError } = await supabase
        .from('server_scopes')
        .upsert({
          server_id: server.id,
          risk_level: analysis.safety.risk_level,
          supports_scoping: analysis.safety.supports_scoping,
          what_it_does: analysis.safety.what_it_does,
          what_it_accesses: analysis.safety.what_it_accesses,
          worst_case_scenario: analysis.safety.worst_case_scenario,
          recommendation: analysis.safety.recommendation,
          safe_install_command: analysis.safety.safe_install_command,
          unsafe_install_command: analysis.safety.unsafe_install_command,
          scope_guide: analysis.safety.scope_guide
        }, { onConflict: 'server_id' });

      if (scError) console.error(`  ❌ Scope Error for ${server.name}:`, scError.message);
      
      if (!ovError && !scError) console.log(`  ✅ Successfully analyzed and stored: ${server.name}`);

    } catch (err) {
      console.error(`  💥 Failed to analyze ${server.name}:`, err);
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✨ Bulk Analysis Complete.');
}

bulkAnalyze();
