import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    // Popcat provides a free lyrics API without authentication
    const response = await fetch(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch fallback lyrics");
    }
    
    const data = await response.json();
    
    if (data.lyrics) {
      return NextResponse.json({
        found: true,
        title: data.title,
        artist: data.artist,
        lyrics: data.lyrics,
      });
    }

    return NextResponse.json({ found: false, error: "Fallback lyrics not found" }, { status: 404 });
  } catch (error) {
    console.error("Fallback lyrics error:", error);
    return NextResponse.json({ error: "Failed to search fallback lyrics" }, { status: 500 });
  }
}
