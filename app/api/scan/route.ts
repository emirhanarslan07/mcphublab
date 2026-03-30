import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeServerWithClaude } from "@/lib/scanner";

export async function POST(req: Request) {
  try {
    const { server_id } = await req.json();

    if (!server_id) {
      return NextResponse.json({ success: false, error: "server_id is required" }, { status: 400 });
    }

    // 1. Fetch server from DB
    const { data: server, error: dbError } = await supabase
      .from("mcp_servers")
      .select("*")
      .eq("id", server_id)
      .single();

    if (dbError || !server) {
      return NextResponse.json({ success: false, error: "Server not found" }, { status: 404 });
    }

    // 2. We'd fetch GitHub files here
    const mockSourceCode = "import fs from 'fs';\n// some filesystem code...";

    // 3. Analyze with Claude
    const analysis = await analyzeServerWithClaude(mockSourceCode);

    // 4. Save results
    await supabase.from("security_reports").insert({
      server_id,
      vulnerability_scan_result: analysis,
      overall_score: analysis.overall_score,
      risk_level: analysis.overall_score >= 7.5 ? "low" : "high",
    });

    // 5. Update trust score
    await supabase
      .from("mcp_servers")
      .update({ trust_score: analysis.overall_score })
      .eq("id", server_id);

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
