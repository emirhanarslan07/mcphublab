import { Building, Shield, Settings, Key, Zap, CheckCircle2 } from "lucide-react";
import { LeadCaptureForm } from "@/components/lead-capture-form";

export default function EnterprisePage() {
  return (
    <div className="container py-20 px-4 md:px-8 max-w-screen-xl mx-auto min-h-screen text-center flex flex-col items-center">
      <Badge />
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-6 mb-6">MCPHub for Enterprise</h1>
      <p className="max-w-2xl text-xl text-muted-foreground mb-10">
        Secure your company's AI infrastructure with whitelist management, audit logs, and SSO integration.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left w-full mb-12">
        <div className="p-6 border rounded-xl bg-card">
          <Shield className="h-8 w-8 text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Whitelist Dashboard</h3>
          <p className="text-muted-foreground">Approve which MCP servers developers in your organization can use.</p>
        </div>
        <div className="p-6 border rounded-xl bg-card">
          <Settings className="h-8 w-8 text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Detailed Audit Logs</h3>
          <p className="text-muted-foreground">Track which agents use which servers, when, and with what data.</p>
        </div>
        <div className="p-6 border rounded-xl bg-card">
          <Key className="h-8 w-8 text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">SSO Integration</h3>
          <p className="text-muted-foreground">Seamlessly log in with Okta, Azure AD, or Google Workspace.</p>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto space-y-12">
        <div className="bg-[#090909] border border-zinc-900 rounded-[2.5rem] p-10 md:p-16 space-y-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Building className="w-40 h-40" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Enterprise <br /> <span className="text-emerald-500 italic">Early Access</span></h2>
            <p className="text-zinc-500 font-medium text-sm leading-relaxed max-w-sm">Join our network for enhanced control and enterprise-grade security features.</p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              "Unlimited server scans",
              "Private GitHub repo analysis",
              "Priority support",
              "Custom audit log exporting",
              "Okta & Azure AD SSO",
              "Unlimited team seats"
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>

          <div className="pt-6">
            <LeadCaptureForm />
          </div>
        </div>

        <p className="text-[10px] font-black tracking-[0.4em] text-[#222] uppercase">Secure by Protocol — Built for Scale</p>
      </div>
    </div>
  );
}

function Badge() {
  return (
    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
      <Building className="mr-1 h-3 w-3" /> B2B Solution
    </div>
  );
}
