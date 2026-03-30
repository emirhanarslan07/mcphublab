const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fixUrls() {
  console.log('🔧 Fixing GitHub URLs...\n');

  const { data: servers, error: fetchError } = await supabase
    .from('mcp_servers')
    .select('id, name, slug, github_url, author');

  if (fetchError || !servers) {
    console.error('Error fetching servers:', fetchError || 'No servers found');
    return;
  }

  console.log(`Found ${servers.length} servers to check.\n`);

  let fixed = 0;
  let broken = 0;
  let skipped = 0;

  for (const server of servers) {
    if (!server.github_url) {
      skipped++;
      continue;
    }

    // Clean URL: Remove tree/main parts to test repo existence
    let cleanUrl = server.github_url
      .replace(/\/tree\/[^\/]+.*$/, '')
      .replace(/\/blob\/[^\/]+.*$/, '')
      .replace(/\/raw\/[^\/]+.*$/, '')
      .replace(/\/issues.*$/, '')
      .replace(/\/pulls.*$/, '')
      .replace(/\/actions.*$/, '')
      .replace(/\/$/, '');

    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

    if (!match) {
      console.log(`  ⚠️  ${server.name}: Invalid URL format (${server.github_url})`);
      skipped++;
      continue;
    }

    const [fullMatch, owner, repo] = match;

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.status === 404) {
        console.log(`  ❌ ${server.name}: Repo not found (${owner}/${repo})`);

        // Search for an alternative
        const searchQuery = encodeURIComponent(`${server.name} mcp server`);
        const searchResponse = await fetch(
          `https://api.github.com/search/repositories?q=${searchQuery}&per_page=1`,
          {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.items && searchData.items.length > 0) {
            const foundRepo = searchData.items[0];
            const newUrl = foundRepo.html_url;

            await supabase
              .from('mcp_servers')
              .update({
                github_url: newUrl,
                author: foundRepo.owner.login,
                author_url: foundRepo.owner.avatar_url,
                stars: foundRepo.stargazers_count,
                description: foundRepo.description || server.description,
              })
              .eq('id', server.id);

            console.log(`  ✅ ${server.name}: Fixed → ${newUrl} (⭐ ${foundRepo.stargazers_count})`);
            fixed++;
          } else {
            // No replacement found, clear the URL to avoid 404s
            await supabase
              .from('mcp_servers')
              .update({ github_url: null })
              .eq('id', server.id);

            console.log(`  🗑️  ${server.name}: No alternative found, URL cleared`);
            broken++;
          }
        }
      } else if (response.ok) {
        const repoData = await response.json();
        const actualRepoUrl = repoData.html_url;
        
        // If it's a monorepo link in the DB, we want to KEEP the path if the monorepo exists
        // But if the URL in DB was JUST the base repo and GitHub redirected (e.g. rename), update it.
        // Actually, for official ones like 'servers', we probably want to keep the tree path if it exists.
        
        // For now, let's just update the stars and meta if base is OK.
        await supabase
          .from('mcp_servers')
          .update({
            stars: repoData.stargazers_count,
            author_url: repoData.owner.avatar_url,
            last_commit_date: repoData.pushed_at,
          })
          .eq('id', server.id);
          
        console.log(`  ✓  ${server.name}: OK (⭐ ${repoData.stargazers_count})`);
        skipped++;
      }
    } catch (error) {
      console.log(`  ⚠️  ${server.name}: Network error - ${error.message}`);
      skipped++;
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Fix Summary:`);
  console.log(`  Fixed: ${fixed}`);
  console.log(`  Broken (cleared): ${broken}`);
  console.log(`  Skipped/OK: ${skipped}`);
  console.log(`\n✅ Done.`);
}

fixUrls().catch(console.error);
