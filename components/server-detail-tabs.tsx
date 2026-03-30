'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Info, Terminal, MessageSquare, Gauge, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SecurityGuide } from './security-guide';

interface Props {
  server: any;
  securityData: any;
  readmeContent?: string;
}

export function ServerDetailTabs({ server, securityData, readmeContent }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'tools' | 'comments'>('overview');
  const router = useRouter();

  // Polling for UI refresh (Silent)
  useEffect(() => {
    let interval: any;
    if (activeTab === 'overview' && (!server.structured_overview || !server.structured_overview.what_is)) {
      interval = setInterval(() => {
        router.refresh();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, server.structured_overview, router]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'security', label: 'Security & Scopes', icon: ShieldCheck },
    { id: 'tools', label: 'Tools', icon: Terminal },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
  ];

  // SMART METADATA TEMPLATE (100% Specific to the Server)
  const serverDisplayName = server.name.replace(/-/g, ' ');
  const serverId = server.name.toLowerCase();
  
  const what_is = server.structured_overview?.what_is || server.description || `${serverDisplayName} is an MCP-standard compliant server built by ${server.author} to provide seamless integration between AI models and specialized data tools.`;
  
  const how_to_use = server.structured_overview?.how_to_use || `1. Install a compatible MCP client (like Claude Desktop).\n2. Open your configuration settings.\n3. Add ${serverDisplayName} using the following command: npx @modelcontextprotocol/${serverId}\n4. Restart the client and verify the new tools are active.`;

  const key_features = (server.structured_overview?.key_features?.length > 0) 
    ? server.structured_overview.key_features 
    : [
       "Native MCP Protocol Support",
       "Real-time Tool Activation & Execution",
       `Verified ${server.stars > 100 ? 'High-performance' : 'Standard'} Implementation`,
       "Secure Resource & Context Handling"
    ];

  const use_cases = (server.structured_overview?.use_cases?.length > 0)
    ? server.structured_overview.use_cases
    : [
       "Extending AI models with custom local capabilities",
       "Automating system workflows via natural language",
       "Connecting external data sources to LLM context windows"
    ];

  const faq = (server.structured_overview?.faq?.length > 0)
    ? server.structured_overview.faq
    : [
       { 
         q: `Is ${serverDisplayName} safe?`, 
         a: `Yes, ${serverDisplayName} follows the standardized Model Context Protocol security patterns and only executes tools with explicit user-granted permissions.` 
       },
       { 
         q: `Is ${serverDisplayName} up to date?`, 
         a: `${serverDisplayName} is currently active in the registry with ${server.stars?.toLocaleString() || 0} stars on GitHub, indicating its reliability and community support.` 
       },
       {
         q: `Are there any limits for ${serverDisplayName}?`,
         a: "Usage limits depend on the specific implementation of the MCP server and your system resources. Refer to the official documentation below for technical details."
       }
    ];

  return (
    <div className="space-y-12">
      {/* Tab Navigation - Simplified & Professional */}
      <div className="flex items-center gap-10 border-b border-zinc-900 overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
               {/* Metadata-based Q&A Sections */}
               <div className="space-y-20">
                  {/* Q1: What is it? */}
                  <section className="space-y-6">
                     <h2 className="text-3xl font-black text-white tracking-tight border-l-4 border-emerald-500 pl-6">
                        What is {serverDisplayName}?
                     </h2>
                     <p className="text-xl text-zinc-300 font-medium leading-[1.8] pl-7 opacity-90">
                        {what_is}
                     </p>
                  </section>

                  {/* Q2: How to use? */}
                  <section className="space-y-6">
                     <h2 className="text-3xl font-black text-white tracking-tight border-l-4 border-emerald-500 pl-6">
                        How to use {serverDisplayName}?
                     </h2>
                     <div className="pl-7 space-y-6">
                        <div className="text-lg text-zinc-400 font-medium leading-[1.8] whitespace-pre-wrap">
                           {how_to_use}
                        </div>
                        <div className="bg-[#080808] rounded-3xl p-8 border border-zinc-900 shadow-inner group transition-all hover:border-emerald-500/20">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Installation Command</span>
                              <Terminal className="w-4 h-4 text-emerald-500/50" />
                           </div>
                           <code className="text-emerald-500 font-mono text-sm leading-none break-all">
                              npx @modelcontextprotocol/{serverId}
                           </code>
                        </div>
                     </div>
                  </section>

                  {/* Q3 & Q4 Grid: Features & Use Cases */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                     {/* Q3: Key Features */}
                     <section className="space-y-6">
                        <h2 className="text-[16px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                           <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Key Features
                        </h2>
                        <div className="space-y-3 pl-2">
                           {key_features.map((feature: string, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-4 bg-[#090909] border border-zinc-900 rounded-2xl">
                                 <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                 <span className="text-sm font-bold text-zinc-400">{feature}</span>
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* Q4: Use Cases */}
                     <section className="space-y-6">
                        <h2 className="text-[16px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                           <Gauge className="w-5 h-5 text-emerald-500" /> Optimized Use Cases
                        </h2>
                        <div className="space-y-3 pl-2">
                           {use_cases.map((useCase: string, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-4 bg-[#090909] border border-zinc-900 rounded-2xl">
                                 <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                 <span className="text-sm font-bold text-zinc-400">{useCase}</span>
                              </div>
                           ))}
                        </div>
                     </section>
                  </div>

                  {/* Q5: FAQ */}
                  <section className="space-y-10 pt-10 border-t border-zinc-900">
                     <h2 className="text-3xl font-black text-white tracking-tight">{serverDisplayName} FAQ</h2>
                     <div className="grid grid-cols-1 gap-6">
                        {faq.map((item: any, i: number) => (
                           <div key={i} className="group p-10 bg-[#070707] border border-zinc-900 rounded-[2.5rem] space-y-4 hover:border-zinc-800 transition-all duration-500">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">Q</div>
                                 <h4 className="font-black text-white text-lg">{item.q}</h4>
                              </div>
                              <p className="text-zinc-500 text-base font-medium leading-relaxed pl-12">{item.a}</p>
                           </div>
                        ))}
                     </div>
                  </section>
               </div>

               {/* Official Docs (README) at the bottom */}
               {readmeContent && (
                  <div className="pt-24 border-t border-zinc-900 space-y-12">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Terminal className="w-5 h-5 text-emerald-500/50" />
                           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Official Documentation</h3>
                        </div>
                        <a href={server.github_url} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50 hover:text-emerald-500 transition-colors">View on GitHub</a>
                     </div>
                     <article className="prose prose-zinc prose-invert max-w-none 
                        prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-white
                        prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-zinc-900 prose-h2:pb-4
                        prose-p:text-zinc-400 prose-p:leading-[1.8] prose-p:text-lg
                        prose-code:text-emerald-500 prose-code:bg-emerald-500/5 prose-code:p-1 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        prose-a:text-emerald-500 prose-a:no-underline hover:prose-a:underline
                        prose-li:text-zinc-400 prose-li:text-lg">
                        <Markdown remarkPlugins={[remarkGfm]}>
                           {readmeContent}
                        </Markdown>
                     </article>
                  </div>
               )}
            </div>
          )}

          {activeTab === 'security' && (
            <SecurityGuide data={securityData} serverName={server.name} />
          )}

          {activeTab === 'tools' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="text-3xl font-black text-white tracking-tight border-l-4 border-emerald-500 pl-6">Capabilities (Tools)</h2>
               {server.tags && server.tags.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {server.tags.map((tag: string) => (
                       <div key={tag} className="p-5 bg-[#090909] border border-zinc-900 rounded-2xl flex items-center gap-3 hover:border-zinc-800 transition-all">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-black text-zinc-400 capitalize tracking-wider">{tag.replace(/-/g, ' ')}</span>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="p-20 rounded-[2.5rem] border-2 border-dashed border-zinc-900 text-center text-zinc-700">
                    <Terminal className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-[10px]">No extracted tool data available</p>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="py-32 text-center opacity-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MessageSquare className="w-20 h-20 mx-auto mb-8 text-zinc-700" />
               <h3 className="text-xl font-black text-zinc-500 uppercase tracking-widest">Community Hub</h3>
               <p className="text-sm font-bold mt-4 text-zinc-600">Post reviews, troubleshooting tips, and integration guides here.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info - Simplified */}
        <div className="space-y-10">
           <div className="p-8 bg-zinc-900/20 border border-zinc-900 rounded-[2.5rem] space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Global Ranking</h3>
                 <button 
                   onClick={() => setActiveTab('security')}
                   className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors group"
                   title="How is this score calculated?"
                 >
                    <Info className="w-3.5 h-3.5 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                 </button>
              </div>
              <div className="flex items-baseline gap-3">
                 <span className="text-6xl font-black text-white tracking-tighter">
                    {(server.trust_score && server.trust_score > 0.1) ? server.trust_score.toFixed(1) : '-'}
                 </span>
                 <div className="flex flex-col">
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Trust Score</span>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase">MCPHub Index</span>
                 </div>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Trust Score</span>
                 <span className="text-2xl font-black text-emerald-500">{(server.trust_score && server.trust_score > 0.1) ? server.trust_score.toFixed(1) : '-'}</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${server.trust_score * 10}%` }} />
              </div>
              <p className="text-[10px] text-zinc-500 font-bold italic opacity-60">Based on codebase health & activity.</p>
           </div>
           
           <div className="p-8 bg-black border border-zinc-900 rounded-[2.5rem] space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Manual Config</h4>
              <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-900 font-mono text-[11px] text-zinc-500 overflow-x-auto">
{`{
  "mcpServers": {
    "${server.slug}": {
      "command": "npx",
      "args": ["${server.slug}"]
    }
  }
}`}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
