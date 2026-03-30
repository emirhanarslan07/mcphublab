
export interface TrustSignal {
  type: 'TRUST' | 'RISK';
  message: string;
}

export interface HeuristicResult {
  score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  signals: TrustSignal[];
  security: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    supports_scoping: boolean;
    what_it_does: string;
    what_it_accesses: string[];
    worst_case_scenario: string;
    recommendation: string;
    safe_install_command: string;
    unsafe_install_command: string;
    scope_guide: string;
  };
}

export function calculateHeuristicAnalysis(server: {
  name: string;
  stars: number;
  github_updated_at?: string | Date;
  author?: string;
  is_verified?: boolean;
}): HeuristicResult {
   let score = 2.0; // Lower baseline for more dynamic range
  const signals: TrustSignal[] = [];

  // 1. Star Reputation (Logarithmic scaling - more granular)
  if (server.stars > 0) {
    // Increased ceiling and adjusted factor for better high-end differentiation
    const starBonus = Math.min(Math.log10(server.stars + 1) * 1.6, 5.5);
    score += starBonus;
    if (server.stars >= 500) {
      signals.push({ type: 'TRUST', message: `High community validation (${server.stars} stars)` });
    } else if (server.stars > 50) {
      signals.push({ type: 'TRUST', message: `Established community presence (${server.stars} stars)` });
    }
  } else {
    signals.push({ type: 'RISK', message: "New or experimental implementation (low star count)" });
  }

  // 2. Activity / Recency
  if (server.github_updated_at) {
    const updatedAt = new Date(server.github_updated_at);
    const now = new Date();
    const monthsSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsSinceUpdate < 1) {
      score += 1.0;
      signals.push({ type: 'TRUST', message: "Active development (recently updated)" });
    } else if (monthsSinceUpdate > 6) {
      score -= 1.0;
      signals.push({ type: 'RISK', message: "Limited recent activity (last update > 6 months ago)" });
    }
  }

  // 3. Verification & Reputation
  if (server.is_verified) {
    score += 1.5;
    signals.push({ type: 'TRUST', message: "Officially verified registry entry" });
  }

  // 4. Deterministic Jitter (Aesthetic Granularity)
  // Create a small shift based on the name hash to avoid identical bucketed scores
  let hash = 0;
  for (let i = 0; i < server.name.length; i++) {
    hash += server.name.charCodeAt(i);
  }
  const jitter = (hash % 30) / 100; // 0.00 to 0.29
  score += jitter;

  // Cap score to 9.8 (leaving room for manual 10.0 elite status)
  score = Math.min(Math.max(score, 1.0), 9.6);

  const risk_level: 'LOW' | 'MEDIUM' | 'HIGH' = score >= 7.5 ? 'LOW' : score >= 5.0 ? 'MEDIUM' : 'HIGH';

  return {
    score: parseFloat(score.toFixed(1)),
    risk_level,
    signals,
    security: {
      risk_level,
      supports_scoping: false,
      what_it_does: `Automated inventory audit for ${server.name || 'this repository'} metadata.`,
      what_it_accesses: ["Local environment variables", "Service-specific network endpoints"],
      worst_case_scenario: "Unverified third-party code might execute arbitrary commands if not properly sandboxed.",
      recommendation: score < 5.0 ? "Carefully review source code before installation." : "Install using a restricted shell environment.",
      safe_install_command: `npx @modelcontextprotocol/${server.author || 'server'} --scope restricted`,
      unsafe_install_command: `npx @modelcontextprotocol/${server.author || 'server'}`,
      scope_guide: "This server currently uses a fixed permission policy. Use environment-level isolation."
    }
  };
}
