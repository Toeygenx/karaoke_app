"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Trash2, GripVertical, Play, ListMusic } from "lucide-react";
import { useKaraokeStore } from "@/store/useKaraokeStore";
import { useEffect, useState } from "react";

export default function QueueManager() {
  const { queue, reorderQueue, removeSongFromQueue, playSong } = useKaraokeStore();
  
  // Hydration fix for drag and drop
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(queue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    reorderQueue(items);
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-4 mt-6 bg-surface p-4 rounded-xl border border-surface-border shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Up Next</h2>
        <span className="text-sm bg-surface-border text-white px-3 py-1 rounded-full font-mono">{queue.length}</span>
      </div>
      
      {queue.length === 0 ? (
        <div className="p-8 mt-2 flex flex-col items-center justify-center text-center border-2 border-dashed border-surface-border rounded-xl bg-background/50 hover:bg-surface/50 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-surface-border flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
            <ListMusic size={24} className="text-gray-500 group-hover:text-primary transition-colors duration-300" />
          </div>
          <h3 className="font-semibold text-gray-300 mb-1">Queue is empty</h3>
          <p className="text-sm text-gray-500">Add songs from the search bar to keep the party going!</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="queue-list">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2"
              >
                {queue.map((song, index) => (
                  <Draggable key={`${song.id}-${index}`} draggableId={`${song.id}-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-3 p-2 bg-background border rounded-xl transition-all group animate-in fade-in slide-in-from-right-4 duration-300 ${
                          snapshot.isDragging ? "shadow-2xl shadow-primary/20 border-primary scale-[1.02] z-10" : "border-surface-border hover:border-gray-500"
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="text-gray-500 hover:text-white cursor-grab active:cursor-grabbing p-1">
                          <GripVertical size={20} />
                        </div>
                        <img src={song.thumbnail} alt={song.title} className="w-16 h-10 object-cover rounded shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-white">{song.title}</p>
                        </div>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              playSong(song);
                              removeSongFromQueue(song.id);
                            }}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all rounded-full hover:scale-110 active:scale-95"
                            title="Play Next"
                          >
                            <Play size={16} />
                          </button>
                          <button 
                            onClick={() => removeSongFromQueue(song.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full hover:scale-110 active:scale-95"
                            title="Remove from Queue"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
