import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { ClientImage } from "@/components/client-image";
import { AnalysisTrigger } from "@/components/analysis-trigger";
import { ShieldCheck, Star, ArrowLeft, ChevronRight, Server } from "lucide-react";
import { ServerDetailTabs } from "@/components/server-detail-tabs";
import { LiveCounter } from "@/components/live-counter";

import { calculateHeuristicAnalysis } from '@/lib/trust-engine';

interface Props {
  params: { id: string };
}

export default async function ServerDetailPage({ params }: Props) {
  const supabase = createServerClient();

  // Get current server (Try ID first, then Slug)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.id);
  
  let query = supabase.from('mcp_servers').select('*');
  
  if (isUUID) {
    query = query.eq('id', params.id);
  } else {
    query = query.eq('slug', params.id);
  }

  const { data: server, error } = await query.single();

  if (error || !server) {
    notFound();
  }

  const isScanned = !!(server.structured_overview && server.structured_overview.what_is);

  // Get total count for breadcrumb
  const { count: totalServers } = await supabase.from('mcp_servers').select('*', { count: 'exact', head: true });

  // Get security scope details
  let securityData = null;
  try {
    const { data: scope } = await supabase
      .from('server_scopes')
      .select('*')
      .eq('server_id', server.id)
      .single();
    securityData = scope;
  } catch (e) {
    console.warn("server_scopes fetch failed.");
  }

  // FALLBACK TO HEURISTIC IF NO LLM SCAN YET
  if (!securityData) {
     const heuristic = calculateHeuristicAnalysis({
       name: server.name,
       stars: server.stars || 0,
       github_updated_at: server.updated_at || new Date().toISOString(),
       author: server.author || 'unknown',
       is_verified: server.is_verified || false
     });
     securityData = {
        ...heuristic.security,
        overall_score: heuristic.score,
        signals: heuristic.signals
     };
  }

  // Fetch README for Direct Overview
  let readmeContent = "";
  try {
    const repoPath = server.github_url.replace('https://github.com/', '');
    let readmeRes = await fetch(`https://raw.githubusercontent.com/${repoPath}/main/README.md`);
    if (!readmeRes.ok) {
      readmeRes = await fetch(`https://raw.githubusercontent.com/${repoPath}/master/README.md`);
    }
    if (readmeRes.ok) {
      readmeContent = await readmeRes.text();
    }
  } catch (e) {
    console.warn("Failed to fetch README for Overview:", e);
  }

  return (
    <div className="bg-[#050505] min-h-screen text-zinc-100 pb-32 selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="container mx-auto px-4 max-w-7xl pt-12">
        {/* Breadcrumb with Real Count */}
        <div className="flex items-center gap-2 mb-10 text-[10px] font-black uppercase tracking-widest text-[#444] hover:text-emerald-500 transition-colors">
          <Link href="/" className="hover:text-white">MCPHub Lab</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/servers" className="hover:text-white flex items-center gap-1">Registry</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-500">{server.name}</span>
        </div>

        {/* Minimalist Professional Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-32 h-32 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-2xl relative group transition-all duration-500 hover:scale-105" 
                 style={{ 
                   borderColor: `${(() => {
                     const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
                     const index = server.name.charCodeAt(0) % colors.length;
                     return colors[index];
                   })()}66`,
                   background: `linear-gradient(135deg, ${(() => {
                     const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
                     const index = server.name.charCodeAt(0) % colors.length;
                     return colors[index];
                   })()} 0%, #000 100%)`
                 }}>
               {(() => {
                  const name = server.name.toLowerCase();
                  const brandMap: Record<string, string> = {
                    'slack': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
                    'github': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
                    'google-drive': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
                    'google-maps': 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg',
                    'postgres': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg',
                    'sqlite': 'https://upload.wikimedia.org/wikipedia/commons/3/38/SQLite370.svg',
                    'stripe': 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
                    'brave-search': 'https://brave.com/static-assets/images/brave-favicon.png'
                  };

                  const isBrand = !!brandMap[name];
                  
                  if (isBrand) {
                    return (
                      <div className="w-full h-full p-6 bg-white flex items-center justify-center">
                        <ClientImage src={brandMap[name]} alt={server.author} className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500" />
                      </div>
                    );
                  }

                  // GitHub Org/Author Avatar Fallback (Replicates mcp.so style)
                  if (server.author_url) {
                    return (
                      <div className="w-full h-full bg-[#111] flex items-center justify-center">
                        <ClientImage src={server.author_url} alt={server.author} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                      </div>
                    );
                  }

                  return (
                    <div className="text-white/90 flex flex-col items-center justify-center gap-1 group-hover:scale-110 transition-transform duration-500">
                      <Server className="w-12 h-12 mb-1 opacity-50" />
                      <span className="text-xl font-black tracking-tighter opacity-80">{server.name.substring(0, 3).toUpperCase()}</span>
                    </div>
                  );
               })()}
               <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter capitalize transition-all hover:scale-105 duration-500">{server.name.replace(/-/g, ' ')}</h1>
                {server.is_verified && <ShieldCheck className="w-8 h-8 text-emerald-500 fill-emerald-500/10" />}
              </div>
              <p className="text-[14px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                 Built by <span className="text-emerald-500 underline underline-offset-4 pointer-events-none">{server.author}</span> • <Star className="inline w-3.5 h-3.5 mb-1 fill-amber-500 text-amber-500" /> {server.stars?.toLocaleString() || 0} stars
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <a href={server.github_url} target="_blank" className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-white/5">
                Visit Repository
             </a>
          </div>
        </div>

        {/* Background Analysis Trigger (Silent, for Security tab) */}
        {!isScanned && <AnalysisTrigger serverId={server.id} isScanned={isScanned} />}

        {/* Main Tabbed Content Area */}
        <ServerDetailTabs server={server} securityData={securityData} readmeContent={readmeContent} />
      </div>
    </div>
  );
}
