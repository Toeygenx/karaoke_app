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
  currentTime: number;
  seekToTime: number | null;
  searchMode: 'youtube' | 'fallback';
  
  // Actions
  playSong: (song: Song) => void;
  addSongToQueue: (song: Song) => void;
  removeSongFromQueue: (id: string) => void;
  reorderQueue: (newQueue: Song[]) => void;
  playNext: () => void;
  setCurrentTime: (time: number) => void;
  setSeekToTime: (time: number | null) => void;
  setSearchMode: (mode: 'youtube' | 'fallback') => void;
}

export const useKaraokeStore = create<KaraokeState>((set) => ({
  currentSong: null,
  queue: [],
  currentTime: 0,
  seekToTime: null,
  searchMode: 'youtube',
  
  playSong: (song) => set((state) => ({ 
    currentSong: song,
    currentTime: 0,
    seekToTime: null
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
      queue: state.queue.slice(1)
    };
  }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  setSeekToTime: (time) => set({ seekToTime: time }),
  setSearchMode: (mode) => set({ searchMode: mode })
}));
