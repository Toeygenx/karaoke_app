import { NextResponse } from "next/server";
import ytSearch from "yt-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    // Try yt-search first (usually works locally but may get blocked on Vercel)
    const r = await ytSearch(query);
    const videos = r.videos.slice(0, 15).map((v) => ({
      id: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.timestamp,
      author: v.author.name,
    }));
    return NextResponse.json({ results: videos });
  } catch (error) {
    console.error("yt-search error, falling back to Piped API:", error);
    
    // Fallback to Piped API (Alternative YouTube frontend)
    try {
      const fallbackRes = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}`);
      if (!fallbackRes.ok) throw new Error(`Piped API failed with status: ${fallbackRes.status}`);
      
      const data = await fallbackRes.json();
      const videos = data.items
        .filter((item: any) => item.type === 'stream')
        .slice(0, 15)
        .map((v: any) => {
          // Format duration from seconds to MM:SS
          const m = Math.floor(v.duration / 60);
          const s = v.duration % 60;
          const durationStr = `${m}:${s.toString().padStart(2, '0')}`;
          
          return {
            id: v.url.replace('/watch?v=', ''),
            title: v.title,
            thumbnail: v.thumbnail,
            duration: durationStr,
            author: v.uploaderName,
          };
        });
        
      return NextResponse.json({ results: videos });
    } catch (fallbackError) {
      console.error("All search methods failed:", fallbackError);
      return NextResponse.json({ error: "Failed to search YouTube" }, { status: 500 });
    }
  }
}
