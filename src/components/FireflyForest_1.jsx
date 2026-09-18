import { useEffect, useRef, useState } from "react";
import { registerAudio, stopAll } from "../audioRegistry";

// ─── Math question pool ───────────────────────────────────────
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathQuestion() {
  const type = ['add', 'sub', 'mul'][Math.floor(Math.random() * 3)];
  if (type === 'add') {
    const a = randBetween(2, 6), b = randBetween(2, 6);
    return { type, a, b, answer: a + b, audio: '/audio/voice_over/fff_math_add.mp3' };
  }
  if (type === 'sub') {
    const a = randBetween(6, 10), b = randBetween(2, 4);
    return { type, a, b, answer: a - b, audio: '/audio/voice_over/fff_math_sub.mp3' };
  }
  // mul
  const a = randBetween(2, 3);
  return { type, a, b: 6, answer: a * 6, audio: '/audio/voice_over/fff_math_mul.mp3' };
}

// ─── Science question pool ────────────────────────────────────
const SCI_QUESTIONS = [
  {
    id: 1,
    text: "Fireflies flash their light to talk to each other! How do YOU talk to your friends?",
    options: ["👋 Wave & Speak", "😴 Go to Sleep", "🏃 Run Away"],
    correct: 0,
    audio: '/audio/voice_over/fff_sci_1.mp3',
    emoji: '🦋',
  },
  {
    id: 2,
    text: "Trees give us something very important that we breathe every day. What is it?",
    options: ["💨 Air", "🏖️ Sand", "💧 Water"],
    correct: 0,
    audio: '/audio/voice_over/fff_sci_2.mp3',
    emoji: '🌳',
  },
  {
    id: 3,
    text: "Fireflies only come out at a special time of day. When do you think that is?",
    options: ["🌙 At Night", "🌧️ When Raining", "🍽️ Lunchtime"],
    correct: 0,
    audio: '/audio/voice_over/fff_sci_3.mp3',
    emoji: '✨',
  },
  {
    id: 4,
    text: "Leaves are like tiny kitchens! They cook their own food. What do they need?",
    options: ["☀️ Sunlight", "💨 Wind", "🪨 Rocks"],
    correct: 0,
    audio: '/audio/voice_over/fff_sci_4.mp3',
    emoji: '🍃',
  },
];

function pickSciQuestion() {
  return SCI_QUESTIONS[Math.floor(Math.random() * SCI_QUESTIONS.length)];
}

