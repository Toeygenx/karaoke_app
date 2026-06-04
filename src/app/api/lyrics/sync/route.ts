import { NextResponse } from "next/server";

interface LrcLibResponse {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string;
  syncedLyrics: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch lyrics from LRCLIB");
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      // Find the first one that has syncedLyrics, otherwise fallback to plain
      const bestMatch = data.find((item: LrcLibResponse) => item.syncedLyrics) || data[0];
      
      return NextResponse.json({
        found: true,
        trackName: bestMatch.trackName,
        artistName: bestMatch.artistName,
        plainLyrics: bestMatch.plainLyrics,
        syncedLyrics: bestMatch.syncedLyrics,
      });
    }

    return NextResponse.json({ found: false, error: "Lyrics not found" }, { status: 404 });
  } catch (error) {
    console.error("LRCLIB search error:", error);
    return NextResponse.json({ error: "Failed to search lyrics" }, { status: 500 });
  }
}
