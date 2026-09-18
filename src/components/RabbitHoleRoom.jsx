import { useEffect, useRef, useState } from 'react';
import { registerAudio } from '../audioRegistry';

// ── Generate random emoji positions for Q3 ───────────────────
function generateEmojiLayout(starCount, flowerCount) {
  const items = [];
  const placed = [];

  function noOverlap(x, y) {
    return placed.every(p => Math.hypot(p.x - x, p.y - y) > 9);
  }

  function place(emoji, count) {
    let attempts = 0;
    let placed_count = 0;
    while (placed_count < count && attempts < 200) {
      attempts++;
      // Keep emojis away from the bottom quiz bar (below 70%) and top 8%
      const x = 5 + Math.random() * 88;
      const y = 10 + Math.random() * 55;
      if (noOverlap(x, y)) {
        items.push({ emoji, x, y, id: items.length });
        placed.push({ x, y });
        placed_count++;
      }
    }
  }

  place('⭐', starCount);
  place('🌸', flowerCount);
  return items;
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function RabbitHoleRoom({ playerName, onNext, onBack }) {
  const [phase,       setPhase]       = useState('fadein');
  const [girlX,       setGirlX]       = useState(50);
  const [girlBottom,  setGirlBottom]  = useState(10);
  const [girlSize,    setGirlSize]    = useState(10);
  const [girlImg,     setGirlImg]     = useState('/girl-confused-rh.png');
  const [showDoor,    setShowDoor]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);

  // Quiz state — currentQ: 0=none, 1=clocks, 2=keys, 3=emojis
  const [currentQ,    setCurrentQ]    = useState(0);
  const [answer,      setAnswer]      = useState('');
  const [tries,       setTries]       = useState(0);
  const [showHint,    setShowHint]    = useState(false);
  const [feedback,    setFeedback]    = useState(null);
  const [showFairy,   setShowFairy]   = useState(false);

  // Q3 emoji state — generated once when Q3 begins
  const [starAnswer,    setStarAnswer]    = useState('');
  const [flowerAnswer,  setFlowerAnswer]  = useState('');
  const [starCount,     setStarCount]     = useState(0);
  const [flowerCount,   setFlowerCount]   = useState(0);
  const [emojiItems,    setEmojiItems]    = useState([]);
  const [showEmojis,    setShowEmojis]    = useState(false);
  const [q3Feedback,    setQ3Feedback]    = useState(null); // 'wrong' | 'right' | null

  const [voiceDone, setVoiceDone] = useState(false);
  const [showSkip,  setShowSkip]  = useState(false);
  const rhAudioRef = useRef(null);
  const qAudioRef  = useRef(null); // tracks current question VO so we can stop it

  const QUESTIONS = {
    1: {
      prompt: `🐇 The White Rabbit zooms past looking very worried!\n"Oh dear, oh dear! I'm SO late!\n${playerName}, can you count ALL the clocks in this room for me?"`,
      answer: 14,
      hint: "I have 9 clocks, and I need 5 more to go! How many clocks in total do I need?  🕐",
    },
    2: {
      prompt: `🗝️ The door is almost ready to open...\n"Ooooh! But first — how many keys can you spot hanging around this room?"`,
      answer: 5,
      hint: "Some keys are hiding near the tunnel! 🗝️",
    },
  };

  // ── Stop current question voiceover ──────────────────────────
  function stopQAudio() {
    if (qAudioRef.current) {
      qAudioRef.current.onended = null;
      qAudioRef.current.pause();
      qAudioRef.current.src = '';
      qAudioRef.current = null;
    }
  }

  // ── Startup ───────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('sitting'); setGirlSize(2); }, 800);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    const audio = registerAudio(new Audio('/audio/voice_over/rh_intro.mp3'));
    rhAudioRef.current = audio;
    audio.volume = 1.0;
    const t = setTimeout(() => {
      audio.play().catch(() => {
        const unlock = () => {
          audio.play().catch(() => {});
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);
      });
      setShowSkip(true);
      audio.onended = () => { setVoiceDone(true); setShowSkip(false); };
    }, 1000);
    return () => { clearTimeout(t); audio.onended = null; audio.pause(); };
  }, []);

  useEffect(() => {
    if (!voiceDone) return;
    const t = setTimeout(() => {
      setPhase('q1');
      setCurrentQ(1);
      stopQAudio();
      const a1 = registerAudio(new Audio('/audio/voice_over/rabbit_q1.mp3'));
      qAudioRef.current = a1;
      a1.play().catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [voiceDone]);

  const q3AudioRef = useRef(null);

  // ── Answer submission for Q1 and Q2 ──────────────────────────
  function handleSubmit() {
    const q     = QUESTIONS[currentQ];
    const guess = parseInt(answer.trim(), 10);
    if (isNaN(guess)) return;

    if (guess === q.answer) {
      setFeedback('right');
      setAnswer('');
      setTries(0);
      setShowHint(false);
      setShowFairy(false);
      if (currentQ === 1) {
        stopQAudio();  // stop rabbit_q1.mp3 immediately
        setTimeout(() => {
          setFeedback(null);
          setCurrentQ(2);
          setPhase('q2');
          const a2 = registerAudio(new Audio('/audio/voice_over/rabbit_q2.mp3'));
          qAudioRef.current = a2;
          a2.play().catch(() => {});
        }, 1200);
      } else {
        stopQAudio();  // stop rabbit_q2.mp3 immediately
        setTimeout(() => {
          setFeedback(null);
          launchQ3();
        }, 1200);
      }
    } else {
      const newTries = tries + 1;
      setTries(newTries);
      setFeedback('wrong');
      registerAudio(new Audio('/audio/voice_over/try_again.mp3')).play().catch(() => {});
      setAnswer('');
      setTimeout(() => setFeedback(null), 1200);
      if (newTries >= 3) { setShowHint(true); setShowFairy(true); }
    }
  }

  // ── Launch Q3 ─────────────────────────────────────────────────
  function launchQ3() {
    // Guarantee star and flower counts are always different
    let sc = randBetween(5, 10);
    let fc = randBetween(5, 10);
    while (fc === sc) { fc = randBetween(5, 10); }

    setStarCount(sc);
    setFlowerCount(fc);
    setEmojiItems(generateEmojiLayout(sc, fc));
    setShowEmojis(true);
    setCurrentQ(3);
    setPhase('q3');
    setTries(0);
    setShowHint(false);
    setShowFairy(false);
    setQ3Feedback(null);
    setStarAnswer('');
    setFlowerAnswer('');

    const q3audio = registerAudio(new Audio('/audio/voice_over/rabbit_q3.mp3'));
    q3AudioRef.current = q3audio;
    q3audio.play().catch(() => {});
  }

  // ── Proceed to door (correct or auto-pass on 4th fail) ────────
  function proceedFromQ3() {
    // Stop q3 voice immediately — no more audio until door glow
    if (q3AudioRef.current) {
      q3AudioRef.current.onended = null;
      q3AudioRef.current.pause();
      q3AudioRef.current.src = '';
      q3AudioRef.current = null;
    }
    setQ3Feedback('right');
    setTimeout(() => {
      setQ3Feedback(null);
      setShowEmojis(false);
      setCurrentQ(0);
      setPhase('standing');
      setGirlImg('/girl-back-headtop.png');
      setGirlSize(1.5);
      setShowDoor(true);
      // Only door_is_glowing — no find_keys, no rh_door piling up
      registerAudio(new Audio('/audio/voice_over/door_is_glowing.mp3')).play().catch(() => {});
    }, 1500);
  }

  // ── Q3 submission ─────────────────────────────────────────────
  function handleQ3Submit() {
    const sGuess = parseInt(starAnswer.trim(), 10);
    const fGuess = parseInt(flowerAnswer.trim(), 10);
    if (isNaN(sGuess) || isNaN(fGuess)) return;

    if (sGuess === starCount && fGuess === flowerCount) {
      proceedFromQ3();
    } else {
      const newTries = tries + 1;
      setTries(newTries);

      // 4th failed attempt → auto-pass silently
      if (newTries >= 4) {
        proceedFromQ3();
        return;
      }

      setQ3Feedback('wrong');
      registerAudio(new Audio('/audio/voice_over/try_again.mp3')).play().catch(() => {});
      setStarAnswer('');
      setFlowerAnswer('');
      setTimeout(() => setQ3Feedback(null), 1200);
      if (newTries >= 3) { setShowHint(true); setShowFairy(true); }
    }
  }

  // ── Door click ────────────────────────────────────────────────
  function handleDoorClick() {
    if (phase !== 'standing' && phase !== 'walking') return;
    setPhase('entering');
    setGirlX(78);
    setGirlImg('/girl-back.png');
    setTimeout(() => setPhase('shrinking'), 1400);
    setTimeout(() => onNext(), 5600);
  }

  function handleBack() { setShowConfirm(true); }
  function handleConfirmYes() {
    setShowConfirm(false);
    setShowGoodbye(true);
    setTimeout(() => onBack(), 3500);
  }

  const girlStyle = () => {
    const base = {
      position: 'absolute', bottom: `${girlBottom}%`, left: `${girlX}%`,
      height: `clamp(120px, ${girlSize * 20}vh, ${girlSize * 220}px)`,
      transform: 'translateX(-50%)', transformOrigin: 'bottom center',
      transition: 'all 1.5s ease',
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))', zIndex: 10,
    };
    if (phase === 'fadein') return { ...base, opacity: 0 };
    if (phase === 'shrinking') return { ...base, animation: 'girlEnterDoor 4s ease-out both' };
    return { ...base, opacity: 1 };
  };

  const q = QUESTIONS[currentQ];
  const hintText = currentQ === 3
    ? `⭐ Look carefully — count each star one by one! 🌸 And don't forget the flowers too!`
    : QUESTIONS[currentQ]?.hint;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1a0a0a', overflow: 'hidden' }}>

      {/* Background */}
      <img src="/background-images/rabbith-room.png" alt="rabbit hole room" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover',
        opacity: phase === 'fadein' ? 0 : 1,
        transition: 'opacity 1.2s ease',
      }} />

      {/* ── Q3 Emojis scattered on background ── */}
      {showEmojis && emojiItems.map(item => (
        <div key={item.id} style={{
          position:  'absolute',
          left:      `${item.x}%`,
          top:       `${item.y}%`,
          fontSize:  'clamp(22px, 3vw, 34px)',
          zIndex:    8,
          animation: `emojiFloat ${2.5 + (item.id % 4) * 0.4}s ease-in-out infinite`,
          animationDelay: `${(item.id * 0.18) % 1.2}s`,
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          {item.emoji}
        </div>
      ))}

      {/* Door glow */}
      {showDoor && (
        <div onClick={handleDoorClick} style={{
          position: 'absolute', right: '7%', top: '25%',
          width: '14%', height: '55%', cursor: 'pointer', zIndex: 15,
          borderRadius: '4px 4px 50% 50% / 4px 4px 20px 20px',
          boxShadow: '0 0 60px 25px rgba(255,200,60,0.6), 0 0 20px 8px rgba(255,230,100,0.9)',
          animation: 'doorPulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Girl */}
      {phase !== 'fadein' && (
        <img src={girlImg} alt="girl" style={girlStyle()} />
      )}

      {/* ── Q1 / Q2 quiz bar ── */}
      {currentQ > 0 && currentQ < 3 && feedback !== 'right' && (
        <div style={{
          position: 'absolute', bottom: 30, left: 50, right: 50,
          background: 'rgba(20, 8, 30, 0.82)', backdropFilter: 'blur(10px)',
          borderTop: '2px solid rgba(255,200,100,0.3)',
          padding: '16px 24px', zIndex: 30,
          display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(12px, 1.8vw, 16px)',
            fontStyle: 'italic', color: feedback === 'wrong' ? '#ff8080' : '#f5e6c8',
            lineHeight: 1.5, flex: '1 1 300px', whiteSpace: 'pre-line',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            animation: feedback === 'wrong' ? 'shakeIt 0.4s ease' : 'none',
          }}>
            {feedback === 'wrong' ? "Hmm, that doesn't seem right... try again! 🤔" : q?.prompt}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
            <input
              type="number" value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="?" min="0" max="99"
              style={{
                width: '100px', textAlign: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 'bold',
                color: '#4a1a6b', background: 'rgba(255,255,255,0.92)',
                border: feedback === 'wrong' ? '2px solid #ff6060' : '2px solid rgba(196,139,159,0.5)',
                borderRadius: '50px', padding: '8px 12px', outline: 'none',
              }}
            />
            <button onClick={handleSubmit} style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(13px, 1.6vw, 16px)',
              color: '#fff', background: 'linear-gradient(135deg, #9b59b6, #6b21a8)',
              border: 'none', borderRadius: '50px', padding: '10px 22px',
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(107,33,168,0.4)', whiteSpace: 'nowrap',
            }}>
              That's my answer! ✨
            </button>
          </div>
          {feedback === 'right' && (
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(50,200,100,0.95)', color: '#fff',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(14px, 2vw, 20px)',
              fontWeight: 'bold', padding: '10px 28px', borderRadius: '50px',
              marginBottom: '8px', animation: 'bubblePop 0.4s ease-out', whiteSpace: 'nowrap',
            }}>
              🎉 That's right! Amazing counting!
            </div>
          )}
        </div>
      )}

      {/* ── Q3 quiz bar — two inputs ── */}
      {currentQ === 3 && q3Feedback !== 'right' && (
        <div style={{
          position: 'absolute', bottom: 30, left: 30, right: 30,
          background: 'rgba(20, 8, 30, 0.88)', backdropFilter: 'blur(10px)',
          borderTop: '2px solid rgba(255,200,100,0.3)',
          padding: '16px 24px', zIndex: 30,
          display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {/* Prompt */}
          <div style={{
            fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(12px, 1.8vw, 16px)',
            fontStyle: 'italic',
            color: q3Feedback === 'wrong' ? '#ff8080' : '#f5e6c8',
            lineHeight: 1.5, whiteSpace: 'pre-line', textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            animation: q3Feedback === 'wrong' ? 'shakeIt 0.4s ease' : 'none',
            flex: '1 1 100%', textAlign: 'center',
          }}>
            {q3Feedback === 'wrong'
              ? "Hmm, not quite! Look carefully and try again! 🤔"
              : `🐇 Ooh, look look look! Stars and flowers have appeared!\nCount the ⭐ stars and 🌸 flowers — can you get both right?`
            }
          </div>

          {/* Star input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}>⭐</span>
            <input
              type="number" value={starAnswer}
              onChange={e => setStarAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleQ3Submit(); }}
              placeholder="?" min="0" max="20"
              style={{
                width: '65px', textAlign: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 'bold',
                color: '#4a1a6b', background: 'rgba(255,255,255,0.92)',
                border: q3Feedback === 'wrong' ? '2px solid #ff6060' : '2px solid rgba(255,220,80,0.6)',
                borderRadius: '50px', padding: '8px 10px', outline: 'none',
              }}
            />
          </div>

          {/* Flower input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'clamp(20px, 2.5vw, 28px)' }}>🌸</span>
            <input
              type="number" value={flowerAnswer}
              onChange={e => setFlowerAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleQ3Submit(); }}
              placeholder="?" min="0" max="20"
              style={{
                width: '65px', textAlign: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 'bold',
                color: '#4a1a6b', background: 'rgba(255,255,255,0.92)',
                border: q3Feedback === 'wrong' ? '2px solid #ff6060' : '2px solid rgba(255,170,200,0.6)',
                borderRadius: '50px', padding: '8px 10px', outline: 'none',
              }}
            />
          </div>

          {/* Submit */}
          <button onClick={handleQ3Submit} style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(13px, 1.6vw, 16px)',
            color: '#fff', background: 'linear-gradient(135deg, #9b59b6, #6b21a8)',
            border: 'none', borderRadius: '50px', padding: '10px 22px',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(107,33,168,0.4)', whiteSpace: 'nowrap',
          }}>
            That's my answer! ✨
          </button>

          {q3Feedback === 'right' && (
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(50,200,100,0.95)', color: '#fff',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(14px, 2vw, 20px)',
              fontWeight: 'bold', padding: '10px 28px', borderRadius: '50px',
              marginBottom: '8px', animation: 'bubblePop 0.4s ease-out', whiteSpace: 'nowrap',
            }}>
              🎉 You got both right! Incredible!
            </div>
          )}
        </div>
      )}

      {/* ── Fairy hint ── */}
      {showFairy && showHint && currentQ > 0 && (
        <div style={{
          position: 'absolute', bottom: '80px', right: '2%', zIndex: 35,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
          animation: 'fadeInUp 0.5s ease-out',
        }}>
          <div style={{
            background: 'rgba(40,80,40,0.92)', backdropFilter: 'blur(8px)',
            borderRadius: '18px 18px 4px 18px', padding: '10px 16px', maxWidth: '220px',
            fontFamily: 'Lora, serif', fontSize: 'clamp(11px, 1.4vw, 13px)',
            fontStyle: 'italic', color: '#c8f0c8', lineHeight: 1.5,
            border: '1px solid rgba(100,200,100,0.3)', textAlign: 'right',
          }}>
            {hintText}
          </div>
          <img src="/guide-teaching.png" alt="forest guide" style={{
            height: 'clamp(80px, 14vh, 130px)',
            filter: 'drop-shadow(0 4px 12px rgba(50,200,50,0.4))',
          }} />
        </div>
      )}

      {/* Door prompt */}
      {showDoor && phase === 'standing' && (
        <div onClick={handleDoorClick} style={{
          position: 'absolute', bottom: '18%', right: '4%',
          background: 'rgba(255,255,255,0.9)', color: '#6b21a8',
          fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold',
          fontSize: 'clamp(12px, 1.6vw, 15px)', padding: '8px 20px',
          borderRadius: '50px', zIndex: 20, cursor: 'pointer',
          animation: 'pulseBubble 2s ease-in-out infinite',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          ✨ Go through the door!
        </div>
      )}

      {/* Skip intro VO */}
      {showSkip && (
        <div onClick={() => {
          if (rhAudioRef.current) { rhAudioRef.current.onended = null; rhAudioRef.current.pause(); }
          setVoiceDone(true); setShowSkip(false);
        }} style={{
          position: 'absolute', bottom: '20%', right: '2%',
          background: 'rgba(255,255,255,0.85)', color: '#6b21a8',
          fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold',
          fontSize: 'clamp(11px, 1.4vw, 14px)', padding: '8px 18px',
          borderRadius: '50px', cursor: 'pointer', zIndex: 40,
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          animation: 'pulseBubble 2s ease-in-out infinite',
        }}>
          ⏭ Skip
        </div>
      )}

      {/* Back button */}
      {!showConfirm && !showGoodbye && (
        <button onClick={handleBack} style={{
          position: 'absolute', top: '3%', left: '2%',
          background: 'rgba(255,255,255,0.85)', color: '#6b21a8',
          fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold',
          fontSize: 'clamp(12px,1.5vw,15px)', padding: '8px 20px',
          borderRadius: '50px', border: 'none', cursor: 'pointer',
          zIndex: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>← Back</button>
      )}

      {/* Confirm popup */}
      {showConfirm && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.97)', borderRadius: '24px',
            padding: '40px 48px', textAlign: 'center',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)', maxWidth: '90vw',
          }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(16px,2.5vw,24px)', color: '#4a1a6b', marginBottom: '24px' }}>
              Want to go back to the garden? 🌸
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={handleConfirmYes} style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(13px,1.8vw,18px)',
                color: '#fff', background: 'linear-gradient(135deg,#e8a4b8,#c48b9f)',
                border: 'none', borderRadius: '50px', padding: '10px 28px', cursor: 'pointer',
              }}>Yes, back to garden</button>
              <button onClick={() => setShowConfirm(false)} style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(13px,1.8vw,18px)',
                color: '#fff', background: 'linear-gradient(135deg,#9b59b6,#6b21a8)',
                border: 'none', borderRadius: '50px', padding: '10px 28px', cursor: 'pointer',
              }}>Keep exploring!</button>
            </div>
          </div>
        </div>
      )}

      {/* Goodbye */}
      {showGoodbye && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{
            background: 'rgba(255,245,220,0.97)', borderRadius: '24px',
            padding: '40px 48px', textAlign: 'center',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)', maxWidth: '90vw',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌸🐇✨</div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(14px,2vw,20px)', color: '#4a1a6b', lineHeight: 1.8 }}>
              Come back soon, <strong>{playerName}</strong>!<br />
              Wonderland will be waiting! 🐇
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes doorPulse {
          0%,100% { box-shadow: 0 0 60px 25px rgba(255,200,60,0.5), 0 0 20px 8px rgba(255,230,100,0.8); }
          50%      { box-shadow: 0 0 90px 40px rgba(255,200,60,0.75), 0 0 30px 14px rgba(255,230,100,1); }
        }
        @keyframes girlEnterDoor {
          0%   { transform: translateX(-10%) rotate(0deg)  scale(0.9);  opacity: 1; bottom: 5%; }
          100% { transform: translateX(-15%) rotate(20deg) scale(0.04); opacity: 0; bottom: 55%; }
        }
        @keyframes bubblePop {
          0%   { opacity: 0; transform: translateX(-50%) scale(0.85); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes pulseBubble {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.06); }
        }
        @keyframes shakeIt {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-8px); }
          75%     { transform: translateX(8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes emojiFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50%     { transform: translateY(-8px) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
