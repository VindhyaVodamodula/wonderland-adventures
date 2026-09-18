import { useEffect, useRef, useState } from "react";
import { registerAudio, stopAll } from "../audioRegistry";

export default function OpeningScene({ playerName, onStart }) {
  const videoRef   = useRef(null);
  // allAudio tracks EVERY file in the chain so stopVoiceover can kill them all
  const allAudio   = useRef([]);
  const [showHole, setShowHole] = useState(false);

  // ── Chain voiceover audio files ───────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stopped = false;

    function playChain(files, index = 0) {
      if (stopped || index >= files.length) return;
      const audio = registerAudio(new Audio(files[index]));
      audio.volume = 1.0;
      allAudio.current.push(audio);
      audio.play().catch(() => {
        const unlock = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', unlock);
        };
        document.addEventListener('click', unlock);
      });
      audio.onended = () => playChain(files, index + 1);
    }

    function startVoiceover() {
      playChain([
        '/audio/voice_over/0-18_title_audio.mp3',
        '/audio/voice_over/rabbit_voice.mp3',
        '/audio/voice_over/23-33_title_audio.mp3',
      ]);
    }

    video.addEventListener('play', startVoiceover, { once: true });
    video.addEventListener('ended', () => {
      stopVoiceover();
      setShowHole(true);
    });

    return () => {
      stopped = true;
      stopVoiceover();
    };
  }, []);

  function stopVoiceover() {
    // Kill every audio object created by this chain, not just the current one
    for (const a of allAudio.current) {
      a.onended = null;
      a.pause();
      a.src = '';
    }
    allAudio.current = [];
  }

  function skip() {
    stopVoiceover();
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration - 0.1;
      videoRef.current.pause();
    }
    setShowHole(true);
  }

  function handleStart() {
    stopAll();   // kill everything — BG music, voiceover, all of it
    onStart();
  }

  function handleBack() {
    stopAll();
    // Go back to name screen properly via onStart being undefined — 
    // we don't have an onBack prop here, so reload is the only option.
    // TODO: pass onBack prop from App.jsx for a clean reset.
    window.location.reload();
  }

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000" }}>

      <video
        ref={videoRef}
        src="/OpeningScene.mp4"
        autoPlay
        playsInline
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Skip button */}
      {!showHole && (
        <button onClick={skip} style={{
          position: "absolute", top: "3%", right: "2%",
          background: "rgba(255,255,255,0.85)", color: "#6b21a8",
          fontFamily: "Cormorant Garamond, serif", fontWeight: "bold",
          fontSize: "clamp(12px,1.5vw,15px)", padding: "8px 20px",
          borderRadius: "50px", border: "none", cursor: "pointer",
          zIndex: 30, boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}>
          Skip Intro ⏭
        </button>
      )}

      {/* Back button */}
      <button onClick={handleBack} style={{
        position: "absolute", top: "3%", left: "2%",
        background: "rgba(255,255,255,0.85)", color: "#6b21a8",
        fontFamily: "Cormorant Garamond, serif", fontWeight: "bold",
        fontSize: "clamp(12px,1.5vw,15px)", padding: "8px 20px",
        borderRadius: "50px", border: "none", cursor: "pointer",
        zIndex: 30, boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        ← Back
      </button>

      {showHole && (
        <>
          <div onClick={handleStart} style={{
            position: "absolute", right: "18%", top: "64%",
            transform: "translate(50%,-50%)",
            width: "clamp(80px,12vw,160px)", height: "clamp(60px,9vw,120px)",
            borderRadius: "45%",
            background: "radial-gradient(ellipse, rgba(255,220,80,0.45) 0%, transparent 70%)",
            boxShadow: "0 0 80px 40px rgba(255,200,60,0.6)",
            animation: "holePulse 2s ease-in-out infinite",
            cursor: "pointer", zIndex: 20,
          }} />

          <div onClick={handleStart} style={{
            position: "absolute", right: "13%", top: "65%",
            transform: "translate(50%, -50%)",
            zIndex: 25, textAlign: "center", cursor: "pointer", marginTop: "80px",
          }}>
            <div style={{
              marginTop: "90px",
              background: "rgba(255,255,255,0.95)", color: "#6b21a8",
              fontFamily: "Cormorant Garamond, serif", fontWeight: "bold",
              fontSize: "clamp(12px,1.8vw,16px)", padding: "10px 22px",
              borderRadius: "50px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              whiteSpace: "nowrap", animation: "pulseBubble 2s ease-in-out infinite",
            }}>
              🐇 Enter the Rabbit Hole!
            </div>
          </div>

          <div style={{
            position: "absolute", bottom: "4%", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.93)", color: "#5b1f8a",
            fontFamily: "Lora, serif", fontSize: "clamp(13px,2vw,18px)",
            fontStyle: "italic", padding: "13px 32px", borderRadius: "50px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            zIndex: 20, maxWidth: "80vw", textAlign: "center",
          }}>
            ✨ Want to explore what's inside the hole, {playerName}?
          </div>
        </>
      )}

      <style>{`
        @keyframes holePulse {
          0%,100% { opacity:0.85; transform:translate(50%,-50%) scale(1); }
          50%     { opacity:1;    transform:translate(50%,-50%) scale(1.2); }
        }
        @keyframes pulseBubble {
          0%,100% { transform:scale(1); }
          50%     { transform:scale(1.07); }
        }
      `}</style>
    </div>
  );
}
