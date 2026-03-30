-- Add the structured_overview column to store mcp.so style detail sections
ALTER TABLE public.mcp_servers ADD COLUMN IF NOT EXISTS structured_overview JSONB DEFAULT '{
  \"what_is\": \"\",
  \"how_to_use\": \"\",
  \"key_features\": [],
  \"use_cases\": [],
  \"faq\": []
}'::jsonb;
