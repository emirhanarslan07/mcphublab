"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  serverId: string;
  isScanned: boolean;
}

export function AnalysisTrigger({ serverId, isScanned }: Props) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!isScanned && !isAnalyzing) {
      const triggerAnalysis = async () => {
        setIsAnalyzing(true);
        console.log(`[MCPHub] Triggering background analysis for server: ${serverId}`);
        
        try {
          const res = await fetch(`/api/servers/${serverId}/analyze`, {
            method: 'POST'
          });
          
          if (res.ok) {
            console.log(`[MCPHub] Analysis complete for ${serverId}. Refreshing...`);
            // The API calls revalidatePath, so router.refresh() will show new data
            router.refresh();
          }
        } catch (e) {
          console.error("Background analysis failed:", e);
        } finally {
          setIsAnalyzing(false);
        }
      };

      triggerAnalysis();
    }
  }, [isScanned, serverId, isAnalyzing, router]);

  return null; // Silent background trigger
}
