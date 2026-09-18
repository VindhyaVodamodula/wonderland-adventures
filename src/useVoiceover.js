import { useEffect } from 'react';
import { registerAudio, stopAll } from './audioRegistry';

/**
 * useVoiceover(src)
 * Play a single voiceover file. Stops on unmount.
 */
export function useVoiceover(src) {
  useEffect(() => {
    if (!src) return;
    const audio = registerAudio(new Audio(src));
    audio.volume = 1.0;
    const t = setTimeout(() => audio.play().catch(() => {}), 1500);
    return () => {
      clearTimeout(t);
      audio.onended = null;
      audio.pause();
      audio.src = '';
    };
  }, [src]);
}

/**
 * useVoiceChain(files, { onDone, startDelay })
 * Play a sequence of voiceover files one after another.
 * Fully cleans up every file in the chain on unmount.
 */
export function useVoiceChain(files, { onDone, startDelay = 800 } = {}) {
  useEffect(() => {
    if (!files || files.length === 0) return;

    let stopped = false;
    // Track ALL audio objects created so we can stop them all on cleanup
    const allAudio = [];
    let delayTimer = null;

    function playNext(index) {
      if (stopped || index >= files.length) {
        if (!stopped && onDone) onDone();
        return;
      }
      const audio = registerAudio(new Audio(files[index]));
      audio.volume = 1.0;
      allAudio.push(audio);
      audio.play().catch(() => {});
      audio.onended = () => playNext(index + 1);
    }

    delayTimer = setTimeout(() => playNext(0), startDelay);

    return () => {
      stopped = true;
      clearTimeout(delayTimer);
      // Stop every file that was created, not just the current one
      for (const a of allAudio) {
        a.onended = null;
        a.pause();
        a.src = '';
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}