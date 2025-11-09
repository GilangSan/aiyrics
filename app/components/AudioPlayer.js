"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

const AudioPlayer = ({ src, size = 25 }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="z-10">
      <audio ref={audioRef} src={src} preload="auto" />
      {isPlaying ? (
        <Pause
          size={size}
          onClick={(e) => {
            e.stopPropagation()
            handlePlayPause()
          }}
          className={`text-neutral-400 hover:text-neutral-300 cursor-pointer z-1`}
        />
      ) : (
        <Play
          size={size}
          onClick={(e) => {
            e.stopPropagation()
            handlePlayPause()
          }}
          className={`text-neutral-400 hover:text-neutral-300 cursor-pointer z-1`}
        />
      )}
    </div>
  );
};

export default AudioPlayer;
