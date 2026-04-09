'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useZoerIframe } from "@/hooks/useZoerIframe";

const SOUND_URLS: Record<string, string> = {
  lofi: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946ba7e4fa.mp3',
  rain: 'https://cdn.pixabay.com/audio/2022/05/16/audio_1e6e153a94.mp3',
  nature: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8eb02c6b9d.mp3',
  cafe: 'https://cdn.pixabay.com/audio/2021/09/07/audio_a47d5a49b3.mp3',
  fire: 'https://cdn.pixabay.com/audio/2021/08/09/audio_dc39bede8e.mp3',
  ocean: 'https://cdn.pixabay.com/audio/2022/06/07/audio_b9c5b21c21.mp3',
};

export default function GlobalClientEffects() {
  useZoerIframe();
  const { settings } = useStore();
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Inicializar audios
    Object.entries(SOUND_URLS).forEach(([id, url]) => {
      if (!audioRefs.current[id]) {
        const audio = new Audio(url);
        audio.loop = true;
        audioRefs.current[id] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach(a => a.pause());
    };
  }, []);

  useEffect(() => {
    // Sincronizar estado de reproducción y volumen
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      const isActive = settings.activeSounds.includes(id);
      const volume = settings.soundVolumes[id] ?? 0.5;

      if (isActive && settings.soundEnabled) {
        audio.volume = volume;
        if (audio.paused) {
          audio.play().catch(e => console.log("Audio play blocked by browser:", e));
        }
      } else {
        audio.pause();
      }
    });
  }, [settings.activeSounds, settings.soundEnabled, settings.soundVolumes]);

  return null;
}
