import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  author: string;
}

interface KaraokeState {
  currentSong: Song | null;
  queue: Song[];
  searchMode: 'youtube' | 'lyrics_fallback';
  currentTime: number;
  
  // Actions
  playSong: (song: Song) => void;
  addSongToQueue: (song: Song) => void;
  removeSongFromQueue: (id: string) => void;
  reorderQueue: (newQueue: Song[]) => void;
  playNext: () => void;
  setSearchMode: (mode: 'youtube' | 'lyrics_fallback') => void;
  setCurrentTime: (time: number) => void;
}

export const useKaraokeStore = create<KaraokeState>((set) => ({
  currentSong: null,
  queue: [],
  searchMode: 'youtube',
  currentTime: 0,
  
  playSong: (song) => set((state) => ({ 
    currentSong: song,
    searchMode: 'youtube', // reset search mode when a new song plays
    currentTime: 0
  })),
  
  addSongToQueue: (song) => set((state) => ({ 
    queue: [...state.queue, song] 
  })),
  
  removeSongFromQueue: (id) => set((state) => ({ 
    queue: state.queue.filter(s => s.id !== id) 
  })),
  
  reorderQueue: (newQueue) => set({ queue: newQueue }),
  
  playNext: () => set((state) => {
    if (state.queue.length === 0) return { currentSong: null };
    const nextSong = state.queue[0];
    return {
      currentSong: nextSong,
      queue: state.queue.slice(1),
      searchMode: 'youtube'
    };
  }),
  
  setSearchMode: (mode) => set({ searchMode: mode }),
  setCurrentTime: (time) => set({ currentTime: time })
}));
