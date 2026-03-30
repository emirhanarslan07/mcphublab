import { createServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Lock, Activity, ArrowRight } from 'lucide-react';

export default async function SecurityPage() {
  const supabase = createServerClient();

  const { data: verifiedServers } = await supabase
    .from('mcp_servers')
    .select('id, slug, name, category, trust_score, is_verified, risk_level')
    .gte('trust_score', 7.5)
    .order('trust_score', { ascending: false })
    .limit(50);

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
       <div className="flex flex-col items-center text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-10 duration-1000">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/20 mb-4 tracking-tighter uppercase">
          <ShieldCheck className="w-3 h-3 mr-1.5" />
          Elite Security Standard
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          Verified <span className="text-emerald-500">Security</span> Deep Dive
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          The following servers have passed our automated security audits with a 'Low Risk' rating or better. Each server's source code was scanned for common vulnerabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Process */}
        <div className="lg:col-span-1 space-y-6">
           <div className="sticky top-24 p-8 border rounded-3xl bg-secondary/20 space-y-8 backdrop-blur-md">
              <h2 className="text-xl font-bold border-b pb-4">Our Methodology</h2>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Crawl & Audit</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">We sync with GitHub to audit the raw source code of every server index on MCPHub.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">AI Attack Vector Analysis</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Claude 4.5 Sonnet simulates potential attack vectors like prompt injections and data leaks.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">Manual Vetting</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Highly utilized servers often receive human review once they pass AI automated gatekeeping.</p>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/enterprise" className="block text-center p-3 text-xs font-bold bg-foreground text-background rounded-full hover:opacity-90 transition-opacity">
                  Enterprise Security Inquiry
                </Link>
              </div>
           </div>
        </div>

        {/* Server List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6">
             Top Verified Servers
          </h2>
          {verifiedServers?.map((server) => (
            <Link 
              key={server.id} 
              href={`/servers/${server.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 border rounded-2xl bg-card hover:border-emerald-500/30 transition-all hover:bg-emerald-500/[0.02] shadow-sm animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">{server.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{server.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 self-end sm:self-auto">
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Trust Score</p>
                  <p className="text-xl font-black text-emerald-500">{server.trust_score.toFixed(1)}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            </Link>
          ))}
          {(!verifiedServers || verifiedServers.length === 0) && (
            <p className="text-center py-20 text-muted-foreground opacity-50 italic">
               No servers have reached the verify threshold yet. Check back soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
