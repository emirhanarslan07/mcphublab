import { createServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { ShieldCheck, Star, ArrowLeft, Search, Zap, AlertTriangle, ShieldAlert } from "lucide-react";
import { calculateHeuristicAnalysis } from '@/lib/trust-engine';
import { ClientImage } from "@/components/client-image";

interface Props {
  searchParams: { q?: string };
}

export default async function RecommendPage({ searchParams }: Props) {
  const supabase = createServerClient();
  const query = searchParams.q || '';

  if (!query) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20">
           <Search className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-4">Find your MCP</h1>
        <p className="text-zinc-500 max-w-md mb-10 font-medium">Describe your task and we'll match you with the right server implementation.</p>
        <Link href="/" className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all active:scale-95">
          Back to Home
        </Link>
      </div>
    );
  }

  // Extract clean keywords (2+ chars to be more inclusive)
  const words = query
    .toLowerCase()
    .replace(/[^\wçğıöşüÇĞİÖŞÜ\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= 2);

  let results: any[] = [];
  if (words.length > 0) {
    // 1. ADVANCED MATCHING: Use overlap (&&) for keywords array + ILIKE for use_case strings
    const keywordConditions = `keywords.ov.{${words.join(',')}}`;
    const useCaseConditions = words.map(word => `use_case.ilike.%${word}%`).join(',');
    const descriptionConditions = words.map(word => `description.ilike.%${word}%`).join(',');

    const { data: matchedUseCases } = await supabase
      .from('server_use_cases')
      .select(`
        use_case,
        description,
        server_id,
        mcp_servers (*)
      `)
      .or(`${keywordConditions},${useCaseConditions},${descriptionConditions}`)
      .limit(100);

    // Filter and group by server
    const uniqueServers = new Map();
    matchedUseCases?.forEach((uc: any) => {
      const s = uc.mcp_servers;
      if (!s) return;

      // Apply heuristic if score is 0 or missing
      let finalScore = s.trust_score;
      if (!finalScore || finalScore === 0) {
        finalScore = calculateHeuristicAnalysis({
          name: s.name,
          stars: s.stars || 0,
          github_updated_at: s.updated_at,
          author: s.author,
          is_verified: s.is_verified
        }).score;
      }

      if (!uniqueServers.has(s.id)) {
        uniqueServers.set(s.id, {
          ...s,
          trust_score: finalScore,
          reasons: [uc.use_case]
        });
      } else {
        const existing = uniqueServers.get(s.id);
        if (!existing.reasons.includes(uc.use_case)) {
          existing.reasons.push(uc.use_case);
        }
      }
    });

    // 2. SECONDARY FALLBACK: Search mcp_servers table directly for keywords in name/desc
    if (uniqueServers.size < 5) {
       const directConditions = words.map(word => `name.ilike.%${word}%,description.ilike.%${word}%`).join(',');
       const { data: directMatches } = await supabase
         .from('mcp_servers')
         .select('*')
         .or(directConditions)
         .limit(20);

       directMatches?.forEach((s: any) => {
          if (!uniqueServers.has(s.id)) {
             // Apply heuristic here too
             const heuristic = calculateHeuristicAnalysis({
                name: s.name,
                stars: s.stars || 0,
                github_updated_at: s.updated_at,
                author: s.author,
                is_verified: s.is_verified
             });
             uniqueServers.set(s.id, {
                ...s,
                trust_score: s.trust_score || heuristic.score,
                reasons: ['Direct name/description match']
             });
          }
       });
    }

    results = Array.from(uniqueServers.values()).sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0));
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pb-32 selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="container mx-auto px-6 max-w-5xl pt-24">
        
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#444] hover:text-emerald-500 transition-colors mb-12 group">
           <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
           Back to Discovery
        </Link>

        <header className="space-y-4 mb-20">
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              Discovery results for <br />
              <span className="text-emerald-500 italic">"{query}"</span>
           </h1>
           <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
              Optimized matches found in registry
           </p>
        </header>

        {results.length > 0 ? (
          <div className="space-y-8">
             {results.map((server) => (
                <div key={server.id} className="group relative bg-[#0a0a0a] border border-zinc-900 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.05)]">
                   <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
                      
                      {/* Identity Section */}
                      <div className="w-20 h-20 rounded-full border border-zinc-800 overflow-hidden flex-shrink-0 bg-[#111] flex items-center justify-center p-4">
                         {server.author_url ? (
                           <ClientImage src={server.author_url} alt={server.author} className="w-full h-full object-cover rounded-full" />
                         ) : (
                           <Zap className="w-8 h-8 text-emerald-500/50" />
                         )}
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 space-y-6">
                             <div className="flex flex-wrap items-center gap-4">
                                <h3 className="text-2xl font-black text-white hover:text-emerald-400 transition-colors">
                                   <Link href={`/servers/${server.slug}`}>{server.name.replace(/-/g, ' ')}</Link>
                                </h3>
                                {server.is_verified && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                             </div>

                             {/* Premium Trust Score Visualization */}
                             <div className="flex items-center gap-6 py-2">
                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                   <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                                      <span>Health Index</span>
                                      <span className={server.trust_score >= 8 ? 'text-emerald-500' : 'text-amber-500'}>
                                         {(server.trust_score && server.trust_score > 0) ? server.trust_score.toFixed(1) : '-'}
                                      </span>
                                   </div>
                                   <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                                      <div 
                                        className={`h-full transition-all duration-1000 ${server.trust_score >= 8 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`} 
                                        style={{ width: `${(server.trust_score || 0) * 10}%` }}
                                      />
                                   </div>
                                </div>
                                <div className="h-8 w-px bg-zinc-900 hidden md:block" />
                                <div className="hidden md:flex flex-col gap-0.5">
                                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">Audit Status</span>
                                   <span className={`text-[11px] font-bold ${server.trust_score >= 8 ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
                                      {server.trust_score >= 8 ? '💎 3-TIER VERIFIED' : '✅ HEURISTIC STABLE'}
                                   </span>
                                </div>
                             </div>

                         <p className="text-zinc-500 font-medium leading-[1.7] max-w-2xl">
                            {server.description}
                         </p>

                         {/* Match Reasoning */}
                         <div className="pt-4 space-y-3">
                            <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Matched Use Cases</h4>
                            <div className="flex flex-wrap gap-2">
                               {server.reasons.map((reason: string, i: number) => (
                                  <div key={i} className="px-4 py-2 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-xl text-xs font-bold text-emerald-500/80">
                                     → {reason}
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* CTA Section */}
                      <div className="flex flex-col gap-3 w-full md:w-auto">
                         <Link href={`/servers/${server.slug}`} className="px-10 py-5 bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-xl">
                            Access Server
                         </Link>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="py-32 border border-dashed border-zinc-900 rounded-[3rem] text-center space-y-8">
             <div className="w-16 h-16 bg-rose-500/5 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <ShieldAlert className="w-8 h-8 text-rose-500" />
             </div>
             <div className="space-y-2">
                <h2 className="text-2xl font-black text-white px-4 tracking-tighter">Negative Index Result</h2>
                <p className="text-zinc-600 font-medium px-6">We couldn't find an MCP optimized for "{query}" yet.</p>
             </div>
             <Link href="/servers" className="inline-block px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all">
                Browse Entire Catalog
             </Link>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-32 p-12 bg-zinc-900/10 border border-zinc-900 rounded-[3rem] text-center space-y-6">
           <h3 className="text-xl font-black tracking-tighter">Missing something?</h3>
           <p className="text-zinc-600 text-sm font-medium">If you've built an MCP server for this task, submit it to our global index.</p>
           <div className="flex items-center justify-center gap-6 pt-4">
              <Link href="/servers" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444] hover:text-white transition-colors">Complete Registry</Link>
              <div className="w-1 h-1 bg-zinc-800 rounded-full" />
              <Link href="/submit" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444] hover:text-white transition-colors">Submit Node</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
