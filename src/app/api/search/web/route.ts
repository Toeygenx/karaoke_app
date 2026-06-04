import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }
    
    const html = await response.text();
    const results = [];
    
    // Scrape DDG HTML structure
    const regex = /<a class="result__url" href="([^"]+)">([^<]+)<\/a>/g;
    let match;
    let count = 0;
    
    while ((match = regex.exec(html)) !== null && count < 10) {
      let rawUrl = match[1];
      if (rawUrl.startsWith('//')) {
         rawUrl = 'https:' + rawUrl;
      } else if (rawUrl.startsWith('/l/?uddg=')) {
         rawUrl = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
      } else if (rawUrl.startsWith('/')) {
         rawUrl = 'https://duckduckgo.com' + rawUrl;
      }
      
      results.push({
        url: rawUrl,
        title: match[2].trim()
      });
      count++;
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Web search error:", error);
    return NextResponse.json({ error: "Failed to search web" }, { status: 500 });
  }
}
