'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Layers, Star, PlusCircle, ArrowRight, ShieldCheck, Zap, Database, Search, ChevronDown, Check, X, Trophy } from 'lucide-react';
import { calculateHeuristicAnalysis } from '@/lib/trust-engine';
import { ClientImage } from '@/components/client-image';

export default function ComparePage({ searchParams }: { searchParams: { a?: string; b?: string } }) {
  const [allServers, setAllServers] = useState<any[]>([]);
  const [serverA, setServerA] = useState<any>(null);
  const [serverB, setServerB] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTermA, setSearchTermA] = useState('');
  const [searchTermB, setSearchTermB] = useState('');
  const [isOpenA, setIsOpenA] = useState(false);
  const [isOpenB, setIsOpenB] = useState(false);
  
  const dropdownRefA = useRef<HTMLDivElement>(null);
  const dropdownRefB = useRef<HTMLDivElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: servers } = await supabase
        .from('mcp_servers')
        .select('id, name, stars, author, trust_score, is_verified, author_url')
        .order('stars', { ascending: false });
      
      if (servers) setAllServers(servers);

      if (searchParams.a) {
        const { data } = await supabase.from('mcp_servers').select('*').eq('id', searchParams.a).single();
        if (data) setServerA(data);
      }
      if (searchParams.b) {
        const { data } = await supabase.from('mcp_servers').select('*').eq('id', searchParams.b).single();
        if (data) setServerB(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [searchParams.a, searchParams.b]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRefA.current && !dropdownRefA.current.contains(event.target as Node)) setIsOpenA(false);
        if (dropdownRefB.current && !dropdownRefB.current.contains(event.target as Node)) setIsOpenB(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelection = (key: 'a' | 'b', value: string) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    window.location.href = url.toString();
  };

  const getRiskColor = (score: number) => {
    if (score >= 7.5) return 'text-emerald-500';
    if (score >= 5.0) return 'text-amber-500';
    return 'text-rose-500';
  };

  const filteredA = allServers.filter(s => s.name.toLowerCase().includes(searchTermA.toLowerCase()) || s.author.toLowerCase().includes(searchTermA.toLowerCase()));
  const filteredB = allServers.filter(s => s.name.toLowerCase().includes(searchTermB.toLowerCase()) || s.author.toLowerCase().includes(searchTermB.toLowerCase()));

  const CustomSelect = ({ 
    selected, 
    onSelect, 
    searchTerm, 
    setSearchTerm, 
    isOpen, 
    setIsOpen, 
    dropdownRef,
    filtered,
    label
  }: any) => (
    <div className="flex-1 space-y-3 relative" ref={dropdownRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333] mb-2 block">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-between p-6 bg-[#0a0a0a] border border-zinc-900 rounded-[2rem] cursor-pointer transition-all ${isOpen ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/10' : 'hover:border-zinc-800'}`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-500/5 flex items-center justify-center flex-shrink-0">
             {selected ? <Check className="w-4 h-4 text-emerald-500" /> : <PlusCircle className="w-4 h-4 text-zinc-700" />}
          </div>
          <div className="truncate">
             {selected ? (
               <span className="text-sm font-black text-white">{selected.name}</span>
             ) : (
               <span className="text-sm font-bold text-zinc-700">Select a server...</span>
             )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-800 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-[#0a0a0a] border border-zinc-900 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
           <div className="p-3 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-10">
              <div className="relative group/input">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/input:text-emerald-500 transition-colors" />
                 <input 
                   autoFocus
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-[#070707] border border-zinc-800 focus:border-emerald-500/50 rounded-2xl text-sm font-medium text-white focus:outline-none transition-all placeholder:text-zinc-700"
                   placeholder="Search registry index..."
                   onClick={(e) => e.stopPropagation()}
                 />
              </div>
           </div>
                   <div className="max-h-[350px] overflow-y-auto p-2 space-y-1">
                      {filtered.map((s: any) => {
                        const effectiveScore = (s.trust_score && s.trust_score > 0.1) 
                          ? s.trust_score 
                          : calculateHeuristicAnalysis({
                              name: s.name,
                              stars: s.stars || 0,
                              github_updated_at: s.updated_at || new Date().toISOString(),
                              author: s.author || 'unknown',
                              is_verified: s.is_verified || false
                            }).score;
                        
                        return (
                          <div 
                            key={s.id} 
                            onClick={() => { onSelect(s.id); setIsOpen(false); }}
                            className="group/item flex items-center justify-between p-3.5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer"
                          >
                             <div className="flex items-center gap-3.5 min-w-0">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5 group-hover/item:border-emerald-500/30 transition-colors">
                                   {s.author_url ? (
                                     <ClientImage src={s.author_url} alt={s.author} className="w-full h-full object-cover" />
                                   ) : (
                                     <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-emerald-500/30" />
                                     </div>
                                   )}
                                </div>
                                <div className="truncate">
                                   <p className="text-[14px] font-bold text-zinc-100 group-hover/item:text-emerald-400 transition-colors truncate tracking-[-0.01em]">{s.name}</p>
                                   <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest opacity-80">@{s.author}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 flex-shrink-0 pl-4 border-l border-white/5">
                                <div className="flex flex-col items-end">
                                   <span className={`text-[11px] font-black flex items-center gap-1.5 leading-none ${getRiskColor(effectiveScore)}`}>
                                     {effectiveScore.toFixed(1)}
                                   </span>
                                   {s.is_verified && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter mt-1">Verified</span>}
                                </div>
                             </div>
                          </div>
                        );
                      })}
              {filtered.length === 0 && <p className="p-10 text-center text-xs font-bold text-zinc-800 uppercase tracking-widest">No servers found</p>}
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-200 selection:bg-emerald-500/30">
      <div className="container mx-auto px-6 py-24 max-w-[1400px]">
        
        <div className="flex flex-col items-center text-center space-y-6 mb-24 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4 animate-in fade-in zoom-in-50 duration-1000">
             <Trophy className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
            Ultimate <span className="text-emerald-500 italic">Showdown</span>
          </h1>
          <p className="text-zinc-500 font-medium text-lg leading-relaxed">
            Side-by-side technical comparison of the world's most trusted MCP server implementations.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-20">
          <CustomSelect 
            label="Challenger One"
            selected={serverA} 
            onSelect={(id: string) => handleSelection('a', id)} 
            searchTerm={searchTermA} 
            setSearchTerm={setSearchTermA}
            isOpen={isOpenA}
            setIsOpen={setIsOpenA}
            dropdownRef={dropdownRefA}
            filtered={filteredA}
          />
          <div className="hidden lg:flex items-center justify-center text-zinc-900 font-black italic text-4xl px-4 py-8">VS</div>
          <CustomSelect 
             label="Challenger Two"
             selected={serverB} 
             onSelect={(id: string) => handleSelection('b', id)} 
             searchTerm={searchTermB} 
             setSearchTerm={setSearchTermB}
             isOpen={isOpenB}
             setIsOpen={setIsOpenB}
             dropdownRef={dropdownRefB}
             filtered={filteredB}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (serverA || serverB) ? (
          <div className="relative group/table p-1 bg-zinc-900/50 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-1000">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] table-fixed">
                <thead className="bg-[#0f0f0f]/80">
                  <tr>
                    <th className="p-10 text-left w-1/4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Audit Metric</th>
                    <th className="p-10 text-center">
                       {serverA ? (
                         <div className="space-y-2">
                           <div className="w-16 h-16 rounded-full border border-zinc-800 bg-[#111] flex items-center justify-center mx-auto mb-4 overflow-hidden">
                              {serverA.author_url ? <ClientImage src={serverA.author_url} alt={serverA.author} className="w-full h-full object-cover" /> : <Database className="w-8 h-8 text-emerald-500/30" />}
                           </div>
                           <h2 className="text-2xl font-black text-white">{serverA.name}</h2>
                           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">@{serverA.author}</p>
                         </div>
                       ) : <span className="text-zinc-800 font-black italic">No Challenger A</span>}
                    </th>
                    <th className="p-10 text-center">
                       {serverB ? (
                         <div className="space-y-2">
                           <div className="w-16 h-16 rounded-full border border-zinc-800 bg-[#111] flex items-center justify-center mx-auto mb-4 overflow-hidden">
                              {serverB.author_url ? <ClientImage src={serverB.author_url} alt={serverB.author} className="w-full h-full object-cover" /> : <Database className="w-8 h-8 text-emerald-500/30" />}
                           </div>
                           <h2 className="text-2xl font-black text-white">{serverB.name}</h2>
                           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">@{serverB.author}</p>
                         </div>
                       ) : <span className="text-zinc-800 font-black italic">No Challenger B</span>}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                   {[
                     { label: "Trust Score", key: "trust_score", type: "score" },
                     { label: "Description", key: "description", type: "text" },
                     { label: "Community stars", key: "stars", type: "number" },
                     { label: "Verification", key: "is_verified", type: "badge" },
                     { label: "Stability Index", key: "language", type: "lang" }
                   ].map((row) => (
                     <tr key={row.key} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="p-10 font-black text-[10px] uppercase tracking-widest text-zinc-500">{row.label}</td>
                        <td className="p-10 text-center font-bold">
                           {serverA ? renderTableCell(row, serverA) : '-'}
                        </td>
                        <td className="p-10 text-center font-bold">
                           {serverB ? renderTableCell(row, serverB) : '-'}
                        </td>
                     </tr>
                   ))}
                   <tr>
                     <td className="p-10" />
                     <td className="p-10 text-center">
                        {serverA && (
                          <Link href={`/servers/${serverA.slug}`} className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#444] hover:bg-white hover:text-black transition-all">
                             Deep Link
                          </Link>
                        )}
                     </td>
                     <td className="p-10 text-center">
                        {serverB && (
                          <Link href={`/servers/${serverB.slug}`} className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#444] hover:bg-white hover:text-black transition-all">
                             Deep Link
                          </Link>
                        )}
                     </td>
                   </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-12">
            <div className="flex items-center gap-10 opacity-20">
               <div className="w-40 h-56 border-2 border-dashed border-zinc-700 rounded-[3rem] rotate-[-5deg]" />
               <div className="w-40 h-56 border-2 border-dashed border-zinc-700 rounded-[3rem] rotate-[5deg]" />
            </div>
            <div className="space-y-4">
              <p className="text-xl font-black tracking-tighter text-white uppercase italic">Awaiting Parameters</p>
              <p className="text-zinc-600 font-medium max-w-xs mx-auto">Select two nodes from the global index to begin the recursive audit comparison.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderTableCell(row: any, server: any) {
    const effectiveScore = (server.trust_score && server.trust_score > 0.1) 
      ? server.trust_score 
      : calculateHeuristicAnalysis({
          name: server.name,
          stars: server.stars || 0,
          github_updated_at: server.updated_at || new Date().toISOString(),
          author: server.author || 'unknown',
          is_verified: server.is_verified || false
        }).score;

    if (row.type === 'score') {
      return <span className={`text-5xl font-black ${getRiskColor(effectiveScore)} animate-in fade-in duration-1000`}>{effectiveScore.toFixed(1)}</span>;
    }
    if (row.type === 'text') {
      return <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xs mx-auto opacity-70 italic">"{server.description}"</p>;
    }
    if (row.type === 'number') {
      return <span className="text-xl font-black text-white">⭐ {server.stars?.toLocaleString() || 0}</span>;
    }
    if (row.type === 'badge') {
      return server.is_verified ? (
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <ShieldCheck className="w-3 h-3 text-emerald-500" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
        </div>
      ) : <span className="text-zinc-800 text-[10px] uppercase font-black tracking-[0.2em]">Community</span>;
    }
    if (row.type === 'lang') {
      return <span className="text-zinc-600 text-xs font-black uppercase tracking-tighter">{server.language || 'Protocol-v1'}</span>;
    }
    return null;
  }
}
