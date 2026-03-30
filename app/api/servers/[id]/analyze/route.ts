import { createClient } from '@supabase/supabase-js';
import { analyzeServerWithClaude } from '@/lib/scanner';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // 1. Fetch server from DB
    const { data: server, error: fetchError } = await supabase
      .from('mcp_servers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !server) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // 2. Build context (Description + README)
    let context = server.description;
    try {
      const repoPath = server.github_url.replace('https://github.com/', '');
      let readmeRes = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`);
      
      // Fallback to master if main doesn't exist
      if (!readmeRes.ok) {
        readmeRes = await fetch(`https://raw.githubusercontent.com/${repoPath}/master/README.md`);
      }

      if (readmeRes.ok) {
        context += "\n\nREADME Content:\n" + await readmeRes.text();
      }
    } catch (e) {
      console.warn("Failed to fetch README for on-demand scan:", e);
    }

    // 3. Run AI Analysis
    const analysis = await analyzeServerWithClaude(context, server);

    // 4. Update Database
    const { error: updateError } = await supabase
      .from('mcp_servers')
      .update({
        structured_overview: analysis.overview,
        current_risk_level: analysis.safety.risk_level,
        supports_scoping: analysis.safety.supports_scoping,
        trust_score: analysis.safety.overall_score, // Capture high-fidelity score
        last_scanned_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // 5. Update Server Scopes
    const { error: scopeError } = await supabase
      .from('server_scopes')
      .upsert({
        server_id: id,
        ...analysis.safety
      }, { onConflict: 'server_id' });

    if (scopeError) throw scopeError;

    // 6. Invalidate Cache for instant update
    revalidatePath(`/servers/${id}`);

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error('On-demand Scan Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
