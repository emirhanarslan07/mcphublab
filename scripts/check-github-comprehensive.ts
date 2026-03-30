require('dotenv').config({ path: '.env.local' });

async function checkGitHubComprehensive() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  // This query covers most MCP servers
  const queries = [
    'topic:mcp-server stars:>20',
    '"mcp server" stars:>20',
    'mcp-server stars:>20',
    'mcp-connector stars:>20'
  ];
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  let allRepoIds = new Set();

  for (const query of queries) {
    let page = 1;
    // We only need to know how many, but let's fetch first page to get total_count
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=100&page=${page}`;
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      if (data.items) {
          data.items.forEach(item => allRepoIds.add(item.id));
      }
      console.log(`Query: [${query}] -> Total Found: ${data.total_count}`);
    } catch (error) {
      console.error(`Error fetching for query [${query}]:`, error);
    }
  }
  
  console.log(`Estimated unique repositories with >20 stars across these queries: ${allRepoIds.size} (Note: limited to first 100 per query for this check)`);
}

checkGitHubComprehensive();
