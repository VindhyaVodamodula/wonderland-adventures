/**
 * audioRegistry.js
 *
 * A dead-simple global registry of every Audio object the game has created.
 * Call stopAll() to silence everything before switching screens/rooms.
 *
 * Usage:
 *   import { registerAudio, stopAll } from './audioRegistry'
 *
 *   // Instead of: const a = new Audio(src)
 *   const a = registerAudio(new Audio(src))
 *
 *   // Before navigating:
 *   stopAll()
 */

const registry = new Set();

export function registerAudio(audio) {
  registry.add(audio);
  // Auto-remove when the audio finishes so the set doesn't grow forever
  audio.addEventListener('ended', () => registry.delete(audio), { once: true });
  return audio;
}

export function stopAll() {
  for (const audio of registry) {
    try {
      audio.onended = null;   // prevent chain callbacks firing after stop
      audio.pause();
      audio.src = '';         // release the media resource
    } catch (_) {}
  }
  registry.clear();
}
