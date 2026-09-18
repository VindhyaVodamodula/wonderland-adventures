import { useEffect, useRef, useState } from "react";
import { registerAudio } from '../audioRegistry';

export default function MysteryRoomChoice({ choice, onNext, onBack }) {
  const isCake = choice === "cake";

  const NORMAL_SIZE  = 1.6;
  const CHANGED_SIZE = isCake ? 2.4 : 1.0;

  const [phase,       setPhase]       = useState("transform");
  const [girlSize,    setGirlSize]    = useState(NORMAL_SIZE);
  const [girlX,       setGirlX]       = useState(42);
  const [girlBottom,  setGirlBottom]  = useState(22);
  const [girlImg,     setGirlImg]     = useState(isCake ? "/girl-eatmeCake.png" : "/girl-drinkme (1).png");
  const [showDoor,    setShowDoor]    = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [fadingOut,   setFadingOut]   = useState(false);
  const choiceAudioRef = useRef(null);
  const doorAudioRef   = useRef(null);

  const bg = isCake
    ? "/background-images/MR-royal.png"
    : "/background-images/MR-firefly.png";

  useEffect(() => {
    // Play "I'm growing!" / "I'm shrinking!" voice right when scene loads
    const voFile = isCake ? '/audio/voice_over/mr_cake.mp3' : '/audio/voice_over/mr_bottle.mp3';
    const audio = registerAudio(new Audio(voFile));
    choiceAudioRef.current = audio;
    audio.volume = 1.0;
    const tv = setTimeout(() => audio.play().catch(() => {}), 400);

    // Freeze 3.5s then grow/shrink
    const t1 = setTimeout(() => setGirlSize(CHANGED_SIZE), 3500);

    // Door glows after size change — play door voiceover
    const t2 = setTimeout(() => {
      setShowDoor(true);
      setPhase("glow");
      const da = registerAudio(new Audio('/audio/voice_over/door_glowing_lets_go_through.mp3'));
      doorAudioRef.current = da;
      da.volume = 1.0;
      da.play().catch(() => {});
    }, 5500);

    // Switch to idle at new size
    const t3 = setTimeout(() => {
      setGirlImg("/girl-idle.png");
      setPhase("idle");
    }, 6200);

    // Show caption
    const t4 = setTimeout(() => setShowCaption(true), 5800);

    // Door becomes clickable
    const t5 = setTimeout(() => setPhase("clickable"), 7000);

    return () => {
      clearTimeout(tv);
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      if (choiceAudioRef.current) {
        choiceAudioRef.current.onended = null;
        choiceAudioRef.current.pause();
        choiceAudioRef.current.src = '';
      }
      if (doorAudioRef.current) {
        doorAudioRef.current.onended = null;
        doorAudioRef.current.pause();
        doorAudioRef.current.src = '';
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  function handleDoorClick() {
    if (phase !== "clickable") return;
    // Stop door glow voice immediately
    if (doorAudioRef.current) {
      doorAudioRef.current.onended = null;
      doorAudioRef.current.pause();
      doorAudioRef.current.src = '';
    }
    setShowCaption(false);
    setGirlImg("/girl-back-headtop.png");
    setPhase("walking");

    // Walk toward door
    setTimeout(() => {
      setGirlX(isCake ? 65 : 35);
      setGirlBottom(isCake ? 22 : 28);
    }, 100);

    // Switch to entering
    setTimeout(() => setPhase("entering"), 2200);

    // Trigger shrink animation
    setTimeout(() => setPhase("shrinking"), 2800);

    // Fade to black
    setTimeout(() => setFadingOut(true), 5000);

    // Go to next scene
    setTimeout(() => onNext(), 6000);
  }

  // ── Door glow zone ────────────────────────────────────────────
  const doorStyle = isCake ? {
    position:     "absolute",
    left:         "60%",
    top:          "15%",
    width:        "140px",
    height:       "40%",
    cursor:       phase === "clickable" ? "pointer" : "default",
    zIndex:       20,
    borderRadius: "8px 8px 50% 50% / 8px 8px 20px 20px",
    boxShadow:    "0 0 60px 25px rgba(255,100,100,0.55), 0 0 20px 8px rgba(255,150,100,0.8)",
    animation:    "doorPulse 2s ease-in-out infinite",
  } : {
    position:     "absolute",
    left:         "33.5%",
    top:          "15%",
    width:        "160px",
    height:       "42%",
    cursor:       phase === "clickable" ? "pointer" : "default",
    zIndex:       20,
    borderRadius: "8px 8px 50% 50% / 8px 8px 20px 20px",
    boxShadow:    "0 0 60px 25px rgba(100,255,150,0.45), 0 0 20px 8px rgba(150,255,100,0.7)",
    animation:    "doorPulse 2s ease-in-out infinite",
  };

  // ── Girl style per phase ──────────────────────────────────────
  const girlStyle = {
    position:        "absolute",
    bottom:          `${girlBottom}%`,
    left:            (phase === "entering" || phase === "shrinking")
                       ? (isCake ? "65%" : "35%")
                       : `${girlX}%`,
    height:          `${girlSize * 14}vh`,
    transform:       "translateX(-50%)",
    transformOrigin: "bottom center",
    transition:      phase === "walking"
      ? "left 2s ease-in, bottom 2s ease-in"
      : "height 1.5s ease, transform 1.5s ease",
    opacity:         phase === "shrinking" ? 0 : 1,
    animation: phase === "shrinking"
  ? isCake
    ? "girlEnterRoyal 3s ease-out forwards"
    : "girlEnterFirefly 3s ease-out forwards"
  : "none",
    filter:          "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
    zIndex:          10,
  };

  return (
    <div style={{
      position: "absolute",
      inset:    0,
      width:    "100%",
      height:   "100%",
      overflow: "hidden",
    }}>

      {/* Background */}
      <img
        src={bg}
        alt="mystery room"
        style={{
          position:  "absolute",
          inset:     0,
          width:     "100%",
          height:    "100%",
          objectFit: "cover",
        }}
      />

      {/* Girl */}
      <img
        src={girlImg}
        alt="girl"
        style={girlStyle}
      />

      {/* Door glow + click zone */}
      {showDoor && (
        <div onClick={handleDoorClick} style={doorStyle} />
      )}

      {/* Caption */}
      {showCaption && (
        <div style={{
          position:     "absolute",
          bottom:       "5%",
          left:         "50%",
          transform:    "translateX(-50%)",
          background:   "rgba(255,255,255,0.93)",
          color:        "#5b1f8a",
          fontFamily:   "Lora, Georgia, serif",
          fontSize:     "clamp(13px, 2vw, 18px)",
          fontStyle:    "italic",
          padding:      "13px 32px",
          borderRadius: "50px",
          boxShadow:    "0 4px 24px rgba(0,0,0,0.18)",
          zIndex:       25,
          maxWidth:     "80vw",
          textAlign:    "center",
          lineHeight:   1.6,
        }}>
          {isCake
            ? "The heart door is open! You've grown big enough to enter! 🍰"
            : "The forest door is open! You've shrunk small enough to enter! 🍶"
          }
        </div>
      )}

      {/* Click prompt */}
      {phase === "clickable" && (
        <div
          onClick={handleDoorClick}
          style={{
            position:     "absolute",
            ...(isCake ? { left: "55%" } : { left: "22%" }),
            top:          "2%",
            background:   "rgba(255,255,255,0.95)",
            color:        "#6b21a8",
            fontFamily:   "Cormorant Garamond, Georgia, serif",
            fontWeight:   "bold",
            fontSize:     "clamp(12px, 1.8vw, 16px)",
            padding:      "10px 22px",
            borderRadius: "50px",
            boxShadow:    "0 4px 20px rgba(0,0,0,0.2)",
            zIndex:       25,
            cursor:       "pointer",
            whiteSpace:   "nowrap",
            animation:    "pulseBubble 2s ease-in-out infinite",
          }}
        >
          {isCake ? "✨ Enter the Royal Court!" : "✨ Enter the Firefly Forest!"}
        </div>
      )}

      {/* Fade to black overlay */}
      <div style={{
        position:      "absolute",
        inset:         0,
        background:    "#000",
        opacity:       fadingOut ? 1 : 0,
        transition:    "opacity 1.2s ease",
        zIndex:        30,
        pointerEvents: "none",
      }} />

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position:     "absolute",
          top:          "3%",
          left:         "2%",
          background:   "rgba(255,255,255,0.85)",
          color:        "#6b21a8",
          fontFamily:   "Cormorant Garamond, serif",
          fontWeight:   "bold",
          fontSize:     "clamp(12px,1.5vw,15px)",
          padding:      "8px 20px",
          borderRadius: "50px",
          border:       "none",
          cursor:       "pointer",
          zIndex:       30,
          boxShadow:    "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        ← Back
      </button>

<style>{`
  @keyframes girlEnterRoyal {
    0%   {
      transform: translateX(-50%) translateY(0%) scale(1);
      opacity: 1;
    }
    60%  {
      transform: translateX(-50%) translateY(-40%) scale(0.5);
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) translateY(-120%) scale(0.02);
      opacity: 0;
    }
  }

  @keyframes girlEnterFirefly {
    0%   {
      transform: translateX(-50%) translateY(0%) scale(1);
      opacity: 1;
    }
    40%  {
      transform: translateX(-70%) translateY(-50%) scale(0.6);
      opacity: 1;
    }
    75%  {
      transform: translateX(-30%) translateY(-200%) scale(0.2);
      opacity: 0.9;
    }
    100% {
      transform: translateX(0%) translateY(-300%) scale(0.02);
      opacity: 1;
    }
  }

  @keyframes doorPulse {
    0%,100% { opacity: 0.8; }
    50%     { opacity: 1;   }
  }
  @keyframes pulseBubble {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.07); }
  }
`}</style>
    </div>
  );
}
