import { useEffect, useRef, useState } from 'react';
import { registerAudio, stopAll } from '../audioRegistry';

// ─── Crown colours for Activity 1 ────────────────────────────
const CROWN_COLORS  = ['#e74c3c', '#f1c40f', '#3498db'];

// ─── Shuffle helper ───────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffled once at module load so it's different each play
const HINT_SEQUENCE   = shuffleArray(CROWN_COLORS); // e.g. [blue, red, yellow]

// ─── Royal symbols for Activity 2 ────────────────────────────
const ALL_SYMBOLS = [
  { id: 'heart',  emoji: '♥', label: 'Heart'  },
  { id: 'star',   emoji: '★', label: 'Star'   },
  { id: 'crown',  emoji: '♛', label: 'Crown'  },
  { id: 'flower', emoji: '✿', label: 'Flower' },
];
// Correct order is shuffled — different from button layout
const CORRECT_ORDER = shuffleArray(ALL_SYMBOLS.map(s => s.id));
// Button layout order is always fixed (heart, star, crown, flower)
// so correct order won't match what's on screen
const BUTTON_SYMBOLS = ALL_SYMBOLS;

// ─── Crown SVG with 3 colourable sections ─────────────────────
function CrownSVG({ fills, onFill }) {
  const sections = [
    { id: 'left',   d: 'M 30 140 L 30 70 L 80 110 L 120 40 L 120 140 Z' },
    { id: 'center', d: 'M 120 140 L 120 40 L 160 90 L 200 40 L 200 140 Z' },
    { id: 'right',  d: 'M 200 140 L 200 40 L 240 110 L 290 70 L 290 140 Z' },
  ];
  return (
    <svg viewBox="0 0 320 160" width="240" height="130"
      style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.2))' }}>
      <rect x="28" y="130" width="264" height="22" rx="6"
        fill={fills['center'] || '#f0d080'} stroke="#8b6914" strokeWidth="2" />
      {sections.map(s => (
        <path key={s.id} d={s.d}
          fill={fills[s.id] || '#f0d080'}
          stroke="#8b6914" strokeWidth="2.5" strokeLinejoin="round"
          style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
          onClick={() => onFill(s.id)}
        />
      ))}
      {[80, 160, 240].map((cx, i) => (
        <circle key={i} cx={cx} cy={135} r="7"
          fill={fills[['left','center','right'][i]] || '#fff'}
          stroke="#8b6914" strokeWidth="1.5" style={{ pointerEvents: 'none' }} />
      ))}
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────
export default function RoyalCourt({ playerName, bagItems = [], onNext, onBack, onAddItem }) {

  const hasMapFragment = bagItems.some(i =>
    typeof i === 'string' ? i.includes('Map') : false
  );

  const [phase,        setPhase]        = useState('entry');
  const [bg,           setBg]           = useState('/background-images/RoyalCourt-entry.png');
  const [girlX,        setGirlX]        = useState(5);
  const [girlBottom,   setGirlBottom]   = useState(6);
  const [girlSize,     setGirlSize]     = useState(0.7);
  const [girlImg,      setGirlImg]      = useState('/wearingBackpack-Idle.png');
  const [queenImg,     setQueenImg]     = useState('/queen-angry.png');
  const [showQueen,    setShowQueen]    = useState(false);
  const [girlBubble,   setGirlBubble]  = useState(null);
  const [queenBubble,  setQueenBubble] = useState(null);
  const [showPathBtn,  setShowPathBtn]  = useState(false);
  const [fadingOut,    setFadingOut]    = useState(false);

  // Activity 1
  const [crownFills,   setCrownFills]  = useState({});
  const [fillSequence, setFillSequence]= useState([]);
  const [selectedCol,  setSelectedCol] = useState(HINT_SEQUENCE[0]);
  const [act1Done,     setAct1Done]    = useState(false);
  const [queenReact1,  setQueenReact1] = useState('');
  const [wrongFlash,   setWrongFlash]  = useState(false);

  // Activity 2
  const [tapped,       setTapped]      = useState([]);
  const [act2Done,     setAct2Done]    = useState(false);
  const [wrongTap,     setWrongTap]    = useState(false);

  // Cat
  const [catImg,       setCatImg]      = useState('/cat-appearing.png');
  const [catBubble,    setCatBubble]   = useState(null);
  const [catOpacity,   setCatOpacity]  = useState(0);

  // ── Audio refs ────────────────────────────────────────────────
  const voiceRef = useRef(null);

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

  // ── Entry walk-in ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'entry') return;
    const t1 = setTimeout(() => { setShowQueen(true); }, 600);
    const t2 = setTimeout(() => {
      setGirlX(32); setGirlBottom(8); setGirlSize(3);
      setGirlImg('/girl-back-headtop.png');
    }, 800);
    const t3 = setTimeout(() => {
      setGirlImg('/girl-scared.png');
      setGirlX(32); setGirlBottom(8); setGirlSize(3);
      setPhase('dialogue');
      // Play girl entry voice
      playVoice('/audio/voice_over/rc_girl_entry.mp3', () => {
        // When girl voice ends → queen angry plays automatically
        playVoice('/audio/voice_over/rc_queen_angry.mp3');
      });
    }, 3600);
    return () => [t1,t2,t3].forEach(clearTimeout);
  }, [phase]);

  // ── Dialogue ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'dialogue') return;
    // Button appears immediately — player never has to wait for conversation
    setShowPathBtn(true);
    const t1 = setTimeout(() => setGirlBubble('"What are you looking for?"'), 400);
    const t2 = setTimeout(() => {
      setGirlBubble(null);
      setQueenImg('/queen-talking.png');
      setQueenBubble('"MY CROWN IS MISSING!" 😤');
    }, 3000);
    const t3 = setTimeout(() => {
      setQueenBubble(null);
      setQueenImg('/queen-angry.png');
    }, 6200);
    return () => [t1,t2,t3].forEach(clearTimeout);
  }, [phase]);

  // ── Start Path A or B ─────────────────────────────────────────
  function startPath() {
    setShowPathBtn(false);
    // Stop any conversation voice immediately — clean slate
    stopVoice();
    if (hasMapFragment) {
      setBg('/background-images/RoyalCourt-puzzle-box.png');
      setQueenImg('/queen-idle.png');
      setQueenReact1('Hmm... what are you doing? 🤔');
      setPhase('pathA-activity1');
      // Small pause so it feels like girl is responding, then chain voices
      setTimeout(() => {
        playVoice('/audio/voice_over/rc_girl_map.mp3', () => {
          // Queen speaks about puzzle only after girl finishes
          playVoice('/audio/voice_over/rc_crown_puzzle.mp3');
        });
      }, 400);
    } else {
      setPhase('pathB-cat');
      setTimeout(() => playVoice('/audio/voice_over/rc_cat_entry.mp3'), 400);
      startCat();
    }
  }

  // ── Path B: Cheshire Cat ──────────────────────────────────────
  function startCat() {
    setGirlImg('/girl-scared.png');
    setCatOpacity(0);
    setTimeout(() => setCatOpacity(1), 300);
    setTimeout(() => {
      setCatImg('/cat-appearing.png');
      setCatBubble('"Psst... looking for a crown, are we? 😸"');
    }, 800);
    setTimeout(() => {
      setCatBubble('"A map finds what is lost...\nGo back, shrink down,\nthe fireflies know the way..."');
      setCatImg('/cat-whispering.png');
    }, 4000);
    setTimeout(() => { setCatBubble(null); setCatOpacity(0.6); }, 7500);
    setTimeout(() => setCatOpacity(0.3), 8500);
    setTimeout(() => setCatOpacity(0),   9500);
    setTimeout(() => setPhase('pathB-leave'), 10200);
  }

  // ── Activity 1: Colour Crown ──────────────────────────────────
  function handleFillCrown(sectionId) {
    if (crownFills[sectionId]) return;
    const nextIdx      = fillSequence.length;
    const expectedColor = HINT_SEQUENCE[nextIdx];
    if (selectedCol !== expectedColor) {
      setWrongFlash(true);
      setQueenReact1('That colour is not right! Try the hint! 😠');
      setTimeout(() => setWrongFlash(false), 700);
      return;
    }
    const newFills    = { ...crownFills, [sectionId]: selectedCol };
    const newSequence = [...fillSequence, sectionId];
    setCrownFills(newFills);
    setFillSequence(newSequence);
    const reactions = [
      'Interesting... keep going! 🤔',
      "Oh! That's rather pretty... 😮",
      "It's MAGNIFICENT! My crown! 👑",
    ];
    setQueenReact1(reactions[newSequence.length - 1] || '');
    setQueenImg(newSequence.length === 3 ? '/queen-happy.png' : '/queen-idle.png');
    if (newSequence.length >= 3) setAct1Done(true);
  }

  // ── Activity 2: Stamp Seal ────────────────────────────────────
  function handleTapSymbol(symbolId) {
    const nextExpected = CORRECT_ORDER[tapped.length];
    if (symbolId !== nextExpected) {
      setWrongTap(true);
      setQueenReact1('No no no! Follow the scroll! 😤');
      setTimeout(() => { setWrongTap(false); setTapped([]); }, 900);
      return;
    }
    const newTapped = [...tapped, symbolId];
    setTapped(newTapped);
    const reactions = ['Yes! Keep going! ✨', 'The seal is forming! 🌟', 'Almost there! 💫', 'THE BOX IS OPENING! 👑'];
    setQueenReact1(reactions[newTapped.length - 1]);
    setQueenImg(newTapped.length === 4 ? '/queen-happy.png' : '/queen-idle.png');
    if (newTapped.length >= 4) setTimeout(() => setAct2Done(true), 600);
  }

  // ── Path A win ────────────────────────────────────────────────
  function handleAct2Win() {
    stopVoice();
    setPhase('pathA-win');
    setBg('/background-images/RoyalCourt-rose.png');
    setGirlImg('/girl-rose.png');
    setGirlSize(2.2);
    setGirlX(35);
    setGirlBottom(6);
    setQueenImg('/queen-happy.png');
    setQueenBubble('"You found my crown! You are the bravest adventurer in all of Wonderland! 🌹"');
    onAddItem('Crown 👑');
    onAddItem('Rose 🌹');
    // Play win voice — return button always available, doesn't wait for voice
    playVoice('/audio/voice_over/rc_queen_win.mp3');
    setTimeout(() => {
      setQueenBubble(null);
      setPhase('pathA-final');
      setBg('/background-images/RoyalCourt-end.png');
      setGirlImg('/girl-celebrating.png');
      setGirlSize(2.4);
      setGirlX(38);
    }, 5000);
  }

  // ── Shared styles ─────────────────────────────────────────────
  const overlayStyle = {
    position: 'absolute', inset: 0,
    background: 'rgba(20, 5, 25, 0.80)',
    zIndex: 40, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(3px)',
  };

  const boxStyle = {
    background: 'rgba(255, 248, 235, 0.97)', borderRadius: '32px',
    padding: '32px 38px', maxWidth: '90vw', width: '820px',
    boxShadow: '0 12px 60px rgba(0,0,0,0.35)',
    border: '2px solid rgba(180,120,60,0.3)',
    display: 'flex', gap: '28px', alignItems: 'flex-start',
  };

  const actTitleStyle = {
    fontFamily: 'Cormorant Garamond, Georgia, serif',
    fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 'bold',
    color: '#6b1a1a', marginBottom: '14px',
  };

  const queenPanelStyle = {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', minWidth: '110px', gap: '8px',
  };

  const nextBtn = {
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: 'clamp(13px, 1.8vw, 17px)', color: '#fff',
    background: 'linear-gradient(135deg, #c0392b, #922b21)',
    border: 'none', borderRadius: '50px', padding: '11px 30px',
    cursor: 'pointer', boxShadow: '0 4px 16px rgba(192,57,43,0.35)',
    marginTop: '20px',
  };

  function SpeechBubble({ text, side = 'left' }) {
    if (!text) return null;
    return (
      <div style={{
        position: 'absolute', bottom: '100%',
        ...(side === 'left' ? { left: 0 } : { right: 0 }),
        marginBottom: '10px',
        background: 'rgba(255,255,255,0.97)', borderRadius: '16px',
        padding: '12px 18px', maxWidth: '260px',
        fontFamily: 'Lora, Georgia, serif',
        fontSize: 'clamp(11px, 1.5vw, 14px)', fontStyle: 'italic',
        color: '#4a1a1a', lineHeight: 1.55,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '2px solid rgba(180,120,60,0.3)',
        animation: 'bubblePop 0.35s ease-out forwards',
        whiteSpace: 'pre-line', zIndex: 25,
      }}>
        {text}
        <div style={{
          position: 'absolute', bottom: '-12px',
          ...(side === 'left' ? { left: '24px' } : { right: '24px' }),
          width: 0, height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '12px solid rgba(255,255,255,0.97)',
        }} />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#1a0505' }}>

      <img src={bg} alt="royal court"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 1s ease' }} />

      {showQueen && (
        <div style={{ position: 'absolute', right: '4%', bottom: '5%', zIndex: 12 }}>
          <SpeechBubble text={queenBubble} side="right" />
          <img src={queenImg} alt="queen"
            style={{ height: 'clamp(180px, 32vh, 310px)', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.45))', transition: 'all 0.6s ease' }} />
        </div>
      )}

      {(phase !== 'entry' || girlX > 5) && (
        <div style={{
          position: 'absolute',
          bottom: `${girlBottom}%`,
          left: `${girlX}%`,
          transform: 'translateX(-50%)',
          transformOrigin: 'bottom center',
          transition: 'left 2.5s ease-out, bottom 2s ease-out',
          zIndex: 11,
        }}>
          <SpeechBubble text={girlBubble} side="left" />
          <img src={girlImg} alt="girl"
            style={{
              height: `${girlSize * 14}vh`,
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))',
              transition: 'height 2s ease',
              display: 'block',
            }} />
        </div>
      )}

      {showPathBtn && (
        <div style={{ position: 'absolute', bottom: '6%', left: '50%', transform: 'translateX(-50%)', zIndex: 30 }}>
          <button onClick={startPath} style={{
            ...nextBtn, fontSize: 'clamp(14px, 2vw, 19px)', padding: '14px 36px',
            animation: 'pulseBubble 2s ease-in-out infinite',
          }}>
            {hasMapFragment ? '🗺️ Use the Map Fragment!' : '🔍 Search the room...'}
          </button>
        </div>
      )}

      {/* ══════════ PATH A — ACTIVITY 1 ══════════════════════════ */}
      {phase === 'pathA-activity1' && (
        <div style={overlayStyle}>
          <div style={boxStyle}>
            <div style={queenPanelStyle}>
              <img src={queenImg} alt="queen" style={{ height: '150px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))', transition: 'all 0.5s ease' }} />
              {queenReact1 && (
                <div style={{
                  background: 'rgba(255,255,255,0.95)', borderRadius: '14px',
                  padding: '8px 12px', fontFamily: 'Lora, serif',
                  fontSize: 'clamp(10px, 1.3vw, 12px)', fontStyle: 'italic',
                  color: '#6b1a1a', textAlign: 'center', maxWidth: '110px',
                  lineHeight: 1.4, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  animation: 'bubblePop 0.3s ease-out',
                  border: wrongFlash ? '2px solid #e74c3c' : '2px solid transparent',
                }}>{queenReact1}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={actTitleStyle}>🎨 Colour the Crown!</div>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(12px,1.5vw,14px)', color: '#5b2a2a', marginBottom: '14px', fontStyle: 'italic' }}>
                Pick the correct colour from the hint, then click each crown section in order!
              </p>

              {/* Colour hint — shuffled order */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', color: '#8b4a14', fontWeight: 'bold' }}>Hint:</span>
                {HINT_SEQUENCE.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: c,
                      border: '2px solid rgba(0,0,0,0.15)',
                      opacity: fillSequence.length > i ? 0.3 : 1,
                      transition: 'opacity 0.4s ease',
                    }} />
                    {i < HINT_SEQUENCE.length - 1 && <span style={{ color: '#8b4a14', fontSize: '16px' }}>→</span>}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <CrownSVG fills={crownFills} onFill={handleFillCrown} />
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', color: '#8b4a14', marginBottom: '8px', fontWeight: 'bold' }}>
                    Pick a colour:
                  </div>
                  {/* Colours shown in FIXED order — different from hint sequence */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {CROWN_COLORS.map(c => (
                      <div key={c} onClick={() => setSelectedCol(c)} style={{
                        width: '38px', height: '38px', borderRadius: '50%', background: c,
                        cursor: 'pointer',
                        border: selectedCol === c ? '3px solid #4a1a1a' : '2px solid rgba(0,0,0,0.15)',
                        boxShadow: selectedCol === c ? '0 0 0 3px rgba(180,60,60,0.4)' : 'none',
                        transform: selectedCol === c ? 'scale(1.2)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }} />
                    ))}
                  </div>
                  <div style={{ marginTop: '14px', fontFamily: 'Lora, serif', fontSize: '12px', color: '#8b4a14', fontStyle: 'italic' }}>
                    {fillSequence.length} / 3 filled
                  </div>
                </div>
              </div>

              {act1Done && (
                <button onClick={() => { stopVoice(); setPhase('pathA-activity2'); setQueenReact1('Now stamp the Royal Seal! 📜'); }} style={nextBtn}>
                  Next Activity →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ PATH A — ACTIVITY 2 ══════════════════════════ */}
      {phase === 'pathA-activity2' && (
        <div style={overlayStyle}>
          <div style={boxStyle}>
            <div style={queenPanelStyle}>
              <img src={queenImg} alt="queen" style={{ height: '150px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.2))', transition: 'all 0.5s ease' }} />
              {queenReact1 && (
                <div style={{
                  background: 'rgba(255,255,255,0.95)', borderRadius: '14px',
                  padding: '8px 12px', fontFamily: 'Lora, serif',
                  fontSize: 'clamp(10px, 1.3vw, 12px)', fontStyle: 'italic',
                  color: '#6b1a1a', textAlign: 'center', maxWidth: '110px', lineHeight: 1.4,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)', animation: 'bubblePop 0.3s ease-out',
                  border: wrongTap ? '2px solid #e74c3c' : '2px solid transparent', transition: 'border 0.3s',
                }}>{queenReact1}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={actTitleStyle}>🔵 Stamp the Royal Seal!</div>
              <p style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(12px,1.5vw,14px)', color: '#5b2a2a', marginBottom: '14px', fontStyle: 'italic' }}>
                Tap the symbols in the order shown on the scroll — careful, it's not what you'd expect!
              </p>

              {/* Scroll hint — shuffled order */}
              <div style={{
                background: 'linear-gradient(135deg, #f5deb3, #deb887)',
                borderRadius: '12px', padding: '12px 20px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                border: '2px solid rgba(139,90,43,0.3)',
              }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', color: '#5c3a1a', fontWeight: 'bold' }}>📜 Order:</span>
                {CORRECT_ORDER.map((id, i) => {
                  const sym = ALL_SYMBOLS.find(s => s.id === id);
                  const done = tapped.includes(id);
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '22px', opacity: done ? 0.3 : 1, transition: 'opacity 0.4s ease', filter: done ? 'grayscale(1)' : 'none' }}>
                        {sym.emoji}
                      </span>
                      {i < CORRECT_ORDER.length - 1 && <span style={{ color: '#8b5e3c', fontSize: '14px' }}>→</span>}
                    </div>
                  );
                })}
              </div>

              {/* Seal progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: tapped.length === 4
                    ? 'radial-gradient(circle, #c0392b, #922b21)'
                    : 'radial-gradient(circle, #e8d5b0, #c4a882)',
                  border: '3px solid rgba(139,90,43,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: tapped.length === 4 ? '0 0 30px 10px rgba(192,57,43,0.5)' : '0 4px 16px rgba(0,0,0,0.15)',
                  transition: 'all 0.5s ease', flexWrap: 'wrap', gap: '2px', padding: '8px',
                }}>
                  {tapped.map(id => (
                    <span key={id} style={{ fontSize: '24px', animation: 'bubblePop 0.3s ease-out' }}>
                      {ALL_SYMBOLS.find(s => s.id === id)?.emoji}
                    </span>
                  ))}
                  {tapped.length === 0 && (
                    <span style={{ fontSize: '13px', fontFamily: 'Lora, serif', color: '#8b6914', fontStyle: 'italic', textAlign: 'center' }}>
                      Tap symbols in order!
                    </span>
                  )}
                </div>
              </div>

              {/* Symbol buttons — always in fixed layout order */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {BUTTON_SYMBOLS.map(sym => {
                  const done = tapped.includes(sym.id);
                  return (
                    <button key={sym.id} onClick={() => !done && handleTapSymbol(sym.id)} style={{
                      fontSize: '32px',
                      background: done ? 'rgba(144,238,144,0.3)' : 'rgba(255,255,255,0.9)',
                      border: done ? '2px solid #2ecc71' : '2px solid rgba(180,120,60,0.3)',
                      borderRadius: '16px', padding: '12px 18px',
                      cursor: done ? 'default' : 'pointer',
                      boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      animation: wrongTap && !done ? 'shake 0.5s ease' : 'none',
                      opacity: done ? 0.5 : 1, fontFamily: 'serif',
                    }}>
                      {sym.emoji}
                      <div style={{ fontSize: '11px', fontFamily: 'Lora, serif', color: '#8b5e3c', marginTop: '3px' }}>
                        {done ? '✓' : sym.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {act2Done && (
                <button onClick={handleAct2Win} style={nextBtn}>🎉 Give crown to Queen!</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ PATH A — WIN (queen speaks, transparent) ═════ */}
      {phase === 'pathA-win' && queenBubble && (
        <div style={{
          position: 'absolute', bottom: '8%', left: '50%',
          transform: 'translateX(-50%)', zIndex: 20,
        }}>
          <div style={{
            background:   'rgba(255,255,255,0.15)',   // very transparent
            backdropFilter: 'blur(6px)',
            borderRadius: '20px', padding: '18px 28px',
            fontFamily:   'Lora, Georgia, serif',
            fontSize:     'clamp(14px, 2vw, 19px)',
            fontStyle:    'italic', color: '#fff',
            textAlign:    'center', maxWidth: '70vw',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.3)',
            border:       '2px solid rgba(255,255,255,0.3)',
            animation:    'bubblePop 0.4s ease-out',
            lineHeight:   1.7,
            textShadow:   '0 2px 8px rgba(0,0,0,0.6)',
          }}>
            {queenBubble}
          </div>
        </div>
      )}

      {/* ══════════ PATH A — FINAL CELEBRATION ═══════════════════ */}
      {phase === 'pathA-final' && (
        <div style={{
          position: 'absolute', bottom: '30%', left: '50%',
          transform: 'translateX(-50%)', zIndex: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            background:     'rgba(255,248,220,0.18)',  // transparent — bg shows through
            backdropFilter: 'blur(2px)',
            borderRadius:   '24px', padding: '20px 36px',
            fontFamily:     'Cormorant Garamond, Georgia, serif',
            fontSize:       'clamp(16px, 2.5vw, 26px)',
            fontWeight:     'bold', color: '#fff',
            textAlign:      'center',
            boxShadow:      '0 6px 30px rgba(0,0,0,0.3)',
            border:         '2px solid rgba(255,255,255,0.25)',
            animation:      'bubblePop 0.5s ease-out',
            lineHeight:     1.7,
            textShadow:     '0 2px 10px rgba(0,0,0,0.7)',
          }}>
            🎉 You found the crown and won a Rose! 🌹<br />
            <span style={{ fontSize: 'clamp(12px,1.6vw,16px)', fontStyle: 'italic', fontWeight: 'normal' }}>
              Crown 👑 + Rose 🌹 added to your bag!
            </span>
          </div>
          <button
            onClick={() => { stopVoice(); setFadingOut(true); setTimeout(() => onNext(), 1200); }}
            style={{ ...nextBtn, fontSize: 'clamp(14px, 2vw, 19px)', padding: '14px 36px' }}
          >
            Back to Mystery Room →
          </button>
        </div>
      )}

      {/* ══════════ PATH B — CHESHIRE CAT ════════════════════════ */}
      {phase === 'pathB-cat' && (
        <div style={{
          position: 'absolute', left: '50%', bottom: '18%',
          transform: 'translateX(-50%)',
          opacity: catOpacity, transition: 'opacity 3s ease', zIndex: 20,
        }}>
          {catBubble && (
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)', marginBottom: '12px',
              background: 'rgba(40,10,60,0.95)', borderRadius: '18px',
              padding: '14px 22px', maxWidth: '480px',
              width: '100vw',
              fontFamily: 'Lora, Georgia, serif',
              fontSize: 'clamp(12px, 1.6vw, 15px)', fontStyle: 'italic',
              color: '#e8d0f0', lineHeight: 1.65,
              boxShadow: '0 4px 20px rgba(100,0,150,0.4)',
              border: '2px solid rgba(180,100,220,0.4)',
              whiteSpace: 'pre-line', animation: 'bubblePop 0.35s ease-out', textAlign: 'center',
            }}>
              {catBubble}
            </div>
          )}
          <img src={catImg} alt="cheshire cat"
            style={{ height: 'clamp(150px, 25vh, 240px)', filter: 'drop-shadow(0 0 20px rgba(150,50,220,0.6))', display: 'block' }} />
        </div>
      )}

      {/* Path B leave */}
      {phase === 'pathB-leave' && (
        <div style={{
          position: 'absolute', bottom: '6%', left: '50%',
          transform: 'translateX(-50%)', zIndex: 30,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            background: 'rgba(255,248,220,0.96)', borderRadius: '18px',
            padding: '14px 28px', fontFamily: 'Lora, serif',
            fontSize: 'clamp(12px,1.6vw,15px)', fontStyle: 'italic',
            color: '#5b2a2a', textAlign: 'center', boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
          }}>
            You need the Map Fragment first...<br />
            <span style={{ fontSize: '0.9em' }}>Find it at the Tea Party! 🗺️</span>
          </div>
          <button onClick={() => { stopVoice(); setFadingOut(true); setTimeout(() => onBack(), 1200); }} style={nextBtn}>
            ← Back to Mystery Room
          </button>
        </div>
      )}

      {/* Fade overlay */}
      <div style={{
        position: 'absolute', inset: 0, background: '#000',
        opacity: fadingOut ? 1 : 0, transition: 'opacity 1.2s ease',
        zIndex: 60, pointerEvents: 'none',
      }} />

      {/* Back button */}
      {!['pathA-win','pathA-final','pathA-activity1','pathA-activity2','pathB-cat','pathB-leave'].includes(phase) && (
        <button onClick={onBack} style={{
          position: 'absolute', top: '3%', left: '2%',
          background: 'rgba(255,255,255,0.85)', color: '#6b1a1a',
          fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold',
          fontSize: 'clamp(12px,1.5vw,15px)', padding: '8px 20px',
          borderRadius: '50px', border: 'none', cursor: 'pointer',
          zIndex: 30, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        }}>← Back</button>
      )}

      <style>{`
        @keyframes bubblePop {
          0%   { opacity: 0; transform: scale(0.75) translateY(8px); }
          70%  { transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseBubble {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%     { transform: translateX(-50%) scale(1.06); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-6px); }
          75%     { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
