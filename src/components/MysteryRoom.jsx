import { useEffect, useRef, useState } from "react";
import { registerAudio } from '../audioRegistry';

export default function MysteryRoom({ playerName, returning = false, onChoice, onBack, onAddItem }) {
  const [phase,       setPhase]       = useState("entering");
  // When returning: girl starts at center already, skip walk-in
  const [girlX,       setGirlX]       = useState(returning ? 42 : 5);
  const [girlSize,    setGirlSize]    = useState(returning ? 1.6 : 0.8);
  const [showCaption, setShowCaption] = useState(returning);
  // When returning: only bottle glows (cake path already tried)
  const [showItems,   setShowItems]   = useState(returning);
  const [fadingOut,   setFadingOut]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const mrAudioRef = useRef(null);

  // Background — when returning show RC door open, others closed
  const bgSrc = returning
    ? '/background-images/MR-royal.png'
    : '/background-images/MR-closed.png';

  useEffect(() => {
    if (returning) return; // skip walk-in animation when returning
    // Girl walks from left to center
    const t1 = setTimeout(() => {
      setGirlX(42);
      setGirlSize(1.6);
    }, 300);

    // Caption appears after she arrives
    const t2 = setTimeout(() => setShowCaption(true), 2800);

    // Items always appear after girl arrives — clicking them is the natural skip
    const t3 = setTimeout(() => setShowItems(true), 3200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [returning]);

  useEffect(() => {
    if (returning) {
      // Play rc_girl_return voice when she comes back disappointed
      const audio = registerAudio(new Audio('/audio/voice_over/rc_girl_return.mp3'));
      mrAudioRef.current = audio;
      audio.volume = 1.0;
      const t = setTimeout(() => audio.play().catch(() => {}), 400);
      return () => { clearTimeout(t); audio.onended = null; audio.pause(); audio.src = ''; };
    }
    // Play entry voiceover — items are already visible so clicking skips it naturally
    const audio = registerAudio(new Audio('/audio/voice_over/mr_entry.mp3'));
    mrAudioRef.current = audio;
    audio.volume = 1.0;
    const t = setTimeout(() => {
      audio.play().catch(() => {
        const unlock = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', unlock);
        };
        document.addEventListener('click', unlock);
      });
    }, 500);
    return () => { clearTimeout(t); audio.onended = null; audio.pause(); audio.src = ''; };
  }, [returning]);

  function handleChoice(choice) {
    if (!showItems) return;
    // Stop entry voice immediately when player makes a choice
    if (mrAudioRef.current) {
      mrAudioRef.current.onended = null;
      mrAudioRef.current.pause();
      mrAudioRef.current.src = '';
    }
    setShowItems(false);
    setShowCaption(false);
    setFadingOut(true);
    onAddItem(choice === "cake" ? "Cake" : "Bottle");
    // Pass choice to App — mr_cake/mr_bottle voice plays in MysteryRoomChoice_1
    setTimeout(() => onChoice(choice), 1200);
  }

  function handleBack() { setShowConfirm(true); }

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>

      {/* Background */}
      <img
        src={bgSrc}
        alt="mystery room"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          opacity: phase === "entering" ? 0 : 1,
          transition: "opacity 1.2s ease",
        }}
        onLoad={() => setTimeout(() => setPhase("walking"), 100)}
      />

      {/* Girl */}
      {phase !== "entering" && (
        <img
          src="/girl-back-headtop.png"
          alt="girl"
          style={{
            position: "absolute", bottom: "22%", left: `${girlX}%`,
            height: `clamp(120px, ${14 * girlSize}vh, ${girlSize * 220}px)`,
            transform: `translateX(-50%) scale(${girlSize})`,
            transformOrigin: "bottom center",
            transition: "left 4s ease, height 4s ease, transform 4s ease",
            filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
            zIndex: 10,
          }}
        />
      )}

      {/* Cake glow zone — hidden when returning (cake path already tried) */}
      {showItems && !returning && (
        <div onClick={() => handleChoice("cake")} style={{
          position: "absolute", left: "44%", top: "36%",
          width: "clamp(60px, 7vw, 100px)", height: "clamp(60px, 7vw, 100px)",
          borderRadius: "50%", cursor: "pointer", zIndex: 20,
          background: "radial-gradient(ellipse, rgba(255,180,200,0.4) 0%, transparent 70%)",
          boxShadow: "0 0 40px 20px rgba(255,150,180,0.5)",
          animation: "itemPulse 1.5s ease-in-out infinite",
        }} />
      )}

      {/* Bottle glow zone */}
      {showItems && (
        <div onClick={() => handleChoice("bottle")} style={{
          position: "absolute", left: "51%", top: "36%",
          width: "clamp(50px, 6vw, 85px)", height: "clamp(60px, 8vw, 110px)",
          borderRadius: "50%", cursor: "pointer", zIndex: 20,
          background: "radial-gradient(ellipse, rgba(180,150,255,0.4) 0%, transparent 70%)",
          boxShadow: "0 0 40px 20px rgba(160,100,255,0.5)",
          animation: "itemPulse 1.5s ease-in-out infinite",
          animationDelay: "0.3s",
        }} />
      )}

      {/* Caption */}
      {showCaption && (
        <div style={{
          position: "absolute", bottom: "5%", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.93)", color: "#5b1f8a",
          fontFamily: "Lora, Georgia, serif", fontSize: "clamp(13px, 2vw, 18px)",
          fontStyle: "italic", padding: "13px 32px", borderRadius: "50px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          zIndex: 25, maxWidth: "80vw", textAlign: "center", lineHeight: 1.6,
        }}>
          {`"Hmm... what's on that table, ${playerName}? A cake and a bottle... how curious!"`}
        </div>
      )}

      {/* Fade out overlay */}
      <div style={{
        position: "absolute", inset: 0, background: "#000",
        opacity: fadingOut ? 1 : 0, transition: "opacity 1.2s ease",
        zIndex: 30, pointerEvents: "none",
      }} />

      {/* Back button */}
      {!showConfirm && (
        <button onClick={handleBack} style={backBtn}>← Back</button>
      )}

      {/* Confirm popup */}
      {showConfirm && (
        <div style={overlay}>
          <div style={popup}>
            <p style={popupText}>Want to go back to the garden? 🌸</p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
              <button onClick={() => onBack()} style={btnYes}>Yes, back to garden</button>
              <button onClick={() => setShowConfirm(false)} style={btnNo}>Keep exploring!</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes itemPulse {
          0%,100% { transform: scale(1);    opacity: 0.8; }
          50%     { transform: scale(1.18); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}

const backBtn = {
  position: "absolute", top: "3%", left: "2%",
  background: "rgba(255,255,255,0.85)", color: "#6b21a8",
  fontFamily: "Cormorant Garamond, serif", fontWeight: "bold",
  fontSize: "clamp(12px,1.5vw,15px)", padding: "8px 20px",
  borderRadius: "50px", border: "none", cursor: "pointer",
  zIndex: 30, boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
};
const overlay = {
  position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
};
const popup = {
  background: "rgba(255,255,255,0.97)", borderRadius: "24px",
  padding: "40px 48px", textAlign: "center",
  boxShadow: "0 8px 40px rgba(0,0,0,0.3)", maxWidth: "90vw",
};
const popupText = {
  fontFamily: "Cormorant Garamond, serif",
  fontSize: "clamp(16px,2.5vw,24px)", color: "#4a1a6b", marginBottom: "24px",
};
const btnYes = {
  fontFamily: "Cormorant Garamond, serif",
  fontSize: "clamp(13px,1.8vw,18px)", color: "#fff",
  background: "linear-gradient(135deg,#e8a4b8,#c48b9f)",
  border: "none", borderRadius: "50px", padding: "10px 28px",
  cursor: "pointer", boxShadow: "0 4px 16px rgba(196,139,159,0.4)",
};
const btnNo = {
  fontFamily: "Cormorant Garamond, serif",
  fontSize: "clamp(13px,1.8vw,18px)", color: "#fff",
  background: "linear-gradient(135deg,#9b59b6,#6b21a8)",
  border: "none", borderRadius: "50px", padding: "10px 28px",
  cursor: "pointer", boxShadow: "0 4px 16px rgba(107,33,168,0.4)",
};
