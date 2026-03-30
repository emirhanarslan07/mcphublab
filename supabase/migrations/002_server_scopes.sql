-- Create the server_scopes table
CREATE TABLE IF NOT EXISTS public.server_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE,
  
  -- Quality & Risk
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  supports_scoping BOOLEAN DEFAULT false,
  
  -- Human-Readable Analysis (IT Manager + Individual User Friendly)
  what_it_does TEXT, -- "Bu ne yapar?"
  what_it_accesses TEXT[], -- "Neye erişebilir?" (Array of strings)
  worst_case_scenario TEXT, -- "En kötü senaryo ne?"
  recommendation TEXT, -- "Önerimiz"
  
  -- Installation Guides
  safe_install_command TEXT,
  unsafe_install_command TEXT,
  scope_guide TEXT, -- "Erişim Kısıtlama Rehberi"
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_server_scopes_server_id ON public.server_scopes(server_id);

-- Add a column to mcp_servers to cache the current risk level for list views
ALTER TABLE public.mcp_servers ADD COLUMN IF NOT EXISTS current_risk_level TEXT;
ALTER TABLE public.mcp_servers ADD COLUMN IF NOT EXISTS supports_scoping BOOLEAN DEFAULT false;
