"use client";

import { useState } from "react";
import { Search, ChevronLeft, ExternalLink, Globe, Music } from "lucide-react";
import { useKaraokeStore } from "@/store/useKaraokeStore";

export default function FallbackSearch() {
  const { currentSong, setSearchMode } = useKaraokeStore();
  
  const defaultQuery = currentSong?.title 
    ? currentSong.title.replace(/karaoke|instrumental|cover|official|music|video/gi, '').trim()
    : "";
    
  const [query, setQuery] = useState(defaultQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const providers = [
    {
      name: "Google Search",
      url: `https://www.google.com/search?q=${encodeURIComponent(query + " lyrics เนื้อเพลง")}`,
      icon: <Globe className="text-blue-400" size={24} />,
      desc: "ค้นหาเนื้อเพลงจากทั่วโลก"
    },
    {
      name: "Siamzone (เพลงไทย)",
      url: `https://www.siamzone.com/music/thailyric/search.php?q=${encodeURIComponent(query)}`,
      icon: <Music className="text-pink-400" size={24} />,
      desc: "แหล่งรวมเนื้อเพลงไทยยอดฮิต"
    },
    {
      name: "Genius",
      url: `https://genius.com/search?q=${encodeURIComponent(query)}`,
      icon: <span className="font-bold text-yellow-400 text-xl">G</span>,
      desc: "คลังเนื้อเพลงสากลขนาดใหญ่"
    },
    {
      name: "AZLyrics",
      url: `https://search.azlyrics.com/search.php?q=${encodeURIComponent(query)}`,
      icon: <span className="font-bold text-blue-300 text-xl">AZ</span>,
      desc: "อัปเดตเนื้อเพลงใหม่ล่าสุดทุกวัน"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-surface/30 rounded-xl border border-surface-border overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-surface-border flex items-center justify-between bg-surface shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <button 
              onClick={() => setSearchMode('youtube')}
              className="mr-2 p-1 hover:bg-surface-hover rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <ChevronLeft size={24} />
            </button>
            External Lyrics Search
          </h2>
          <p className="text-sm text-gray-400 mt-1 ml-10">เลือกระบบค้นหาเนื้อเพลงที่คุณต้องการ</p>
        </div>
      </div>

      <div className="p-6 flex flex-col h-full overflow-hidden">
        <form onSubmit={handleSearch} className="flex gap-3 mb-6 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Artist - Song Title"
              className="w-full bg-background border border-surface-border rounded-xl pl-12 pr-5 py-4 focus:outline-none focus:border-primary transition-all text-lg text-white shadow-inner"
            />
          </div>
        </form>

        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar rounded-xl">
          {query.trim() ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((provider, idx) => (
                <a 
                  key={idx}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col bg-background/80 p-6 rounded-xl border border-surface-border hover:border-primary hover:bg-surface transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-border flex items-center justify-center group-hover:scale-110 transition-transform">
                        {provider.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{provider.name}</h3>
                    </div>
                    <ExternalLink size={20} className="text-gray-500 group-hover:text-primary" />
                  </div>
                  <p className="text-sm text-gray-400">{provider.desc}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-lg">พิมพ์ชื่อเพลงเพื่อแสดงลิงก์ค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
