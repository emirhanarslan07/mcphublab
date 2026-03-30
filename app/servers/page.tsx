import { createServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { ShieldCheck, ChevronLeft, ChevronRight, Search, Database, Zap } from 'lucide-react';
import { ClientImage } from "@/components/client-image";
import { calculateHeuristicAnalysis } from '@/lib/trust-engine';
import { SearchInput } from '@/components/search-input';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
    risk?: string;
  };
}

export default async function ServersPage({ searchParams }: Props) {
  const supabase = createServerClient();

  const page = parseInt(searchParams.page || '1');
  const limit = 40; 
  const offset = (page - 1) * limit;

  // Search/Filter Query
  let query = supabase
    .from('mcp_servers')
    .select('*', { count: 'exact' });

  if (searchParams.q) {
    query = query.or(
      `name.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`
    );
  }

  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }
  
  if (searchParams.risk === 'verified') {
    query = query.eq('is_verified', true);
  }

  // DEFAULT SORT BY TRUST_SCORE DESC, THEN STARS
  const sortField = searchParams.sort || 'trust_score';
  const sortMap: Record<string, string> = {
    'stars': 'stars',
    'trust_score': 'trust_score',
    'name': 'name',
    'updated': 'created_at',
  };
  query = query.order(sortMap[sortField] || 'trust_score', { ascending: false });

  const { data: servers, count } = await query.range(offset, offset + limit - 1);
  const totalPages = Math.ceil((count || 0) / limit);

  const getDifferentiatorColor = (name: string) => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const MinimalistWideCard = ({ server }: { server: any }) => {
    // DYNAMIC GRANULARITY: If it's a generic 8.5 or missing, recalculate
    const effectiveScore = (server.trust_score && server.trust_score > 0.1 && server.trust_score !== 8.5) 
      ? server.trust_score 
      : calculateHeuristicAnalysis({
          name: server.name,
          stars: server.stars || 0,
          github_updated_at: server.updated_at || new Date().toISOString(),
          author: server.author || 'unknown',
          is_verified: server.is_verified || false
        }).score;

    return (
      <Link 
        href={`/servers/${server.slug}`} 
        className="group relative flex items-start gap-4 p-4 bg-[#161616] hover:bg-[#1a1a1a] border border-zinc-800/40 rounded-xl transition-all h-auto sm:h-[115px]"
      >
        {/* Dynamic Service Identity - mcp.so App Store Style */}
        <div className="relative flex-shrink-0 w-11 h-11 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300" 
             style={{ 
               borderColor: `${getDifferentiatorColor(server.name)}66`,
               background: `linear-gradient(135deg, ${getDifferentiatorColor(server.name)} 0%, #000 100%)` 
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
                  <div className="w-full h-full p-2 bg-white flex items-center justify-center">
                    <ClientImage src={brandMap[name]} alt={server.name} className="w-full h-full object-contain" />
                  </div>
                );
              }

              // GitHub Org/Author Avatar Fallback (Replicates mcp.so exactly)
              if (server.author_url) {
                return (
                  <div className="w-full h-full bg-[#111] flex items-center justify-center">
                    <ClientImage src={server.author_url} alt={server.author} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                );
              }

              // High-Density Fallback Icons 
              return (
                <div className="text-white/90 flex items-center justify-center text-[10px] font-black tracking-tighter">
                  {server.name.substring(0, 3).toUpperCase()}
                </div>
              );
           })()}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-extrabold text-[15px] text-zinc-100 truncate group-hover:text-emerald-400 transition-colors capitalize leading-tight">
              {server.name.replace(/-/g, ' ')}
            </h3>
            {server.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
          </div>
          <p className="text-[9px] font-bold text-zinc-600 mb-1.5 uppercase tracking-widest">@{server.author}</p>
          <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
             {server.description || 'Verified MCP implementation for secure environment integration.'}
          </p>
        </div>

        {/* Security Info (Top Right) */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
            <div className={`text-[12px] font-black tracking-tighter px-2.5 py-1 rounded-md ${effectiveScore >= 7.5 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
               {(effectiveScore && effectiveScore > 0.1) ? effectiveScore.toFixed(1) : '-'}
            </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-200 pb-20 selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="container mx-auto px-6 py-20 max-w-[1920px]">
        
        <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
             <div className="flex items-center gap-2 mb-10 text-[10px] font-black uppercase tracking-widest text-[#444] hover:text-emerald-500 transition-colors">
                <Link href="/" className="hover:text-white">MCPHub Lab</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-zinc-500">Inventory</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
                Server <span className="text-emerald-500 italic">Inventory</span>
             </h1>
             <p className="text-zinc-600 font-bold md:text-xl">
                The definitive inventory of high-quality, verified community nodes.
             </p>
          </div>
        </div>

        <div className="mb-16">
           <Suspense fallback={<div className="h-20 w-full animate-pulse bg-zinc-900 rounded-[2rem]" />}>
             <SearchInput defaultValue={searchParams.q} />
           </Suspense>
        </div>

        {/* High Density Grid - Tighter packing with 4 columns */}
        {servers && servers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {servers.map((server) => (
              <MinimalistWideCard key={server.id} server={server} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center opacity-30 italic">
            <h2 className="text-2xl font-black">Null Inventory Result</h2>
            <Link href="/servers" className="mt-8 text-emerald-500 underline font-black uppercase text-[10px] tracking-widest">Clear Index Scan</Link>
          </div>
        )}

        {/* Premium Pagination - Numerical navigation with Ellipsis */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-32">
            
            <Link
              href={page > 1 ? `?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}` : '#'}
              className={`flex items-center gap-2 px-6 py-4 bg-[#0c0c0c] border border-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${page > 1 ? 'hover:bg-zinc-800 hover:text-emerald-500 text-white' : 'opacity-10 cursor-not-allowed text-zinc-700'}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Link>

            <div className="flex items-center gap-2">
               {/* Logic for 1 2 3 ... Last-1 Last */}
               {(() => {
                 const pages = [];
                 
                 // Always show first 3
                 for (let i = 1; i <= Math.min(3, totalPages); i++) {
                   pages.push(i);
                 }

                 // If we are far from the start, we might need more to show context
                 if (page > 4 && totalPages > 7) {
                    pages.push('...');
                    // Show current neighborhood if not already shown
                    if (page < totalPages - 2) {
                       pages.push(page);
                       pages.push('...');
                    }
                 } else if (totalPages > 5 && totalPages <= 7) {
                    // Show some middle
                    for (let i = 4; i < totalPages - 1; i++) pages.push(i);
                 } else if (totalPages > 7 && page <= 4) {
                    pages.push(4);
                    pages.push('...');
                 }

                 // Always show last 2
                 if (totalPages > 3) {
                   for (let i = Math.max(totalPages - 1, 4); i <= totalPages; i++) {
                     if (!pages.includes(i)) pages.push(i);
                   }
                 }

                 return pages.map((p, idx) => {
                    if (p === '...') return <span key={`dots-${idx}`} className="text-zinc-800 font-black px-2">...</span>;
                    return (
                      <Link
                        key={p}
                        href={`?${new URLSearchParams({ ...searchParams, page: String(p) }).toString()}`}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl text-xs font-black transition-all border ${page === p ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-[#0c0c0c] border-zinc-900 text-zinc-600 hover:border-zinc-700 hover:text-white'}`}
                      >
                        {p}
                      </Link>
                    );
                 });
               })()}
            </div>

            <Link
              href={page < totalPages ? `?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}` : '#'}
              className={`flex items-center gap-2 px-6 py-4 bg-[#0c0c0c] border border-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${page < totalPages ? 'hover:bg-zinc-800 hover:text-emerald-500 text-white' : 'opacity-10 cursor-not-allowed text-zinc-700'}`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
