"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

// Иконки Play/Pause
const Icons = {
    Play: () => <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
    Pause: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
};

interface VoiceMessageProps {
    src: string;
    isLead: boolean; // Чтобы менять цвет волны в зависимости от того, кто отправил
}

export default function VoiceMessage({ src, isLead }: VoiceMessageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState("0:00");
    const [currentTime, setCurrentTime] = useState("0:00");

    // Форматирование времени (секунды -> мм:сс)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // Создаем экземпляр WaveSurfer
        wavesurfer.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: isLead ? "#52525b" : "#93c5fd", // Серый для лида, Голубой для нас (base)
            progressColor: isLead ? "#e4e4e7" : "#ffffff", // Белый прогресс
            cursorColor: "transparent",
            barWidth: 2,
            barGap: 3,
            barRadius: 2,
            height: 30,
            normalize: true, // Нормализуем громкость для красоты волны
            url: src, // Загружаем аудио
        });

        // События
        wavesurfer.current.on('ready', () => {
            setDuration(formatTime(wavesurfer.current?.getDuration() || 0));
        });

        wavesurfer.current.on('audioprocess', () => {
            setCurrentTime(formatTime(wavesurfer.current?.getCurrentTime() || 0));
        });

        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
            setCurrentTime("0:00");
        });

        return () => {
            wavesurfer.current?.destroy();
        };
    }, [src, isLead]);

    const togglePlay = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="flex items-center gap-3 min-w-[200px] py-1">
            {/* Кнопка Play */}
            <button
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isLead
                        ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                        : "bg-blue-500 hover:bg-blue-400 text-white"
                }`}
            >
                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
            </button>

            {/* Волна и время */}
            <div className="flex flex-col flex-1">
                <div ref={containerRef} className="w-full" />
                <div className={`text-[10px] font-mono mt-1 ${isLead ? "text-zinc-400" : "text-blue-100"}`}>
                    {isPlaying ? currentTime : duration}
                </div>
            </div>
        </div>
    );
}