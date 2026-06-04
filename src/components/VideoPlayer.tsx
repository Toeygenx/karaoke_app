"use client";

import { useEffect, useRef } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { Music } from "lucide-react";
import { useKaraokeStore } from "@/store/useKaraokeStore";

export default function VideoPlayer() {
  const { currentSong, playNext, setCurrentTime } = useKaraokeStore();
  const playerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    if (!currentSong) return;
    
    const interval = setInterval(async () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = await playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 100); // Check every 100ms for smooth sync

    return () => clearInterval(interval);
  }, [currentSong, setCurrentTime]);

  const handleReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
  };

  const handleEnd = (event: YouTubeEvent) => {
    playNext();
  };

  const handleStateChange = (event: YouTubeEvent) => {
    if (event.data === 1) { // PLAYING
      if (!playerRef.current) {
         playerRef.current = event.target;
      }
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-surface-border">
      {currentSong ? (
        <YouTube 
          videoId={currentSong.id} 
          opts={opts} 
          onReady={handleReady}
          onStateChange={handleStateChange}
          onEnd={handleEnd}
          className="w-full h-full absolute inset-0"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-surface">
          <div className="w-16 h-16 rounded-full bg-surface-border flex items-center justify-center mb-4">
            <Music size={32} className="text-gray-400" />
          </div>
          <p className="text-lg">Search for a song to start</p>
        </div>
      )}
    </div>
  );
}
