import { createClient } from '@supabase/supabase-js';
import { analyzeServerWithClaude } from '../lib/scanner';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function reAnalyze() {
  console.log('🚀 Re-analyzing top 10 servers in English...');

  const { data: servers } = await supabase
    .from('mcp_servers')
    .select('id, name, github_url, description')
    .order('stars', { ascending: false })
    .limit(10);

  if (!servers) return;

  for (const server of servers) {
    console.log(`Analyzing ${server.name}...`);
    try {
      const repoPath = server.github_url.split('github.com/')[1];
      const rdRes = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`);
      let context = server.description;
      if (rdRes.ok) context += "\n\n" + (await rdRes.text()).slice(0, 10000);

      const analysis = await analyzeServerWithClaude(context);
      
      await supabase.from('mcp_servers').update({
        structured_overview: analysis.overview,
        current_risk_level: analysis.safety.risk_level,
        supports_scoping: analysis.safety.supports_scoping
      }).eq('id', server.id);

      await supabase.from('server_scopes').upsert({
        server_id: server.id,
        ...analysis.safety
      }, { onConflict: 'server_id' });

      console.log(`✅ ${server.name} updated in English.`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`❌ Failed ${server.name}:`, e);
    }
  }
  console.log('✨ All top servers re-analyzed.');
}

reAnalyze();
