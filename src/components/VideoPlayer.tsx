"use client";

import { useEffect, useRef } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { Music } from "lucide-react";
import { useKaraokeStore } from "@/store/useKaraokeStore";

export default function VideoPlayer() {
  const { currentSong, playNext, setCurrentTime, seekToTime, setSeekToTime } = useKaraokeStore();
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

  useEffect(() => {
    if (seekToTime !== null && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seekToTime, true);
      setSeekToTime(null);
    }
  }, [seekToTime, setSeekToTime]);

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
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-surface relative overflow-hidden group">
          {/* Animated Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000 animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-surface-border/50 border border-surface-border flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-all duration-500">
              <Music size={36} className="text-gray-400 group-hover:text-primary transition-colors duration-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Ready to Sing?</h2>
            <p className="text-gray-400">Search for a track above to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
