import { useEffect, useState } from "react";
import ThoughtBubble from './ThoughtBubble';
import { registerAudio } from '../audioRegistry';

export default function MysteryRoomReturn({ playerName, lastChoice, onNext, onBack }) {

  // Background depends on whether cake was chosen before
const bgSrc= lastChoice === "cake"
    ? "/background-images/MR-royal-tea-firefly.png"
    : "/background-images/MR-tea-firefly.png"


  const [phase,       setPhase]       = useState("entering");
  const [girlX,       setGirlX]       = useState(18);
  const [girlBottom,  setGirlBottom]  = useState(20);
  const [girlSize,    setGirlSize]    = useState(0.6);
  const [girlImg,     setGirlImg]     = useState("/wearingBackpack-Idle.png");
  const [showDoor,    setShowDoor]    = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [fadingOut,   setFadingOut]   = useState(false);

  useEffect(() => {
    // Girl enters from firefly door (left side) small
    const t1 = setTimeout(() => {
  setPhase("walking");
  setGirlSize(0.4);    // starts small
  setGirlX(33.5);        // starts at firefly door position
  setGirlBottom(55);
}, 200);

// Now grow as she walks to center
const t1b = setTimeout(() => {
  setGirlX(45);
  setGirlBottom(22);
  setGirlSize(1.6);    // grows to normal
}, 600);

    // Girl reaches center — pause
    const t2 = setTimeout(() => {
      setPhase("idle");
    }, 3500);

    // Background swaps to tea+firefly open


    // Girl switches to pointing image
    const t4 = setTimeout(() => {
      setGirlImg("/girl-pointingleft.png");
      setPhase("pointing");
    }, 5800);

    // Door glow appears
    const t5 = setTimeout(() => {
      setShowDoor(true);
    }, 5800);
    const a = registerAudio(new Audio('/audio/voice_over/mr_return.mp3'));
a.volume = 1.0;
a.play().catch(() => {});

    // Caption appears
    const t6 = setTimeout(() => {
      setShowCaption(true);
    }, 6200);

    return () => [t1,t1b,t2,t4,t5,t6].forEach(clearTimeout);
  }, []);
  

  function handleDoorClick() {
    if (!showDoor) return;
    setShowDoor(false);
    setShowCaption(false);

    // Switch to walking toward door image
    setGirlImg("/girl-looking from left.png");
    setPhase("walking-door");

    // Walk left toward keyhole door
    setTimeout(() => {
      setGirlX(10);
      setGirlBottom(22);
    }, 100);

    // Shrink into door
    setTimeout(() => {
      setPhase("shrinking");
    }, 2200);

    // Fade out
    setTimeout(() => setFadingOut(true), 4500);

    // Go to tea party
    setTimeout(() => onNext(), 5800);
  }

  const girlStyle = {
    position:        "absolute",
    bottom:          `${girlBottom}%`,
    left:            `${girlX}%`,
    height:          `${girlSize * 14}vh`,
    transform:       "translateX(-50%)",
    transformOrigin: "bottom center",
    transition:      phase === "walking" || phase === "walking-door"
      ? "left 2.5s ease-out, bottom 2.5s ease-out, height 2.5s ease-out"
      : "none",
    animation:       phase === "shrinking"
      ? "enterTeaDoor 3s ease-out forwards"
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
      background: "#1a0a1a",
    }}>

      {/* Background */}
      <img
        src={bgSrc}
        alt="mystery room"
        style={{
          position:   "absolute",
          inset:      0,
          width:      "100%",
          height:     "100%",
          objectFit:  "cover",
          transition: "opacity 0.8s ease",
        }}
      />

      {phase === 'idle' && (
        <ThoughtBubble
          text="What's inside that hole...?"
          girlX={girlX}
          girlBottom={girlBottom}
          girlSize={girlSize}
        />
      )}

      {/* Girl */}
      <img
        src={girlImg}
        alt="girl"
        style={girlStyle}
      />

      {/* Keyhole door glow + click zone — far left */}
      {showDoor && (
        <div
          onClick={handleDoorClick}
          style={{
            position:     "absolute",
            left:         "9%",
            top:          "15%",
            width:        "150px",
            height:       "50%",
            cursor:       "pointer",
            zIndex:       20,
            borderRadius: "8px 8px 50% 50% / 8px 8px 20px 20px",
            boxShadow:    "0 0 60px 25px rgba(255,220,80,0.55), 0 0 20px 8px rgba(255,200,60,0.8)",
            animation:    "doorPulse 2s ease-in-out infinite",
          }}
        />
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
          {`You have the key, ${playerName}! Open the Tea Party door! 🗝️`}
        </div>
      )}

      {/* Fade overlay */}
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
@keyframes enterTeaDoor {
  0%   {
    transform: translateX(-40%) translateY(0%) scale(1);
    opacity: 1;
  }
  20%  {
    transform: translateX(-40%) translateY(-20%) scale(0.6);
    opacity: 1;
  }
  400%  {
    transform: translateX(-40%) translateY(-100%) scale(0.35);
    opacity: 1;
  }
  100% {
    transform: translateX(-40%) translateY(-200%) scale(0.02);
    opacity: 0;
  }
}
        @keyframes doorPulse {
          0%,100% { opacity: 0.8; }
          50%     { opacity: 1;   }
        }
      `}</style>
    </div>
  );
}