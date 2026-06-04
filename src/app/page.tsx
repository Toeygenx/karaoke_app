import VideoPlayer from "@/components/VideoPlayer";
import YoutubeSearch from "@/components/YoutubeSearch";
import QueueManager from "@/components/QueueManager";
import LyricsScroller from "@/components/LyricsScroller";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen lg:h-screen lg:overflow-hidden bg-background">
      {/* Global Search Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 pt-6 pb-2 shrink-0 z-50">
        <YoutubeSearch />
      </div>

      <div className="flex flex-col lg:flex-row p-4 lg:p-6 gap-6 flex-1 lg:overflow-hidden min-h-0">
        {/* Left Panel: Video & Queue */}
        <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-6 pb-6 z-10 lg:h-full lg:overflow-hidden">
          <div className="shrink-0 z-0">
            <VideoPlayer />
          </div>
          <div className="flex-1 flex flex-col lg:overflow-hidden min-h-[400px] lg:min-h-0">
            <QueueManager />
          </div>
        </div>

        {/* Right Panel: Lyrics */}
        <div className="w-full lg:w-7/12 xl:w-2/3 flex flex-col lg:border-l border-surface-border lg:pl-6 pb-6 relative z-0 h-[600px] lg:h-full lg:overflow-hidden">
          <LyricsScroller />
        </div>
      </div>
    </main>
  );
}
