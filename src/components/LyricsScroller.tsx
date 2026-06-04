"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useKaraokeStore } from "@/store/useKaraokeStore";
import { Search, Mic2, Frown, RefreshCw } from "lucide-react";

const LRC_LINE_REGEX = /^\[(\d{2,}):(\d{2}(?:\.\d+)?)\](.*)/;
const NOISE_WORDS_REGEX = /\b(karaoke|instrumental|cover|official|music|video)\b/gi;
const CLEAN_QUERY_REGEX = /[\(\[【].*?[\)\]】]|karaoke|instrumental|cover|official|music|video|audio|mv|hd|4k|1080p|lyric|lyrics/gi;
const SMOOTH_SCROLL_DURATION_MS = 1500;

interface LyricsData {
  found: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
  error?: string;
}

interface ParsedLine {
  time: number;
  text: string;
}

export default function LyricsScroller() {
  const { currentSong, currentTime, setSeekToTime } = useKaraokeStore();
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (!currentSong) {
      setLyrics(null);
      setParsedLines([]);
      return;
    }

    const fetchLyrics = async () => {
      setLoading(true);
      try {
        const query = currentSong.title.replace(NOISE_WORDS_REGEX, '').trim();
        const res = await axios.get(`/api/lyrics/sync?q=${encodeURIComponent(query)}`);
        setLyrics(res.data);
        
        if (res.data.syncedLyrics) {
          const lines: ParsedLine[] = [];
          res.data.syncedLyrics.split('\n').forEach((line: string) => {
            const match = line.match(LRC_LINE_REGEX);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseFloat(match[2]);
              const text = match[3].trim();
              if (text) {
                lines.push({ time: minutes * 60 + seconds, text });
              }
            }
          });
          setParsedLines(lines);
        }
      } catch (error) {
        console.error("Lyrics fetch failed:", error);
        setLyrics({ found: false });
        setParsedLines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [currentSong]);

  let activeIndex = -1;
  for (let i = 0; i < parsedLines.length; i++) {
    if (currentTime >= parsedLines[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  useEffect(() => {
    if (activeLineRef.current && isAutoScroll) {
      isProgrammaticScroll.current = true;
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, SMOOTH_SCROLL_DURATION_MS);
    }
  }, [activeIndex, isAutoScroll]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (isAutoScroll) {
      setIsAutoScroll(false);
    }
  };

  const handleUserInteraction = () => {
    if (isAutoScroll) {
      setIsAutoScroll(false);
    }
  };

  if (!currentSong) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-surface/30 rounded-xl border border-surface-border animate-in fade-in duration-500">
        <Mic2 size={64} className="mb-6 opacity-30" />
        <p className="text-xl font-medium">Lyrics will appear here</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-surface/30 rounded-xl border border-surface-border p-12 animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-8">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
          <p className="text-gray-300 font-medium text-xl animate-pulse tracking-wide">Finding lyrics...</p>
        </div>
      </div>
    );
  }

  if (!lyrics?.found) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 p-8 text-center bg-surface/30 rounded-xl border border-surface-border shadow-lg animate-in fade-in duration-500">
        <Frown size={72} className="text-gray-500 opacity-50 drop-shadow-lg" />
        <div>
          <h3 className="text-2xl font-bold mb-2 text-white">Lyrics Not Found</h3>
          <p className="text-gray-400 max-w-md">We couldn't automatically find synced lyrics for this track.</p>
        </div>
        <button 
          onClick={() => {
            // Remove text inside brackets () [] 【】, and remove noise words like HD, MV, Audio
            let query = currentSong.title.replace(/[\(\[【].*?[\)\]】]/g, '');
            query = query.replace(/karaoke|instrumental|cover|official|music|video|audio|mv|hd|4k|1080p|lyric|lyrics/gi, '');
            query = query.replace(/\s+/g, ' ').trim();
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query + " lyrics เนื้อเพลง")}`, '_blank');
          }}
          className="flex items-center gap-3 bg-background border border-surface-border hover:border-primary px-8 py-4 rounded-full transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1 text-white font-bold text-lg"
        >
          <Search size={22} />
          <span>Search on Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-surface/20 rounded-xl border border-surface-border shadow-inner animate-in fade-in duration-700">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className="flex-1 overflow-y-auto pb-[50vh] pt-[40vh] px-8 sm:px-12 md:px-16 hide-scrollbar scroll-smooth"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
        }}
      >
        <div className="max-w-3xl mx-auto space-y-10">
          {parsedLines.length > 0 ? (
            parsedLines.map((line, i) => {
              const isActive = i === activeIndex;
              const isPassed = i < activeIndex;
              
              return (
                <p 
                  key={i} 
                  ref={isActive ? activeLineRef : null}
                  onClick={() => {
                    setSeekToTime(line.time);
                    setIsAutoScroll(true); // Resume auto-scrolling immediately
                  }}
                  className={`text-3xl sm:text-4xl md:text-5xl font-bold transition-all duration-500 cursor-pointer leading-tight tracking-tight origin-left
                    ${isActive 
                      ? 'text-white scale-[1.05] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] opacity-100' 
                      : isPassed 
                        ? 'text-gray-600 opacity-50 hover:text-gray-300' 
                        : 'text-gray-500 opacity-40 hover:opacity-80 hover:text-gray-300'}
                  `}
                >
                  {line.text}
                </p>
              );
            })
          ) : (
            <div className="whitespace-pre-line text-2xl sm:text-3xl font-bold text-gray-300 leading-relaxed tracking-tight">
              {lyrics.plainLyrics}
            </div>
          )}
        </div>
      </div>
      
      {/* Sync Button */}
      {parsedLines.length > 0 && !isAutoScroll && (
        <button 
          onClick={() => setIsAutoScroll(true)}
          className="absolute bottom-8 right-8 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-2 z-50 transition-all hover:scale-105 hover:-translate-y-1 font-bold animate-in fade-in slide-in-from-bottom-4"
        >
          <RefreshCw size={18} />
          <span>Sync</span>
        </button>
      )}
    </div>
  );
}
