import { useEffect, useRef, useState } from 'react';
import { registerAudio, stopAll } from '../audioRegistry';

// ─── Combo puzzle helpers ─────────────────────────────────────
const SYMBOL_POOL = ['🍄','👑','🌹','🗝️','⭐','🎩'];

function generateCombo() {
  const pool = [...SYMBOL_POOL];
  const combo = [];
  while (combo.length < 3) {
    const idx = Math.floor(Math.random() * pool.length);
    combo.push(pool.splice(idx, 1)[0]);
  }
  return combo;
}

export default function MysteryRoomOpen({ playerName, wonRose, onRoyal, onMushroom, onBack }) {

  const [girlX,      setGirlX]      = useState(wonRose ? 68 : 15);
  const [girlBottom, setGirlBottom] = useState(wonRose ? 24 : 20);
  const [girlSize,   setGirlSize]   = useState(0.6);
  const [girlImg,    setGirlImg]    = useState(wonRose ? '/girl-rose.png' : '/wearingBackpack-Idle.png');
  const [phase,      setPhase]      = useState('entering');
  const [showGlow,   setShowGlow]   = useState(false);
  const [caption,    setCaption]    = useState(null);
  const [fadingOut,  setFadingOut]  = useState(false);

  // ── Combo puzzle state ────────────────────────────────────────
  const [showPuzzle,  setShowPuzzle]  = useState(false);
  const [combo,       setCombo]       = useState([]);
  const [showing,     setShowing]     = useState(true); // true = symbols visible
  const [tapped,      setTapped]      = useState([]);
  const [tries,       setTries]       = useState(0);
  const [pFeedback,   setPFeedback]   = useState(null); // 'right'|'wrong'|null
  const doneRef = useRef(false);

  const voiceRef = useRef(null);
  const timers   = useRef([]);

  function addTimer(t) { timers.current.push(t); }
  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = []; }

  function playVoice(src, onEnded) {
    if (voiceRef.current) {
      voiceRef.current.onended = null;
      voiceRef.current.pause();
      voiceRef.current.src = '';
    }
    const a = registerAudio(new Audio(src));
    voiceRef.current = a;
    a.volume = 1.0;
    a.play().catch(() => {});
    if (onEnded) a.onended = onEnded;
    return a;
  }

  function stopVoice() {
    if (voiceRef.current) {
      voiceRef.current.onended = null;
      voiceRef.current.pause();
      voiceRef.current.src = '';
      voiceRef.current = null;
    }
  }

  // ── Entry sequence ────────────────────────────────────────────
  useEffect(() => {
    // Walk to center
    addTimer(setTimeout(() => {
      setGirlX(42); setGirlBottom(10); setGirlSize(3);
    }, 300));

    if (wonRose) {
      // Visit 2 — play mr_open_entry voice as girl walks in
      addTimer(setTimeout(() => {
        playVoice('/audio/voice_over/mr_open_entry.mp3', () => {
          // After entry voice → show glow + caption
          setGirlImg('/girl-pointingRight.png');
          setPhase('idle');
          setShowGlow(true);
          setCaption('"The mushroom door is glowing... what\'s the secret combination? 🍄"');
        });
      }, 800));
      // Also show glow after 3s as fallback even if voice hasn't ended
      addTimer(setTimeout(() => {
        setGirlImg('/girl-pointingRight.png');
        setPhase('idle');
        setShowGlow(true);
        setCaption('"The mushroom door is glowing... what\'s the secret combination? 🍄"');
      }, 3200));
    } else {
      // Visit 1 — royal court door glows
      addTimer(setTimeout(() => {
        setGirlImg('/girl-back-headtop.png');
        setPhase('idle');
        setShowGlow(true);
        setCaption('"I have the map fragment! The Royal Court door is open — let\'s go! 👑"');
        playVoice('/audio/voice_over/rc_door_open.mp3');
      }, 2800));
    }

    return () => { clearTimers(); stopVoice(); };
  }, [wonRose]);

  // ── Door / glow click ─────────────────────────────────────────
  function handleGlowClick() {
    if (phase !== 'idle') return;
    stopVoice();
    if (!wonRose) {
      // Visit 1 → go to royal court
      setFadingOut(true);
      addTimer(setTimeout(() => onRoyal(), 1000));
    } else {
      // Visit 2 → show combo puzzle
      const newCombo = generateCombo();
      setCombo(newCombo);
      setShowing(true);
      setTapped([]);
      setTries(0);
      setPFeedback(null);
      doneRef.current = false;
      setShowGlow(false);
      setCaption(null);
      setShowPuzzle(true);
      setPhase('puzzle');
      // Play combo voice
      playVoice('/audio/voice_over/mr_combo.mp3');
      // Hide symbols after 3 seconds
      addTimer(setTimeout(() => setShowing(false), 1100));
    }
  }

  // ── Combo tap ─────────────────────────────────────────────────
  function handleTap(symbol) {
    if (doneRef.current || showing) return;
    const next = [...tapped, symbol];
    setTapped(next);

    // Check so far
for (let i = 0; i < next.length; i++) {
  if (next[i] !== combo[i]) {
    // Only count a try when all 3 taps are done — wrong on last tap
    const isFullAttempt = next.length === 3 || i === next.length - 1;
    const newTries = isFullAttempt ? tries + 1 : tries;
    if (isFullAttempt) setTries(newTries);
    setPFeedback('wrong');
    playVoice('/audio/voice_over/mr_combo_wrong.mp3');
    addTimer(setTimeout(() => {
  setPFeedback(null);
  setTapped([]);
  if (newTries >= 3) {
    handleComboWin();
  } else {
    setShowing(true);
    playVoice('/audio/voice_over/mr_combo_wrong.mp3');
    addTimer(setTimeout(() => setShowing(false), 7000));
  }
}, 1200));
    return;
  }
}

    // All 3 correct
    if (next.length === 3) {
      handleComboWin();
    }
  }

  function handleComboWin() {
    if (doneRef.current) return;
    doneRef.current = true;
    setPFeedback('right');
    stopVoice();
    playVoice('/audio/voice_over/mr_combo_win.mp3');
    addTimer(setTimeout(() => {
      setShowPuzzle(false);
      setFadingOut(true);
      addTimer(setTimeout(() => onMushroom(), 1200));
    }, 2000));
  }

  // ── Glow positions ────────────────────────────────────────────
  const royalGlow = {
    left: '56%', top: '12%', width: '16%', height: '50%',
    shadow: '0 0 70px 35px rgba(255,80,120,0.55)',
    bg:     'rgba(255,100,140,0.25)',
    label:  '👑 Enter Royal Court!',
  };
  const mushroomGlow = {
    left: '82%', top: '22%', width: '13%', height: '40%',
    shadow: '0 0 70px 35px rgba(255,190,60,0.65)',
    bg:     'rgba(255,200,80,0.3)',
    label:  '🍄 Open the Door!',
  };
  const glow = wonRose ? mushroomGlow : royalGlow;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#1a0a0a' }}>

      {/* Background */}
      <img
        src={wonRose ? '/background-images/MR-open.png' : '/background-images/MR-royal-tea-firefly.png'}
        alt="mystery room"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* Door glow */}
      {showGlow && (
        <>
          <div style={{
            position: 'absolute', left: glow.left, top: glow.top,
            width: glow.width, height: glow.height,
            background: glow.bg, boxShadow: glow.shadow,
            borderRadius: '8px 8px 50% 50% / 8px 8px 20px 20px',
            animation: 'doorPulse 2s ease-in-out infinite',
            zIndex: 15, pointerEvents: 'none',
          }} />
          <div onClick={handleGlowClick} style={{
            position: 'absolute', left: glow.left, top: glow.top,
            width: glow.width, height: glow.height,
            cursor: phase === 'idle' ? 'pointer' : 'default',
            zIndex: 16, borderRadius: '8px 8px 50% 50% / 8px 8px 20px 20px',
          }} />
          <div style={{
            position: 'absolute', left: glow.left,
            top: `calc(${glow.top} - 40px)`,
            width: glow.width, textAlign: 'center',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(11px, 1.4vw, 14px)', fontWeight: 'bold',
            color: '#fff', background: 'rgba(0,0,0,0.6)',
            borderRadius: '20px', padding: '5px 12px',
            zIndex: 17, animation: 'labelBounce 2s ease-in-out infinite',
            whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>{glow.label}</div>
        </>
      )}

      {/* Girl */}
      <img src={girlImg} alt="girl" style={{
        position: 'absolute', bottom: `${girlBottom}%`, left: `${girlX}%`,
        height: `${girlSize * 14}vh`, transform: 'translateX(-50%)',
        transformOrigin: 'bottom center',
        transition: phase === 'entering'
          ? 'left 2.4s ease-out, bottom 2s ease-out, height 2.2s ease-out'
          : 'height 0.4s ease',
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))', zIndex: 10,
      }} />

      {/* Caption */}
      {caption && phase === 'idle' && (
        <div style={{
          position: 'absolute', bottom: '4%', left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.93)', color: '#5b1f8a',
          fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(12px,1.8vw,16px)',
          fontStyle: 'italic', padding: '12px 28px', borderRadius: '50px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          zIndex: 20, maxWidth: '78vw', textAlign: 'center', lineHeight: 1.6,
          animation: 'bubblePop 0.4s ease-out',
        }}>{caption}</div>
      )}

      {/* ── COMBO PUZZLE OVERLAY ── */}
      {showPuzzle && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10, 4, 18, 0.82)', backdropFilter: 'blur(5px)',
        }}>
          <div style={{
            background: 'linear-gradient(160deg, #1a0a20 0%, #2d1540 100%)',
            border: '2px solid rgba(255,200,100,0.25)',
            borderRadius: '24px', padding: '32px 36px',
            maxWidth: 'min(560px, 92vw)', width: '100%',
            boxShadow: '0 0 60px rgba(200,150,50,0.15), 0 8px 40px rgba(0,0,0,0.6)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(13px,1.6vw,15px)',
              color: 'rgba(255,220,150,0.8)',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: 16,
            }}>🍄 Secret Combination 🍄</div>

            <div style={{
              fontFamily: 'Lora, serif', fontStyle: 'italic',
              fontSize: 'clamp(13px,1.8vw,16px)',
              color: pFeedback === 'wrong' ? '#ff8080' : 'rgba(255,230,180,0.9)',
              marginBottom: 20,
              animation: pFeedback === 'wrong' ? 'shakeIt 0.4s ease' : 'none',
            }}>
              {pFeedback === 'right'
                ? '🎉 The door is opening!'
                : pFeedback === 'wrong'
                ? "Not quite! Watch the symbols again..."
                : showing
                ? 'Remember the order...'
                : 'Now tap them in the same order!'
              }
            </div>

            {/* Combo symbols — visible briefly then hidden */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: 16, marginBottom: 28,
            }}>
              {combo.map((sym, i) => (
                <div key={i} style={{
                  fontSize: 'clamp(32px,5vw,48px)',
                  background: showing ? 'rgba(255,220,100,0.2)' : 'rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: '12px 16px',
                  border: showing
                    ? '2px solid rgba(255,220,100,0.5)'
                    : '2px dashed rgba(255,255,255,0.2)',
                  transition: 'all 0.5s ease',
                  minWidth: 70, minHeight: 70,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  filter: showing ? 'none' : 'blur(8px)',
                  boxShadow: showing ? '0 0 20px rgba(255,220,100,0.3)' : 'none',
                }}>
                  {showing ? sym : '?'}
                </div>
              ))}
            </div>

            {/* Tapped progress */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: 12, marginBottom: 24,
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: tapped[i]
                    ? 'rgba(255,220,100,0.3)'
                    : 'rgba(255,255,255,0.06)',
                  border: tapped[i]
                    ? '2px solid rgba(255,220,100,0.6)'
                    : '2px dashed rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, transition: 'all 0.3s ease',
                }}>
                  {tapped[i] || ''}
                </div>
              ))}
            </div>

            {/* Symbol buttons */}
            {!showing && pFeedback !== 'right' && (
              <div style={{
                display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
              }}>
                {SYMBOL_POOL.map((sym, i) => (
                  <button key={i} onClick={() => handleTap(sym)} style={{
                    fontSize: 'clamp(24px,3.5vw,36px)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: 14, padding: '10px 14px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>{sym}</button>
                ))}
              </div>
            )}

            {/* Tries indicator */}
            <div style={{
              marginTop: 16,
              fontFamily: 'Lora, serif', fontStyle: 'italic',
              fontSize: 'clamp(11px,1.4vw,13px)',
              color: 'rgba(255,200,150,0.5)',
            }}>
              {tries > 0 && `Attempt ${tries} of 2`}
            </div>
          </div>
        </div>
      )}

      {/* Fade overlay */}
      <div style={{
        position: 'absolute', inset: 0, background: '#000',
        opacity: fadingOut ? 1 : 0, transition: 'opacity 1s ease',
        zIndex: 50, pointerEvents: 'none',
      }} />

      {/* Back button */}
      {phase === 'idle' && !fadingOut && (
        <button onClick={() => { stopVoice(); onBack(); }} style={{
          position: 'absolute', top: '3%', left: '2%',
          background: 'rgba(255,255,255,0.85)', color: '#6b21a8',
          fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold',
          fontSize: 'clamp(12px,1.5vw,15px)', padding: '8px 20px',
          borderRadius: '50px', border: 'none', cursor: 'pointer',
          zIndex: 30, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>← Back</button>
      )}

      <style>{`
        @keyframes doorPulse {
          0%,100% { opacity: 0.75; transform: scale(1); }
          50%     { opacity: 1;    transform: scale(1.03); }
        }
        @keyframes labelBounce {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-5px); }
        }
        @keyframes bubblePop {
          0%   { opacity: 0; transform: translateX(-50%) scale(0.9) translateY(8px); }
          100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
        @keyframes shakeIt {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-8px); }
          75%     { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
