'use client';

import { Search, Loader2, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';

export function SearchInput({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  // Debounce search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== defaultValue) {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set('q', value);
          params.delete('page'); // Reset to page 1 on search
        } else {
          params.delete('q');
        }
        
        startTransition(() => {
          router.push(`/servers?${params.toString()}`);
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, defaultValue, router, searchParams]);

  return (
    <div className="relative group/search max-w-6xl mx-auto shadow-2xl">
      <div className="absolute inset-0 bg-emerald-500/5 blur-3xl opacity-0 group-focus-within/search:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10 pointer-events-none">
        {isPending ? (
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-zinc-600 group-focus-within/search:text-emerald-400 transition-colors" />
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type to search registry index..."
        className="w-full pl-20 pr-16 py-8 bg-[#0a0a0a] border border-zinc-900 rounded-[2rem] text-lg font-bold focus:outline-none focus:border-emerald-500/30 transition-all text-white placeholder:text-zinc-800 relative z-1"
      />

      {value && (
        <button 
          onClick={() => setValue('')}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-800 rounded-full transition-colors z-10 text-zinc-600 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
