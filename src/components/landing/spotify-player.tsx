"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

const BAR_COUNT = 80;

function seededHeights(seed: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Array.from({ length: count }, (_, i) => {
    hash = (hash * 1103515245 + 12345 + i) | 0;
    return 12 + (Math.abs(hash) % 88);
  });
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface SpotifyPlayerProps {
  src: string;
  title: string;
  artist: string;
  coverImage: string;
  duration?: number;
}

export function SpotifyPlayer({
  src,
  title,
  artist,
  coverImage,
  duration = 5,
}: SpotifyPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const heights = seededHeights(title, BAR_COUNT);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      stopPlayback();
      return;
    }

    audio.currentTime = 0;
    setCurrentTime(0);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, stopPlayback]);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const clamped = Math.max(0, Math.min(1, ratio));
      const time = clamped * duration;
      audio.currentTime = time;
      setCurrentTime(time);
    },
    [duration],
  );

  const handleProgressInteraction = useCallback(
    (clientX: number) => {
      const el = progressRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      seekToRatio((clientX - rect.left) / rect.width);
    },
    [seekToRatio],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      if (time >= duration) stopPlayback();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", stopPlayback);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", stopPlayback);
    };
  }, [duration, stopPlayback]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleProgressInteraction(e.clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, handleProgressInteraction]);

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-[#000000] ring-1 ring-white/[0.08] shadow-2xl shadow-black">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Now playing header */}
      <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#3d2a1f] via-[#1a1410] to-[#121212]">
        <div className="absolute inset-0 opacity-30">
          <Image src={coverImage} alt="" fill className="object-cover blur-3xl scale-110" sizes="800px" />
        </div>

        <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-end">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 rounded-lg overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
            <Image src={coverImage} alt={`Cover of ${title}`} fill className="object-cover" sizes="208px" priority />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1DB954]">
              Preview
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white truncate">{title}</h3>
            <p className="text-[#b3b3b3] text-sm sm:text-base">{artist}</p>
          </div>
        </div>
      </div>

      {/* Controls + waveform */}
      <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6 bg-black">
        <div className="flex items-center justify-center gap-6">
          <button type="button" className="text-[#b3b3b3] hover:text-white transition-colors" aria-label="Previous">
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play preview"}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#1DB954] text-black hover:scale-105 hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/30"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            )}
          </button>

          <button type="button" className="text-[#b3b3b3] hover:text-white transition-colors" aria-label="Next">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Waveform visualization */}
        <div className="flex items-end gap-[2px] h-16 px-1">
          {heights.map((height, i) => {
            const barProgress = (i + 1) / BAR_COUNT;
            const isPlayed = barProgress <= progress;
            const isActive =
              isPlaying && Math.abs(barProgress - progress) < 2 / BAR_COUNT;

            return (
              <div
                key={i}
                className="flex-1 rounded-full min-w-[2px] transition-all duration-100"
                style={{ height: `${height}%` }}
              >
                <div
                  className={cn(
                    "w-full h-full rounded-full",
                    isPlayed ? "bg-[#1DB954]" : "bg-[#535353]",
                    isActive && "bg-[#1ed760] scale-y-110 origin-bottom",
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#b3b3b3] tabular-nums w-8 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            ref={progressRef}
            role="slider"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={Math.round(currentTime)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                togglePlay();
              }
            }}
            onClick={(e) => handleProgressInteraction(e.clientX)}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleProgressInteraction(e.clientX);
            }}
            className="group flex-1 h-1 rounded-full bg-[#535353] cursor-pointer relative"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#1DB954] group-hover:bg-[#1ed760]"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>
          <span className="text-[11px] text-[#b3b3b3] tabular-nums w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
