"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Play, X } from "lucide-react";
import { useKaraokeStore, Song } from "@/store/useKaraokeStore";

export default function YoutubeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { playSong, addSongToQueue } = useKaraokeStore();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setResults([]);
    }
  }, [query]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setIsOpen(true);
    try {
      const res = await axios.get(`/api/search/youtube?q=${encodeURIComponent(query)}`);
      setResults(res.data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-search when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() && query.length > 2) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto z-50 mt-2">
      <form onSubmit={handleSearch} className="relative flex items-center shadow-2xl">
        <Search className="absolute left-6 text-gray-400" size={24} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for karaoke tracks..."
          className="w-full bg-surface border-2 border-surface-border rounded-full pl-16 pr-16 py-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-xl text-white shadow-xl"
        />
        {query && (
          <button 
            type="button"
            onClick={clearSearch}
            className="absolute right-4 p-2 text-gray-400 hover:text-white bg-surface-border hover:bg-gray-600 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </form>

      {isOpen && (
        <div className="absolute top-[110%] left-0 right-0 bg-surface border border-surface-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
          {loading && results.length === 0 ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto hide-scrollbar p-2">
              {results.map((song) => (
                <div key={song.id} className="flex items-center gap-4 p-3 hover:bg-surface-hover rounded-xl transition-colors group">
                  <img src={song.thumbnail} alt={song.title} className="w-24 h-16 object-cover rounded-lg shadow-md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate text-white">{song.title}</p>
                    <p className="text-sm text-gray-400 truncate mt-1">{song.author} • {song.duration}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        playSong(song);
                        setIsOpen(false);
                        setQuery("");
                      }}
                      className="p-3 bg-primary text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-primary/30"
                      title="Play Now"
                    >
                      <Play size={20} />
                    </button>
                    <button 
                      onClick={() => {
                        addSongToQueue(song);
                        setIsOpen(false);
                        setQuery("");
                      }}
                      className="p-3 bg-surface-border text-white rounded-full hover:bg-gray-600 transition-colors"
                      title="Add to Queue"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : query.length > 2 && !loading ? (
            <div className="p-8 text-center text-gray-400">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
