import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ARCHIVED_SLUGS = [
  'github', 'sqlite', 'slack', 'brave-search', 'google-maps', 
  'sentry', 'gitlab', 'postgres', 'linear', 'notion', 
  'aws-s3', 'evernote', 'stripe', 'redis', 'gdrive', 'jira', 'docker', 'puppeteer'
];

const CORE_SLUGS = [
  'filesystem', 'fetch', 'git', 'memory', 'sequentialthinking', 'time', 'everything'
];

function getOfficialUrl(slug: string) {
  if (ARCHIVED_SLUGS.includes(slug)) {
    return `https://github.com/modelcontextprotocol/servers-archived/tree/main/src/${slug}`;
  }
  if (CORE_SLUGS.includes(slug)) {
    return `https://github.com/modelcontextprotocol/servers/tree/main/src/${slug}`;
  }
  return `https://github.com/modelcontextprotocol/servers/tree/main/src/${slug}`; // Default fallback
}

const servers = [
  {
    name: 'filesystem',
    slug: 'filesystem',
    github_url: getOfficialUrl('filesystem'),
    description: 'MCP server for secure filesystem operations',
    long_description: 'The Filesystem MCP server allows AI agents to read, write, and manipulate files within a constrained directory structure...',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 5200,
    category: 'file-management',
    tags: ['filesystem', 'file-operations', 'read-write', 'local'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-filesystem',
    is_verified: true,
    trust_score: 9.5
  },
  {
    name: 'github',
    slug: 'github',
    github_url: getOfficialUrl('github'),
    description: 'MCP server for GitHub API integration',
    long_description: 'Provides comprehensive GitHub API access for AI agents. Supports repository management, issue tracking...',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 7500,
    category: 'development',
    tags: ['github', 'git', 'version-control', 'devops'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-github',
    is_verified: true,
    trust_score: 9.8
  },
  {
    name: 'slack',
    slug: 'slack',
    github_url: getOfficialUrl('slack'),
    description: 'MCP server for Slack messaging and workspace management',
    long_description: 'Enables AI agents to interact with Slack workspaces...',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 3200,
    category: 'communication',
    tags: ['slack', 'messaging', 'team', 'collaboration'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-slack',
    is_verified: true,
    trust_score: 9.3
  },
  {
    name: 'postgres',
    slug: 'postgres',
    github_url: getOfficialUrl('postgres'),
    description: 'MCP server for PostgreSQL database operations',
    long_description: 'Provides secure PostgreSQL database access for AI agents...',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 5500,
    category: 'database',
    tags: ['postgresql', 'database', 'sql', 'data'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-postgres',
    is_verified: true,
    trust_score: 9.4
  },
  {
    name: 'sqlite',
    slug: 'sqlite',
    github_url: getOfficialUrl('sqlite'),
    description: 'MCP server for SQLite database operations',
    long_description: 'Lightweight SQLite database server for AI agents...',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 4800,
    category: 'database',
    tags: ['sqlite', 'database', 'local', 'lightweight'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-sqlite',
    is_verified: true,
    trust_score: 9.6
  },
  {
    name: 'google-drive',
    slug: 'google-drive',
    github_url: getOfficialUrl('google-drive'),
    description: 'MCP server for Google Drive file management',
    long_description: 'Enables AI agents to interact with Google Drive. Supports listing files, reading documents, creating new files, sharing permissions, and searching across drive contents...',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 1200,
    category: 'productivity',
    tags: ['google-drive', 'cloud-storage', 'files'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-google-drive',
    is_verified: true,
    trust_score: 9.1
  },
  {
    name: 'brave-search',
    slug: 'brave-search',
    github_url: getOfficialUrl('brave-search'),
    description: 'MCP server for web searching using Brave Search API',
    long_description: 'Search the web using Brave Search API...',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 6100,
    category: 'search',
    tags: ['search', 'web', 'brave'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-brave-search',
    is_verified: true,
    trust_score: 9.8
  },
  {
    name: 'stripe',
    slug: 'stripe',
    github_url: 'https://github.com/stripe/mcp-server-stripe',
    description: 'Stripe payments and subscription MCP server',
    long_description: 'Official Stripe integration for AI agents. Enables billing management, subscription handling, and payment processing directly through the Model Context Protocol.',
    author: 'stripe',
    author_url: 'https://avatars.githubusercontent.com/u/3024231',
    stars: 3500,
    category: 'finance',
    tags: ['stripe', 'finance', 'payments'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-stripe',
    is_verified: true,
    trust_score: 9.8
  },
  {
    name: 'google-maps',
    slug: 'google-maps',
    github_url: getOfficialUrl('google-maps'),
    description: 'MCP server for Google Maps and geolocation',
    long_description: 'Enables AI agents to use Google Maps services. Supports geocoding, reverse geocoding, directions, distance matrix, place search, and place details.',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 1500,
    category: 'maps',
    tags: ['maps', 'geolocation', 'directions', 'places'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-google-maps',
    is_verified: true,
    trust_score: 9.0
  },
  {
    name: 'evernote',
    slug: 'evernote',
    github_url: 'https://github.com/danny-avila/evernote-mcp-server',
    description: 'MCP server for Evernote note management',
    long_description: 'Provides Evernote integration for AI agents. Supports creating notes, searching notebooks, organizing tags, and exporting note content.',
    author: 'danny-avila',
    author_url: 'https://avatars.githubusercontent.com/u/110412045',
    stars: 800,
    category: 'productivity',
    tags: ['evernote', 'notes', 'productivity'],
    language: 'typescript',
    install_command: 'npx evernote-mcp-server',
    is_verified: true,
    trust_score: 8.5
  },
  {
    name: 'k8s',
    slug: 'k8s',
    github_url: 'https://github.com/Flux159/mcp-server-kubernetes',
    description: 'MCP server for Kubernetes cluster management',
    long_description: 'Provides Kubernetes cluster management for AI agents. Supports pod management, deployment operations, service configuration, namespace management, and log streaming.',
    author: 'Flux159',
    author_url: 'https://avatars.githubusercontent.com/u/20322416',
    stars: 206,
    category: 'devops',
    tags: ['kubernetes', 'k8s', 'containers', 'orchestration'],
    language: 'typescript',
    install_command: 'npx mcp-server-kubernetes',
    is_verified: false,
    trust_score: 0
  },
  {
    name: 'time',
    slug: 'time',
    github_url: getOfficialUrl('time'),
    description: 'MCP server for time and timezone operations',
    long_description: 'Provides time-related utilities for AI agents. Supports timezone conversion, current time retrieval, date formatting, and time difference calculations.',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 64,
    category: 'utilities',
    tags: ['time', 'timezone', 'date', 'conversion'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-time',
    is_verified: true,
    trust_score: 9.9
  },
  {
    name: 'memory',
    slug: 'memory',
    github_url: getOfficialUrl('memory'),
    description: 'MCP server for persistent knowledge graph memory',
    long_description: 'Provides persistent memory capabilities for AI agents using a knowledge graph. Supports creating entities, defining relationships, storing observations, and querying the knowledge graph.',
    author: 'modelcontextprotocol',
    author_url: 'https://avatars.githubusercontent.com/u/182950562',
    stars: 3400,
    category: 'ai-ml',
    tags: ['memory', 'knowledge-graph', 'context', 'persistence'],
    language: 'typescript',
    install_command: 'npx @modelcontextprotocol/server-memory',
    is_verified: true,
    trust_score: 9.7
  }
];

async function seed() {
  console.log('🌱 Starting seed...');
  for (const server of servers) {
    const { error } = await supabase
      .from('mcp_servers')
      .upsert(server, { onConflict: 'slug' });
    if (error) console.log(`  ❌ ${server.name}: ${error.message}`);
    else console.log(`  ✅ ${server.name} (⭐ ${server.stars})`);
  }
  console.log('✅ Seed completed.');
}

seed();
