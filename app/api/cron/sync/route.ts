import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { analyzeServerWithClaude } from '@/lib/scanner';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  // 1. Enterprise Security: Validate Secret Token
  // Protects the endpoint from unauthorized pings running up GitHub API rate limits.
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized Access. Invalid CRON_SECRET.' }, { status: 401 });
  }

  // 2. Initialize Supabase Service Role
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let addedCount = 0;

  try {
    // 3. The Quality Filter (20+ Stars Minimum)
    // We strictly query GitHub for repositories with 20 or more stars, sorted by most recently updated.
    // This perfectly captures growing projects and skips 99% of empty forks/garbage automatically.
    const response = await fetch(`https://api.github.com/search/repositories?q=mcp-server+in:name,description,readme+stars:>=20&sort=updated&order=desc&per_page=50`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCPHub-Automated-Cron-Worker'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API Communication Error: ${response.statusText}`);
    }

    const data = await response.json();
    const items = data.items || [];

    for (const repo of items) {
      // 4. Format & Upsert Pipeline
      const serverData = {
        name: repo.full_name,
        slug: repo.full_name.replace('/', '-').toLowerCase(),
        github_url: repo.html_url,
        description: repo.description ? repo.description.substring(0, 200) : 'Community MCP Server implementation.',
        long_description: repo.description || 'No detailed description provided by the repository owner.',
        author: repo.owner.login,
        author_url: repo.owner.avatar_url,
        stars: repo.stargazers_count,
        category: 'community',
        tags: repo.topics && repo.topics.length > 0 ? repo.topics : ['mcp', 'server'],
        language: repo.language ? repo.language.toLowerCase() : 'unknown',
        install_command: `git clone ${repo.html_url}`,
        is_verified: false, // Must be manually promoted to Elite Tier!
        trust_score: Math.min((repo.stargazers_count / 100) * 10, 8.5)
      };

      const { error } = await supabase
        .from('mcp_servers')
        .upsert(serverData, { onConflict: 'github_url' });
        
      if (!error) {
         addedCount++;
      }
    }

    // 3. New Feature: Background analysis for unscanned servers (Top 20 each run to stay stable)
    const { data: unscanned } = await supabase
      .from('mcp_servers')
      .select('id, name, github_url, description')
      .is('structured_overview->>what_is', null)
      .order('stars', { ascending: false })
      .limit(20);

    if (unscanned && unscanned.length > 0) {
      console.log(`[Cron] Found ${unscanned.length} unscanned servers. Starting analysis...`);
      for (const server of unscanned) {
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

          // Sleep to avoid rate limits
          await new Promise(r => setTimeout(r, 4000));
        } catch (e) {
          console.error(`[Cron] Failed analysis for ${server.name}:`, e);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      scanned_repositories: items.length, 
      successfully_synchronized: addedCount,
      analyzed: unscanned?.length || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Automated Cron Sync Fatal Error:', error);
    return NextResponse.json({ error: 'Synchronization pipeline failure' }, { status: 500 });
  }
}
