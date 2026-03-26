# MCPHub — Agent Kuralları

## Proje
MCPHub: MCP server'ları keşfetmek, güvenliğini doğrulamak ve kurumsal düzeyde
yönetmek için npm benzeri platform.

## Stack
- Next.js 14 App Router + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Supabase (auth + PostgreSQL + realtime)
- Claude API (claude-sonnet-4-20250514) — güvenlik tarama
- GitHub REST API — server veri toplama
- Lemon Squeezy — ödeme (MoR)
- Vercel — deploy

## Supabase Schema
(Refer to the SQL blueprint provided)

## Kurallar
- HİÇBİR ZAMAN `any` kullanma
- HER component /components klasöründe
- Supabase client: /lib/supabase.ts
- Claude API calls: /lib/scanner.ts
- Mobile-first, sonra desktop
- Türkçe yorum satırı yaz
- Her API route'da error handling şart
- Rate limiting: GitHub API 5000 req/saat

## Güvenlik Tarama Kriterleri (Elite/Verified)
- GitHub stars >= 50
- Son commit <= 90 gün
- trust_score >= 7.5
- Tüm üçü true ise is_verified = true
