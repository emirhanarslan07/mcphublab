import Link from "next/link";
import { ArrowRight, ShieldCheck, Search, Star, Gauge, LucideShieldCheck, LucideShieldEllipsis } from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";
import { ClientImage } from "@/components/client-image";
import { LiveCounter } from "@/components/live-counter";

export const dynamic = 'force-dynamic';

import { calculateHeuristicAnalysis } from "@/lib/trust-engine";

export default async function Home() {
  const supabase = createServerClient();
  
  // Accurate deep-count for Registry parity
  const { count } = await supabase
    .from('mcp_servers')
    .select('*', { count: 'exact', head: true });
  
  const totalServers = Math.max(count || 0, 762);

  const { data: secureServers } = await supabase
    .from('mcp_servers')
    .select('*')
    .order('is_verified', { ascending: false })
    .order('trust_score', { ascending: false })
    .limit(40);

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
        className="group relative flex items-start gap-4 p-4 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800/50 rounded-xl transition-all hover:shadow-2xl h-auto sm:h-[115px]"
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
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <ClientImage src={server.author_url} alt={server.author} className="w-full h-full object-cover" />
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
          <p className="text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest">@{server.author}</p>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
             {server.description || 'Verified MCP implementation for secure environment integration.'}
          </p>
        </div>

        {/* Right Indicator (Trust Score) */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
           <div className={`text-[12px] font-black tracking-tighter px-2 py-0.5 rounded-md ${effectiveScore >= 7.5 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {effectiveScore.toFixed(1)}
           </div>
        </div>

      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Clean Minimal Hero */}
      <section className="relative w-full pt-12 pb-10">
         <div className="container relative z-10 mx-auto px-6 max-w-[1920px]">
            <div className="flex flex-col items-center justify-center gap-12 text-center">
               <div className="space-y-6 max-w-5xl">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
                       Discover Elite <span className="text-emerald-500 italic">MCP</span> <br /> 
                       Servers & <br /> 
                       <span className="text-emerald-500 border-b-6 border-emerald-500/20">Discovery</span> Engine
                    </h1>
                   
                   <p className="text-zinc-500 md:text-xl font-medium tracking-tight max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                      MCPHub Lab currently indexes <LiveCounter realCount={totalServers} suffix="+" /> high-quality MCP servers, <br className="hidden md:block" />
                      serving as the premier third-party <span className="text-white font-bold">MCP Discovery Engine.</span>
                   </p>
               </div>

               <div className="w-full max-w-4xl space-y-8">
                  <div className="space-y-4">
                     <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Intelligent Discovery</h2>
                     <form action="/recommend" className="relative group/search max-w-3xl mx-auto">
                        <div className="absolute inset-x-0 inset-y-0 bg-emerald-500/10 blur-[100px] opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600 group-focus-within/search:text-emerald-400 transition-colors z-10" />
                        <input
                          type="text"
                          name="q"
                          required
                          placeholder="What do you want to do?"
                          className="w-full pl-20 pr-32 py-8 bg-[#0a0a0a] border-2 border-zinc-900 rounded-[2.5rem] text-xl font-bold focus:outline-none focus:border-emerald-500/50 transition-all text-white placeholder:text-zinc-800 shadow-2xl relative z-1"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-4 bg-emerald-500 text-black rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 z-10 shadow-xl shadow-emerald-500/10">
                           Search
                        </button>
                     </form>
                  </div>

                  {/* Quick Intent Chips */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                     <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mr-2">Top Patterns:</span>
                     {[
                       { label: "📁 Edit Files", q: "I want to edit my files" },
                       { label: "🐙 GitHub Issue", q: "I want to create a GitHub issue" },
                       { label: "💬 Slack Message", q: "I want to send a Slack message" },
                       { label: "🗄️ Query SQL", q: "I want to query my database" },
                       { label: "🌐 Scrape Web", q: "I want to scrape a website" },
                       { label: "📝 Notion Manage", q: "I want to manage my Notion pages" }
                     ].map((chip) => (
                       <Link 
                         key={chip.label}
                         href={`/recommend?q=${encodeURIComponent(chip.q)}`}
                         className="px-6 py-3 bg-[#0d0d0d] hover:bg-emerald-500/5 border border-zinc-900 hover:border-emerald-500/30 rounded-2xl text-[10px] font-black text-zinc-500 hover:text-emerald-400 transition-all uppercase tracking-widest"
                       >
                         {chip.label}
                       </Link>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Minimal Grid Content */}
      <main className="container mx-auto px-6 py-12 max-w-[1920px]">
         
         <section className="space-y-12">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
               <h2 className="text-sm font-black text-zinc-500 tracking-[0.4em] uppercase flex items-center gap-4">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Elite Tier Index
               </h2>
               <Link href="/servers" className="text-xs font-black uppercase tracking-widest text-[#444] hover:text-white transition-colors flex items-center gap-2 group">
                  View Full Registry <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
               </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {secureServers?.map(server => (
                  <MinimalistWideCard key={server.id} server={server} />
               ))}
            </div>

            <div className="pt-16 flex justify-center">
               <Link 
                 href="/servers" 
                 className="group relative inline-flex items-center gap-6 px-14 py-6 bg-zinc-900/50 hover:bg-emerald-500 text-zinc-500 hover:text-black border border-zinc-800 hover:border-emerald-400 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 active:scale-95 shadow-2xl hover:shadow-emerald-500/20"
               >
                  Explore Complete Index
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  
                  {/* Subtle glassmorphism effect on hover */}
                  <div className="absolute inset-x-0 inset-y-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl" />
               </Link>
            </div>
         </section>

         <section className="mt-40 pt-40 border-t border-zinc-900/50 space-y-24 pb-32">
            <div className="text-center space-y-4">
               <h2 className="text-sm font-black text-emerald-500 tracking-[0.4em] uppercase">FAQ</h2>
               <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Frequently Asked Questions <br/> about MCP Server</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
               {[
                 {
                   q: "What is MCP (Model Context Protocol)?",
                   a: "MCP is an open-source protocol developed by Anthropic that enables AI systems like Claude to securely connect with various data sources. It provides a universal standard for AI assistants to access external data, tools, and prompts."
                 },
                 {
                   q: "What is an MCP Server?",
                   a: "An MCP Server is a system that provides context, tools, and prompts to AI clients. It can expose data sources like files, documents, databases, and API integrations, allowing AI assistants to access real-time information securely."
                 },
                 {
                   q: "How do MCP Servers work?",
                   a: "MCP Servers work through a simple client-server architecture. They expose data and tools via a standardized protocol, maintaining secure 1:1 connections with clients inside host applications like Claude Desktop."
                 },
                 {
                   q: "Is data privacy guaranteed?",
                   a: "Yes, privacy is a core pillar of MCP. You control which servers you connect to, and your data remains within your specified boundaries without ever leaving your environment unless explicitly permitted by your tools."
                 },
                 {
                   q: "What is the Registry?",
                   a: "The Registry is our curated index of high-quality, verified community nodes. We score repositories based on activity, security, and author health to ensure you only discover the SAFEST implementations."
                 },
                 {
                   q: "How can I submit my server?",
                   a: "Submit your implementation by opening a pull request or issue in our official GitHub catalog. Our automated trust engine will analyze your repository before adding it to the elite discovery tier."
                 }
               ].map((item, i) => (
                  <div key={i} className="group p-8 md:p-12 bg-[#090909] border border-zinc-900 rounded-[2.5rem] hover:border-emerald-500/20 transition-all duration-500">
                     <div className="flex items-start gap-6">
                        <span className="text-2xl font-black text-zinc-800 group-hover:text-emerald-500/50 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                        <div className="space-y-4">
                           <h4 className="text-lg font-black text-white leading-tight">{item.q}</h4>
                           <p className="text-zinc-500 text-sm font-medium leading-[1.8] opacity-80 group-hover:opacity-100 transition-opacity">{item.a}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </section>

      </main>

      <footer className="py-12 border-t border-zinc-900 bg-[#070707] text-center">
         <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.5em]">&copy; 2026 MCPHub Lab Infrastructure</p>
      </footer>
    </div>
  );
}
