import { useEffect, useRef } from 'react';
import { registerAudio } from './audioRegistry';

// ─── Volume levels ────────────────────────────────────────────
const BG_VOLUME        = 0.10;  // updated by user
const DUCK_VOLUME      = 0.05;
const FADE_DURATION    = 1000;  // ms for fade in/out transitions

// ─── Room → audio file map ────────────────────────────────────
export const ROOM_MUSIC = {
  'title':          '/audio/bg_music_title.mp3',
  'name':           '/audio/bg_music_title.mp3',
  'opening':        '/audio/titile_video_bg.mp3',
  'rabbit-hole':    '/audio/RH_bg_music.mp3',
  'mystery':        '/audio/MR_bg_music.mp3',
  'mystery-choice': '/audio/MR_bg_music.mp3',
  'mystery-return': '/audio/MR_bg_music.mp3',
  'mystery-open':   '/audio/MR_bg_music.mp3',
  'firefly-forest': '/audio/FFF_bg_music.mp3',
  'tea-party':      '/audio/TP_bg_music.mp3',
  'royal-court':    '/audio/RC_bg_music.mp3',
  'win':            '/audio/QG_bg_music.mp3',
};

// ─── Fade helper ──────────────────────────────────────────────
function fadeTo(audio, targetVol, durationMs, onDone) {
  if (!audio) return;
  const steps     = 30;
  const interval  = durationMs / steps;
  const startVol  = audio.volume;
  const diff      = targetVol - startVol;
  let   step      = 0;

  const timer = setInterval(() => {
    step++;
    const next = startVol + diff * (step / steps);
    audio.volume = Math.min(1, Math.max(0, next));
    if (step >= steps) {
      clearInterval(timer);
      audio.volume = targetVol;
      if (onDone) onDone();
    }
  }, interval);

  return timer;
}

// ─── Main hook ────────────────────────────────────────────────
export function useAudio(currentRoom) {
  const audioRef    = useRef(null);
  const fadingRef   = useRef(null);
  const currentSrc  = useRef(null);
  const fadeTimer   = useRef(null);

  useEffect(() => {
    const src = ROOM_MUSIC[currentRoom];
    if (!src) return;

    // Same track already playing — do nothing
    if (src === currentSrc.current && audioRef.current && !audioRef.current.paused) return;

    // Clear any in-progress fade
    if (fadeTimer.current) clearInterval(fadeTimer.current);

    // If a previous fade-out was interrupted, stop that audio immediately
    if (fadingRef.current) {
      fadingRef.current.pause();
      fadingRef.current.src = '';
      fadingRef.current = null;
    }

    // If something is already playing — cut it immediately and start new
    if (audioRef.current && !audioRef.current.paused) {
      const oldAudio = audioRef.current;
      audioRef.current = null;
      oldAudio.pause();
      oldAudio.src = '';
      fadingRef.current = null;
      startNew(src);
    } else {
      startNew(src);
    }

    function startNew(src) {
      const audio      = registerAudio(new Audio(src));
      audio.loop       = true;
      audio.volume     = 0;
      audioRef.current = audio;
      currentSrc.current = src;

      function beginFade() {
        if (fadeTimer.current) clearInterval(fadeTimer.current);
        audio.volume = 0;
        fadeTimer.current = fadeTo(audio, BG_VOLUME, FADE_DURATION);
      }

      audio.play().then(() => {
        // Autoplay allowed — fade in immediately
        beginFade();
      }).catch(() => {
        // Autoplay blocked — wait for first user interaction then play + fade
        const unlock = () => {
          audio.play().then(beginFade).catch(() => {});
          window.removeEventListener('click', unlock);
          window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
      });
    }

    // Cleanup on unmount
    return () => {
      if (fadeTimer.current) clearInterval(fadeTimer.current);
      if (fadingRef.current) {
        fadingRef.current.pause();
        fadingRef.current = null;
      }
    };
  }, [currentRoom]);

  // ── Duck / unduck for voiceover ───────────────────────────────
  function duck() {
    if (fadeTimer.current) clearInterval(fadeTimer.current);
    fadeTimer.current = fadeTo(audioRef.current, DUCK_VOLUME, 600);
  }

  function unduck() {
    if (fadeTimer.current) clearInterval(fadeTimer.current);
    fadeTimer.current = fadeTo(audioRef.current, BG_VOLUME, 800);
  }

  return { duck, unduck };
}
