"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Search, Plus, Play, X } from "lucide-react";
import { useKaraokeStore, Song } from "@/store/useKaraokeStore";

const DEBOUNCE_DELAY_MS = 500;
const MIN_SEARCH_LENGTH = 3;

export default function YoutubeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const addSongToQueue = useKaraokeStore((state) => state.addSongToQueue);
  const playSong = useKaraokeStore((state) => state.playSong);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= MIN_SEARCH_LENGTH) {
        handleSearch();
      }
    }, DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  // --- Render Helpers (Clean Code: G30, G28) ---
  const renderLoadingState = () => (
    <div className="p-4 flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-border/20 animate-pulse">
          <div className="w-24 h-16 bg-surface-border rounded-lg"></div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 bg-surface-border rounded w-3/4"></div>
            <div className="h-3 bg-surface-border rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSearchResults = () => (
    <div className="max-h-[60vh] overflow-y-auto hide-scrollbar p-2">
      {results.map((song) => (
        <div key={song.id} className="flex items-center gap-4 p-3 hover:bg-surface-hover rounded-xl transition-all duration-200 hover:scale-[1.01] group">
          <img src={song.thumbnail} alt={song.title} className="w-24 h-16 object-cover rounded-lg shadow-md group-hover:shadow-primary/20" />
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
              className="p-3 bg-primary text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-primary/30 active:scale-95"
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
              className="p-3 bg-surface-border text-white rounded-full hover:bg-gray-600 transition-colors hover:scale-110 active:scale-95"
              title="Add to Queue"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="p-12 flex flex-col items-center justify-center text-center text-gray-400">
      <div className="w-16 h-16 rounded-full bg-surface-border flex items-center justify-center mb-4 text-gray-500">
        <Search size={32} />
      </div>
      <p className="text-xl font-semibold text-white mb-2">No tracks found</p>
      <p>We couldn't find anything for "{query}". Try another search!</p>
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoadingState();
    if (results.length > 0) return renderSearchResults();
    if (query.length >= MIN_SEARCH_LENGTH && !loading) return renderEmptyState();
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-50" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-6 text-gray-400">
          <Search size={24} />
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
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
        <div className="absolute top-[110%] left-0 right-0 bg-surface border border-surface-border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          {renderContent()}
        </div>
      )}
    </div>
  );
}