// ─── Component ────────────────────────────────────────────────
export default function FireflyForest({ playerName, onNext, onBack }) {
  const [girlX,      setGirlX]      = useState(15);
  const [girlBottom, setGirlBottom] = useState(5);
  const [girlSize,   setGirlSize]   = useState(0.8);
  const [girlImg,    setGirlImg]    = useState("/girl-back-headtop.png");
  const [showCaption,setShowCaption]= useState(false);
  const [showClick,  setShowClick]  = useState(false);
  const [showKey,    setShowKey]    = useState(false);
  const [fadingOut,  setFadingOut]  = useState(false);
  const [bgSrc,      setBgSrc]      = useState("/background-images/Firefly-entry.png");
  const [bgZoomed,   setBgZoomed]   = useState(false);
  const [girlPhase,  setGirlPhase]  = useState("walking");
  const [scene,      setScene]      = useState(1);
  const [showReturn, setShowReturn] = useState(false);

  // Quiz state
  const [showQuiz,   setShowQuiz]   = useState(false);
  const [mathQ,      setMathQ]      = useState(null);
  const [sciQ,       setSciQ]       = useState(null);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathDone,   setMathDone]   = useState(false);
  const [sciDone,    setSciDone]    = useState(false);
  const [tries,      setTries]      = useState(0);
  const [feedback,   setFeedback]   = useState(null); // 'right'|'wrong'|null
  const [sciFeedback,setSciFeedback]= useState(null);

  // Audio refs — one per voiceover so we can stop each individually
  const entryAudioRef   = useRef(null);
  const pickupAudioRef  = useRef(null);
  const quizAudioRef    = useRef(null);
  const timers          = useRef([]);

  function addTimer(t) { timers.current.push(t); }
  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  function stopAudio(ref) {
    if (ref.current) {
      ref.current.onended = null;
      ref.current.pause();
      ref.current.src = '';
      ref.current = null;
    }
  }

  // ── Scene 1 startup ──────────────────────────────────────────
  useEffect(() => {
    addTimer(setTimeout(() => { setGirlX(50); setGirlBottom(18); setGirlSize(1.6); }, 300));
    addTimer(setTimeout(() => {
      setGirlPhase("idle");
      setGirlImg("/girl-back-headtop.png");
      setShowCaption(true);
      // Play fr_entry voiceover
      const a = registerAudio(new Audio('/audio/voice_over/fr_entry.mp3'));
      entryAudioRef.current = a;
      a.volume = 1.0;
      a.play().catch(() => {});
    }, 3000));
    addTimer(setTimeout(() => setShowClick(true), 5000));
    return () => clearTimers();
  }, []);

  // ── Scene 1 click — walk into forest ─────────────────────────
  function handleForestClick() {
    if (!showClick) return;
    // Stop entry voice immediately
    stopAudio(entryAudioRef);
    setShowClick(false);
    setShowCaption(false);
    setGirlImg("/girl-back.png");
    setGirlPhase("shrinking");
    setBgZoomed(true);

    addTimer(setTimeout(() => {
      setBgSrc("/background-images/Firefly-Brasskey.png");
      setBgZoomed(false);
      setScene(2);
      startScene2();
    }, 3800));
  }

  // ── Scene 2 ──────────────────────────────────────────────────
  function startScene2() {
    addTimer(setTimeout(() => {
      setGirlPhase("idle");
      setGirlImg("/girl-back-headtop.png");
      setGirlSize(0.8); setGirlX(10); setGirlBottom(5);
    }, 800));
    addTimer(setTimeout(() => {
      setGirlPhase("walking");
      setGirlX(48); setGirlBottom(18); setGirlSize(2);
    }, 1000));
    addTimer(setTimeout(() => {
      setGirlPhase("idle");
      setGirlImg("/girl-sitting.png");
      setGirlX(42); setGirlBottom(18); setGirlSize(1.6);
    }, 3800));
    addTimer(setTimeout(() => {
      setShowCaption(true);
      // Play fr_pick_up_key voiceover
      const a = registerAudio(new Audio('/audio/voice_over/fr_pick_up_key.mp3'));
      pickupAudioRef.current = a;
      a.volume = 1.0;
      a.play().catch(() => {});
    }, 4200));
    addTimer(setTimeout(() => setShowKey(true), 6000));
  }

  // ── Key click — stop voice, show quiz ────────────────────────
  function handleKeyClick() {
    if (!showKey) return;
    // Stop pickup voice immediately
    stopAudio(pickupAudioRef);
    setShowKey(false);
    setShowCaption(false);

    // Generate questions
    const mq = generateMathQuestion();
    const sq = pickSciQuestion();
    setMathQ(mq);
    setSciQ(sq);
    setMathDone(false);
    setSciDone(false);
    setTries(0);
    setFeedback(null);
    setSciFeedback(null);
    setMathAnswer('');
    setShowQuiz(true);

    // Play math question audio
    addTimer(setTimeout(() => {
      const a = registerAudio(new Audio(mq.audio));
      quizAudioRef.current = a;
      a.volume = 1.0;
      a.play().catch(() => {});
    }, 400));
  }

  // ── Stop quiz audio helper ────────────────────────────────────
  function stopQuizAudio() { stopAudio(quizAudioRef); }

  // ── Math submit ───────────────────────────────────────────────
  function handleMathSubmit() {
    const guess = parseInt(mathAnswer.trim(), 10);
    if (isNaN(guess)) return;
    stopQuizAudio();

    if (guess === mathQ.answer) {
      setFeedback('right');
      setMathAnswer('');
      // After short pause show science question
      addTimer(setTimeout(() => {
        setFeedback(null);
        setMathDone(true);
        // Play science audio
        const a = registerAudio(new Audio(sciQ.audio));
        quizAudioRef.current = a;
        a.volume = 1.0;
        a.play().catch(() => {});
      }, 1200));
    } else {
      const newTries = tries + 1;
      setTries(newTries);
      if (newTries >= 4) { autoPass(); return; }
      setFeedback('wrong');
      setMathAnswer('');
      addTimer(setTimeout(() => setFeedback(null), 1200));
    }
  }

  // ── Science submit ────────────────────────────────────────────
  function handleSciSubmit(index) {
    stopQuizAudio();
    if (index === sciQ.correct) {
      setSciFeedback('right');
      addTimer(setTimeout(() => {
        setSciDone(true);
        setShowQuiz(false);
        proceedToScene3();
      }, 1200));
    } else {
      const newTries = tries + 1;
      setTries(newTries);
      if (newTries >= 4) { autoPass(); return; }
      setSciFeedback('wrong');
      addTimer(setTimeout(() => setSciFeedback(null), 1200));
    }
  }

  // ── Auto pass on 4th fail ─────────────────────────────────────
  function autoPass() {
    stopQuizAudio();
    setShowQuiz(false);
    proceedToScene3();
  }

  // ── Scene 3 — girl picks up key ───────────────────────────────
  function proceedToScene3() {
    setBgSrc("/background-images/Firefly-entry.png");
    setScene(3);
    setGirlImg("/girl-holdingKey.png");
    setGirlPhase("idle");
    setGirlSize(2.0); setGirlX(55); setGirlBottom(20);

    addTimer(setTimeout(() => {
      setGirlImg("/wearingBackpack-Idle.png");
      setGirlSize(2.0); setGirlX(48); setGirlBottom(20);

      // Play fff_return voice when girl stands up
      const a = registerAudio(new Audio('/audio/voice_over/fff_return.mp3'));
      quizAudioRef.current = a;
      a.volume = 1.0;
      a.play().catch(() => {});
      // Show return button after voice ends (or after 6s fallback)
      a.onended = () => setShowReturn(true);
      addTimer(setTimeout(() => setShowReturn(true), 6000));
    }, 5000));

    addTimer(setTimeout(() => setShowCaption(true), 3500));
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      overflow: "hidden", background: "#0a1a0a",
    }}>

      {/* Background */}
      <img src={bgSrc} alt="firefly forest" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", transformOrigin: "50% 35%",
        animation: bgZoomed ? "forestZoomIn 4s ease-in forwards" : "none",
      }} />

      {/* Girl — hidden behind quiz panel but visible on side */}
      {!showQuiz && (
        <img src={girlImg} alt="girl" style={{
          position: "absolute",
          bottom: `${girlBottom}%`, left: `${girlX}%`,
          height: `${girlSize * 14}vh`,
          transform: "translateX(-50%)",
          transformOrigin: "bottom center",
          transition: girlPhase === "walking"
            ? "left 2.5s ease-out, bottom 2.5s ease-out, height 2.5s ease-out"
            : "none",
          animation: girlPhase === "shrinking"
            ? "walkIntoForest 4s ease-in forwards" : "none",
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
          zIndex: 10,
        }} />
      )}

      {/* Scene 1 click zone */}
      {showClick && scene === 1 && (
        <div onClick={handleForestClick} style={{
          position: "absolute", left: "30%", top: "20%",
          width: "40%", height: "60%", cursor: "pointer", zIndex: 20,
        }} />
      )}

      {/* Scene 2 key glow + click zone */}
      {showKey && scene === 2 && (
        <div onClick={handleKeyClick} style={{
          position: "absolute", left: "50%", top: "57%",
          width: "120px", height: "120px",
          transform: "translateX(-50%)",
          cursor: "pointer", zIndex: 20, borderRadius: "50%",
          boxShadow: "0 0 40px 20px rgba(255,200,60,0.7)",
          animation: "keyPulse 1.5s ease-in-out infinite",
        }} />
      )}

      {/* Caption */}
      {showCaption && !showQuiz && (
        <div style={{
          position: "absolute", bottom: "5%", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.93)", color: "#1a4a1a",
          fontFamily: "Lora, Georgia, serif", fontSize: "clamp(13px, 2vw, 18px)",
          fontStyle: "italic", padding: "13px 32px", borderRadius: "50px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          zIndex: 25, maxWidth: "80%", textAlign: "center", lineHeight: 1.6,
        }}>
          {scene === 1
            ? `Ooh... fireflies! Let's explore deeper into the forest, ${playerName}...`
            : scene === 2
            ? "Wait... what's that glowing over there? ✨ Click the key!"
            : "We found the key! Let's head back to the Mystery Room! 🗝️"
          }
        </div>
      )}

      {/* Click hint scene 1 */}
      {showClick && scene === 1 && (
        <div onClick={handleForestClick} style={{
          position: "absolute", bottom: "14%", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.9)", color: "#1a4a1a",
          fontFamily: "Cormorant Garamond, serif", fontWeight: "bold",
          fontSize: "clamp(12px, 1.8vw, 16px)", padding: "8px 22px",
          borderRadius: "50px", zIndex: 25, cursor: "pointer",
          whiteSpace: "nowrap", animation: "pulseBubble 2s ease-in-out infinite",
        }}>
          ✨ Walk deeper into the forest!
        </div>
      )}

      {/* ── QUIZ PANEL ── */}
      {showQuiz && mathQ && sciQ && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(5, 20, 5, 0.75)", backdropFilter: "blur(6px)",
        }}>
          {/* Girl on the side */}
          <img src="/girl-sitting.png" alt="girl" style={{
            position: "absolute", bottom: "2%", left: "2%",
            height: "clamp(120px, 22vh, 200px)",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
            zIndex: 41,
          }} />

          {/* Panel */}
          <div style={{
            background: "linear-gradient(160deg, #0d2e0d 0%, #1a4a1a 100%)",
            border: "2px solid rgba(100,255,100,0.25)",
            borderRadius: "24px",
            padding: "28px 32px",
            maxWidth: "min(580px, 90vw)",
            width: "100%",
            boxShadow: "0 0 60px rgba(50,200,50,0.15), 0 8px 40px rgba(0,0,0,0.6)",
            zIndex: 42,
            position: "relative",
          }}>

            {/* ── MATH QUESTION ── */}
            {!mathDone && (
              <div>
                <div style={{
                  textAlign: "center", marginBottom: "20px",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(13px, 1.6vw, 15px)",
                  color: "rgba(180,255,180,0.7)", letterSpacing: "2px",
                  textTransform: "uppercase",
                }}>
                  🌿 Forest Maths 🌿
                </div>

                {/* Visual equation */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "12px", marginBottom: "24px", flexWrap: "wrap",
                }}>
                  {mathQ.type === 'add' && <>
                    <EmojiCount emoji="✨" count={mathQ.a} color="#fffb80" />
                    <Op>+</Op>
                    <EmojiCount emoji="✨" count={mathQ.b} color="#fffb80" />
                    <Op>=</Op>
                    <QMark />
                  </>}
                  {mathQ.type === 'sub' && <>
                    <EmojiCount emoji="🍄" count={mathQ.a} color="#90ee90" glowing />
                    <Op>−</Op>
                    <EmojiCount emoji="🍄" count={mathQ.b} color="#555" dim />
                    <Op>=</Op>
                    <QMark />
                  </>}
                  {mathQ.type === 'mul' && <>
                    <EmojiCount emoji="🦋" count={mathQ.a} color="#fffb80" />
                    <Op>×</Op>
                    <span style={{ fontSize: "clamp(18px,2.5vw,26px)", color: "#90ee90", fontWeight: "bold", fontFamily: "Cormorant Garamond, serif" }}>6 legs</span>
                    <Op>=</Op>
                    <QMark />
                  </>}
                </div>

                {/* Math prompt text */}
                <div style={{
                  textAlign: "center", color: feedback === 'wrong' ? "#ff8080" : "#c8f0c8",
                  fontFamily: "Lora, serif", fontSize: "clamp(13px,1.8vw,16px)",
                  fontStyle: "italic", marginBottom: "20px", lineHeight: 1.5,
                  animation: feedback === 'wrong' ? "shakeIt 0.4s ease" : "none",
                }}>
                  {feedback === 'wrong'
                    ? "Hmm, not quite! Try again! 🤔"
                    : feedback === 'right'
                    ? "🎉 Brilliant! You got it!"
                    : mathQ.type === 'add'
                      ? "Count both groups of fireflies — how many altogether?"
                      : mathQ.type === 'sub'
                      ? "Some mushrooms went dark! How many are still glowing?"
                      : "Every firefly has 6 legs — how many legs altogether?"
                  }
                </div>

                {feedback !== 'right' && (
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", alignItems: "center" }}>
                    <input
                      type="number" value={mathAnswer}
                      onChange={e => setMathAnswer(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleMathSubmit(); }}
                      placeholder="?" min="0" max="99"
                      style={{
                        width: "70px", textAlign: "center",
                        fontFamily: "Cormorant Garamond, serif", fontSize: "24px",
                        fontWeight: "bold", color: "#1a4a1a",
                        background: "rgba(255,255,255,0.92)",
                        border: feedback === 'wrong' ? "2px solid #ff6060" : "2px solid rgba(100,255,100,0.4)",
                        borderRadius: "50px", padding: "8px 12px", outline: "none",
                      }}
                    />
                    <button onClick={handleMathSubmit} style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "clamp(13px,1.6vw,16px)", color: "#fff",
                      background: "linear-gradient(135deg, #2d7a2d, #1a4a1a)",
                      border: "2px solid rgba(100,255,100,0.3)",
                      borderRadius: "50px", padding: "10px 24px",
                      cursor: "pointer", boxShadow: "0 4px 14px rgba(0,100,0,0.4)",
                      whiteSpace: "nowrap",
                    }}>
                      That's my answer! ✨
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── SCIENCE QUESTION ── */}
            {mathDone && !sciDone && sciQ && (
              <div>
                <div style={{
                  textAlign: "center", marginBottom: "16px",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(13px, 1.6vw, 15px)",
                  color: "rgba(180,255,180,0.7)", letterSpacing: "2px",
                  textTransform: "uppercase",
                }}>
                  🌿 Forest Science 🌿
                </div>

                <div style={{ textAlign: "center", fontSize: "clamp(36px,6vw,56px)", marginBottom: "12px" }}>
                  {sciQ.emoji}
                </div>

                <div style={{
                  textAlign: "center",
                  color: sciFeedback === 'wrong' ? "#ff8080" : "#c8f0c8",
                  fontFamily: "Lora, serif", fontSize: "clamp(13px,1.8vw,16px)",
                  fontStyle: "italic", marginBottom: "24px", lineHeight: 1.6,
                  animation: sciFeedback === 'wrong' ? "shakeIt 0.4s ease" : "none",
                }}>
                  {sciFeedback === 'wrong'
                    ? "Oops! Have another think! 🤔"
                    : sciQ.text
                  }
                </div>

                <div style={{
                  display: "flex", flexDirection: "column", gap: "10px",
                }}>
                  {sciQ.options.map((opt, i) => (
                    <button key={i} onClick={() => handleSciSubmit(i)} style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "clamp(14px,1.8vw,18px)", color: "#fff",
                      background: sciFeedback === 'right' && i === sciQ.correct
                        ? "linear-gradient(135deg, #2d7a2d, #1a9a1a)"
                        : sciFeedback === 'wrong' && i === sciQ.correct
                        ? "linear-gradient(135deg, #2d7a2d, #1a4a1a)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                      border: "1px solid rgba(100,255,100,0.25)",
                      borderRadius: "50px", padding: "12px 24px",
                      cursor: "pointer", textAlign: "left",
                      transition: "background 0.2s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}>
                      {opt}
                    </button>
                  ))}
                </div>

                {sciFeedback === 'right' && (
                  <div style={{
                    textAlign: "center", marginTop: "16px",
                    color: "#7fff7f", fontFamily: "Cormorant Garamond, serif",
                    fontSize: "clamp(15px,2vw,20px)", fontWeight: "bold",
                    animation: "bubblePop 0.4s ease-out",
                  }}>
                    🎉 That's right! Amazing!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return button scene 3 */}
      {showReturn && (
        <div onClick={() => {
          stopAll();
          setFadingOut(true);
          setTimeout(() => onNext(), 1200);
        }} style={{
          position: "absolute", bottom: "14%", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.95)", color: "#6b21a8",
          fontFamily: "Cormorant Garamond, serif", fontWeight: "bold",
          fontSize: "clamp(13px, 2vw, 18px)", padding: "12px 32px",
          borderRadius: "50px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          zIndex: 25, cursor: "pointer", whiteSpace: "nowrap",
          animation: "pulseBubble 2s ease-in-out infinite",
        }}>
          🗝️ Back to Mystery Room!
        </div>
      )}

      {/* Fade overlay */}
      <div style={{
        position: "absolute", inset: 0, background: "#000",
        opacity: fadingOut ? 1 : 0, transition: "opacity 1.2s ease",
        zIndex: 30, pointerEvents: "none",
      }} />

      {/* Back button */}
      <button onClick={() => { stopAll(); onBack(); }} style={{
        position: "absolute", top: "3%", left: "2%",
        background: "rgba(255,255,255,0.85)", color: "#1a4a1a",
        fontFamily: "Cormorant Garamond, serif", fontWeight: "bold",
        fontSize: "clamp(12px,1.5vw,15px)", padding: "8px 20px",
        borderRadius: "50px", border: "none", cursor: "pointer",
        zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}>← Back</button>

      <style>{`
        @keyframes walkIntoForest {
          0%   { transform: translateX(-50%) translateY(0%) scale(1); opacity: 1; }
          60%  { transform: translateX(-50%) translateY(-100%) scale(0.4); opacity: 0.3; }
          100% { transform: translateX(-50%) translateY(-200%) scale(0.05); opacity: 0; }
        }
        @keyframes forestZoomIn {
          0%   { transform: scale(1); }
          100% { transform: scale(1.4); }
        }
        @keyframes pulseBubble {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%     { transform: translateX(-50%) scale(1.07); }
        }
        @keyframes keyPulse {
          0%,100% { box-shadow: 0 0 40px 20px rgba(255,200,60,0.6); }
          50%     { box-shadow: 0 0 60px 30px rgba(255,220,80,0.9); }
        }
        @keyframes shakeIt {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-8px); }
          75%     { transform: translateX(8px); }
        }
        @keyframes bubblePop {
          0%   { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Small helper components for math visuals ─────────────────
function EmojiCount({ emoji, count, color, glowing, dim }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "160px", justifyContent: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{
          fontSize: "clamp(18px,2.5vw,26px)",
          filter: dim ? "grayscale(1) brightness(0.4)" : glowing ? "drop-shadow(0 0 6px #90ee90)" : "none",
          opacity: dim ? 0.5 : 1,
        }}>{emoji}</span>
      ))}
    </div>
  );
}

function Op({ children }) {
  return (
    <span style={{
      fontSize: "clamp(22px,3vw,32px)", color: "#90ee90",
      fontWeight: "bold", fontFamily: "Cormorant Garamond, serif",
      flexShrink: 0,
    }}>{children}</span>
  );
}

function QMark() {
  return (
    <span style={{
      fontSize: "clamp(28px,4vw,42px)", color: "#fffb80",
      fontWeight: "bold", fontFamily: "Cormorant Garamond, serif",
      animation: "bubblePop 0.6s ease-out",
    }}>?</span>
  );
}
