'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function LeadCaptureForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-500">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-black text-white mb-2">Request Received</h3>
        <p className="text-zinc-500 text-sm font-medium">Thank you for your interest. We'll be in touch shortly.</p>
        <Button 
          variant="link" 
          className="mt-4 text-emerald-500 font-bold uppercase text-[10px] tracking-widest"
          onClick={() => setStatus('idle')}
        >
          Submit another email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="relative group">
        <Input 
          type="email" 
          placeholder="Email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="pl-6 pr-12 py-8 bg-[#0a0a0a] border-zinc-800 rounded-2xl text-lg font-bold focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-zinc-900"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-emerald-500/5 rounded-lg group-focus-within:bg-emerald-500/10 transition-colors">
          <Send className="w-5 h-5 text-zinc-700" />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-8 bg-emerald-500 text-black hover:bg-emerald-400 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/10 disabled:opacity-50 transition-all active:scale-[0.98]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Processing...
          </>
        ) : (
          'Send Interest for Detailed Info'
        )}
      </Button>

      {status === 'error' && (
        <p className="text-red-500 text-[10px] font-black uppercase text-center mt-4">
           Submission failed. Please try again.
        </p>
      )}

    </form>
  );
}
