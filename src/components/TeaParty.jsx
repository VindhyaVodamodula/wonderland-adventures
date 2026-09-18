import { useEffect, useRef, useState } from 'react';
import { registerAudio, stopAll } from '../audioRegistry';

// ─── Helpers ──────────────────────────────────────────────────
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Colour palette ───────────────────────────────────────────
const COLORS = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6','#e91e8c','#1abc9c','#ff6b6b'];

// ─── TeacupSVG for Activity 1 ─────────────────────────────────
function TeacupSVG({ fills, onFill }) {
  const sections = [
    { id: 'handle', d: 'M 260 120 Q 310 120 310 160 Q 310 200 260 200 Q 280 200 280 160 Q 280 120 260 120 Z' },
    { id: 'rim',    d: 'M 60 100 Q 160 80 240 100 L 230 125 Q 160 108 70 125 Z' },
    { id: 'upper',  d: 'M 70 125 Q 160 108 230 125 L 220 175 Q 160 160 80 175 Z' },
    { id: 'lower',  d: 'M 80 175 Q 160 160 220 175 L 210 215 Q 160 228 90 215 Z' },
    { id: 'saucer', d: 'M 40 240 Q 160 225 280 240 Q 280 260 160 268 Q 40 260 40 240 Z' },
  ];
  return (
    <svg viewBox="0 0 320 280" width="200" height="200" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))' }}>
      {sections.map(s => (
        <path key={s.id} d={s.d}
          fill={fills[s.id] || '#f0e8d8'}
          stroke="#8b5e3c" strokeWidth="2.5" strokeLinejoin="round"
          style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
          onClick={() => onFill(s.id)}
        />
      ))}
      <path d="M 110 88 Q 115 70 108 55" stroke="#c0a882" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 155 82 Q 160 62 153 47" stroke="#c0a882" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 195 88 Q 200 68 193 53" stroke="#c0a882" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Activity 2A: Pattern Completion ─────────────────────────
const PATTERN_SETS = [
  { seq: ['🎩','🍰','🎩','🍰','🎩'], options: ['🍰','🎪','🫖'], answer: 0 },
  { seq: ['🌸','⭐','🌸','⭐','🌸'], options: ['🌙','⭐','🍄'], answer: 1 },
  { seq: ['🫖','🍪','🫖','🍪','🫖'], options: ['🍪','🎩','🌈'], answer: 0 },
  { seq: ['🎪','🎩','🎪','🎩','🎪'], options: ['🎪','🎩','🍰'], answer: 1 },
  { seq: ['🌈','🍄','🌈','🍄','🌈'], options: ['🌈','🍄','⭐'], answer: 1 },
];

function Activity2Pattern({ onDone }) {
  const pattern = useRef(pickRandom(PATTERN_SETS)).current;
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [tries, setTries] = useState(0);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setTimeout(() => onDone(), 1200);
  }

  function handlePick(i) {
    if (feedback === 'right' || doneRef.current) return;
    if (i === pattern.answer) {
      setSelected(i); setFeedback('right');
      finish();
    } else {
      const t = tries + 1;
      setTries(t);
      setSelected(i); setFeedback('wrong');
      setTimeout(() => { setFeedback(null); setSelected(null); }, 1000);
      if (t >= 4) finish();
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(13px,1.6vw,15px)', color: 'rgba(255,230,180,0.8)', fontFamily: 'Lora, serif', fontStyle: 'italic', marginBottom: 20 }}>
        What comes next in the pattern?
      </div>
      {/* Pattern row */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {pattern.seq.map((emoji, i) => (
          <div key={i} style={{
            fontSize: 'clamp(28px,4vw,40px)',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 16, padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>{emoji}</div>
        ))}
        <div style={{
          fontSize: 'clamp(28px,4vw,40px)',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '10px 14px',
          border: '2px dashed rgba(255,200,100,0.5)',
          minWidth: 60, minHeight: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>?</div>
      </div>
      {/* Options */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        {pattern.options.map((opt, i) => (
          <button key={i} onClick={() => handlePick(i)} style={{
            fontSize: 'clamp(28px,4vw,40px)',
            background: selected === i
              ? (feedback === 'right' ? 'rgba(50,200,100,0.4)' : 'rgba(255,80,80,0.35)')
              : 'rgba(255,255,255,0.12)',
            border: selected === i
              ? (feedback === 'right' ? '2px solid #2ecc71' : '2px solid #ff6060')
              : '2px solid rgba(255,255,255,0.2)',
            borderRadius: 16, padding: '12px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            animation: feedback === 'wrong' && selected === i ? 'shakeIt 0.4s ease' : 'none',
          }}>{opt}</button>
        ))}
      </div>
      {feedback === 'right' && (
        <div style={{ marginTop: 16, color: '#7fff7f', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(15px,2vw,20px)', fontWeight: 'bold', animation: 'bubblePop 0.4s ease' }}>
          🎉 Brilliant! You got it!
        </div>
      )}
    </div>
  );
}

// ─── Activity 2B: Bubble Pop ──────────────────────────────────
const BUBBLE_ROUNDS = [
  { target: '🎩', label: 'hats', pool: ['🎩','🍰','🌸','🎩','⭐','🎩','🫖','🎩'], count: 4 },
  { target: '🍰', label: 'cakes', pool: ['🍰','🎩','🍰','⭐','🍰','🌸','🎩','🍰'], count: 4 },
  { target: '⭐', label: 'stars', pool: ['⭐','🍰','⭐','🎩','⭐','🫖','⭐','🌸'], count: 4 },
];

function Activity2Bubble({ onDone }) {
  const round = useRef(pickRandom(BUBBLE_ROUNDS)).current;
  const [popped, setPopped] = useState([]);
  const [wrong,  setWrong]  = useState([]);
  const [bubbles] = useState(() =>
    round.pool.map((emoji, i) => ({
      id: i, emoji,
      x: 5 + (i * 11) % 88,
      y: 10 + (i * 17) % 60,
      delay: i * 0.3,
    }))
  );

  function handlePop(b) {
    if (popped.includes(b.id) || wrong.includes(b.id)) return;
    if (b.emoji === round.target) {
      const next = [...popped, b.id];
      setPopped(next);
      if (next.length >= round.count) setTimeout(() => onDone(), 800);
    } else {
      setWrong(prev => [...prev, b.id]);
      setTimeout(() => setWrong(prev => prev.filter(id => id !== b.id)), 800);
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(13px,1.6vw,15px)', color: 'rgba(255,230,180,0.8)', fontFamily: 'Lora, serif', fontStyle: 'italic', marginBottom: 8 }}>
        Pop all the <span style={{ fontSize: '1.4em' }}>{round.target}</span> <strong style={{ color: '#fff' }}>{round.label}</strong>! ({popped.length}/{round.count})
      </div>
      <div style={{ position: 'relative', height: 260, width: '100%', overflow: 'hidden' }}>
        {bubbles.map(b => {
          const isPopped = popped.includes(b.id);
          const isWrong  = wrong.includes(b.id);
          return (
            <div key={b.id} onClick={() => handlePop(b)} style={{
              position: 'absolute',
              left: `${b.x}%`, top: `${b.y}%`,
              fontSize: 'clamp(28px,4vw,42px)',
              cursor: isPopped ? 'default' : 'pointer',
              opacity: isPopped ? 0 : 1,
              transform: isPopped ? 'scale(2)' : isWrong ? 'scale(0.8)' : 'scale(1)',
              transition: 'all 0.3s ease',
              animation: !isPopped && !isWrong ? `bubbleFloat ${2 + b.delay}s ease-in-out infinite` : 'none',
              animationDelay: `${b.delay}s`,
              background: isWrong ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.15)',
              borderRadius: '50%', padding: '10px',
              border: isWrong ? '2px solid #ff6060' : '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              userSelect: 'none',
            }}>{b.emoji}</div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Activity 2C: Feed the Hatter ────────────────────────────
const FEED_ROUNDS = [
  { want: '🍰', label: 'cake slice', pool: ['🍰','🫖','🍪','🥐'] },
  { want: '🫖', label: 'teapot',     pool: ['🎩','🫖','🍰','🧁'] },
  { want: '🍪', label: 'cookie',     pool: ['🍪','🥐','🫖','🍰'] },
  { want: '🧁',  label: 'cupcake',   pool: ['🧁','🍪','🎩','🫖'] },
];

function Activity2Feed({ onDone }) {
  const rounds = useRef([...FEED_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 3)).current;
  const [roundIdx, setRoundIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const current = rounds[roundIdx];

  function handleTap(item) {
    if (feedback) return;
    if (item === current.want) {
      setFeedback('right');
      setTimeout(() => {
        setFeedback(null);
        if (roundIdx + 1 >= rounds.length) { onDone(); }
        else setRoundIdx(i => i + 1);
      }, 900);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(13px,1.6vw,15px)', color: 'rgba(255,230,180,0.8)', fontFamily: 'Lora, serif', fontStyle: 'italic', marginBottom: 12 }}>
        Round {roundIdx + 1} of {rounds.length} — Tap the <span style={{ fontSize: '1.4em' }}>{current.want}</span> <strong style={{ color: '#fff' }}>{current.label}</strong>!
      </div>
      {feedback === 'right' && (
        <div style={{ color: '#7fff7f', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(15px,2vw,18px)', fontWeight: 'bold', marginBottom: 8, animation: 'bubblePop 0.3s ease' }}>
          🎉 Yes! Perfect!
        </div>
      )}
      {feedback === 'wrong' && (
        <div style={{ color: '#ff8080', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(15px,2vw,18px)', marginBottom: 8, animation: 'shakeIt 0.4s ease' }}>
          Oops! Try again! 🤔
        </div>
      )}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        {current.pool.map((item, i) => (
          <button key={i} onClick={() => handleTap(item)} style={{
            fontSize: 'clamp(36px,5vw,52px)',
            background: 'rgba(255,255,255,0.12)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: 20, padding: '16px 20px',
            cursor: 'pointer',
            animation: `bubbleFloat ${2.5 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            transition: 'transform 0.15s',
          }}>{item}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Main TeaParty Component ──────────────────────────────────
export default function TeaParty({ playerName, onNext, onBack, onAddItem }) {

  // ── Phase & scene state ───────────────────────────────────────
  const [phase,        setPhase]        = useState('walkin');
  const [girlX,        setGirlX]        = useState(5);
  const [girlBottom,   setGirlBottom]   = useState(5);
  const [girlSize,     setGirlSize]     = useState(3);
  const [girlImg,      setGirlImg]      = useState('/wearingBackpack-walking.png');
  const [showHatter,   setShowHatter]   = useState(false);
  const [hatterImg,    setHatterImg]    = useState('/hatter-idle.png');
  const [bubble,       setBubble]       = useState(null);
  const [showClickHatter, setShowClickHatter] = useState(false);
  const [fadingOut,    setFadingOut]    = useState(false);
  const [showReturn,   setShowReturn]   = useState(false);

  // Activity 1 — colour teacup
  const [teacupFills,  setTeacupFills]  = useState({});
  const [filledCount,  setFilledCount]  = useState(0);
  const [selectedColor,setSelectedColor]= useState(COLORS[0]);
  const [hatterReact,  setHatterReact]  = useState('');
  const [act1Done,     setAct1Done]     = useState(false);

  // Activity 2 — random type
  const [act2Type,     setAct2Type]     = useState(null); // 'pattern'|'bubble'|'feed'
  const [act2Done,     setAct2Done]     = useState(false);

  // Activity 3 — canvas
  const canvasRef  = useRef(null);
  const [drawing,  setDrawing]  = useState(false);
  const [drawColor,setDrawColor]= useState('#e74c3c');
  const [act3Done, setAct3Done] = useState(false);

  // Audio refs
  const entryAudioRef  = useRef(null);
  const hatterAudioRef = useRef(null);
  const act2AudioRef   = useRef(null);
  const winAudioRef    = useRef(null);
  const timers         = useRef([]);

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

  function playAudio(ref, src, delay = 0) {
    stopAudio(ref);
    const a = registerAudio(new Audio(src));
    ref.current = a;
    a.volume = 1.0;
    if (delay > 0) {
      const t = setTimeout(() => a.play().catch(() => {}), delay);
      addTimer(t);
    } else {
      a.play().catch(() => {});
    }
    return a;
  }

  // ── Walk-in sequence ─────────────────────────────────────────
  useEffect(() => {
    // Play entry voice — when it ends, hatter voice plays automatically
    addTimer(setTimeout(() => {
      const a = registerAudio(new Audio('/audio/voice_over/tp_entry.mp3'));
      entryAudioRef.current = a;
      a.volume = 1.0;
      a.play().catch(() => {});
      a.onended = () => {
        // Only auto-play hatter if player hasn't already clicked him
        if (!showClickHatter) return;
        playAudio(hatterAudioRef, '/audio/voice_over/tp_hatter.mp3');
      };
    }, 600));

    addTimer(setTimeout(() => { setGirlX(30); setGirlBottom(8); setGirlSize(3); }, 300));
    addTimer(setTimeout(() => setShowHatter(true), 1200));
    addTimer(setTimeout(() => { setGirlX(28); setGirlImg('/girl-back-headtop.png'); }, 2800));
    addTimer(setTimeout(() => {
      setPhase('hatter');
      setShowClickHatter(true);
    }, 1400));

    return () => { clearTimers(); stopAudio(entryAudioRef); stopAudio(hatterAudioRef); stopAudio(act2AudioRef); stopAudio(winAudioRef); };
  }, []);

  // ── Hatter click — stops both voices, jumps to puzzles ───────
  function handleHatterClick() {
    if (!showClickHatter) return;
    // Stop both entry and hatter voices immediately
    stopAudio(entryAudioRef);
    stopAudio(hatterAudioRef);
    clearTimers();
    setShowClickHatter(false);
    setHatterImg('/hatter-talking.png');

    // Show bubble lines then go to activity
    const lines = [
      "Welcome to my tea party! You're just in time — or perfectly late! 🎩",
      "You and your little friend must solve my three mad puzzles to join!",
      "First! Colour my favourite teacup. Make it as mad as you like! 🎨",
    ];
    let delay = 0;
    lines.forEach((line, i) => {
      addTimer(setTimeout(() => {
        setBubble(line);
        if (i === lines.length - 1) {
          addTimer(setTimeout(() => {
            setBubble(null);
            setHatterImg('/hatter-offering.png');
            setPhase('activity1');
          }, 2500));
        }
      }, delay));
      delay += 2800;
    });
  }

  // ── Activity 1: colour teacup ─────────────────────────────────
  function handleFillSection(sectionId) {
    if (teacupFills[sectionId]) return;
    setTeacupFills(prev => ({ ...prev, [sectionId]: selectedColor }));
    const n = filledCount + 1;
    setFilledCount(n);
    const reactions = [
      "Oh my! What a daring colour! 😄",
      "Splendid! Simply splendid! 🎩",
      "More colour! Yes! MORE! ✨",
      "Wonderfully mad! Keep going! 🌟",
      "PERFECT! The maddest teacup ever! 🎨",
    ];
    setHatterReact(reactions[Math.min(n - 1, reactions.length - 1)]);
    if (n >= 5) setAct1Done(true);
  }

  function handleAct1Next() {
    // Stop hatter greeting voice if still playing
    stopAudio(hatterAudioRef);
    // Pick random activity 2 type and play its voice
    const types = ['pattern', 'bubble', 'feed'];
    const picked = pickRandom(types);
    setAct2Type(picked);
    setPhase('activity2');
    const voiceMap = { pattern: 'tp_pattern.mp3', bubble: 'tp_bubble.mp3', feed: 'tp_feed.mp3' };
    playAudio(act2AudioRef, `/audio/voice_over/${voiceMap[picked]}`, 300);
  }

  // ── Activity 2 done ───────────────────────────────────────────
  function handleAct2Done() {
    stopAudio(act2AudioRef);
    setAct2Done(true);
    setBubble("Now draw the most IMPOSSIBLE thing you can imagine! ✏️");
    addTimer(setTimeout(() => { setBubble(null); setPhase('activity3'); }, 3000));
  }

  // ── Activity 3: canvas ────────────────────────────────────────
  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }
  function startDraw(e) {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  }
  function draw(e) {
    e.preventDefault();
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e, canvasRef.current);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = drawColor; ctx.lineWidth = 4;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
  }
  function endDraw(e) { e.preventDefault(); setDrawing(false); }

  const act3DoneRef = useRef(false);

  function handleAct3Done() {
    if (act3DoneRef.current) return;
    act3DoneRef.current = true;
    setAct3Done(true);
    stopAudio(act2AudioRef);
    handleWin();
  }

  // ── Win sequence ──────────────────────────────────────────────
  function handleWin() {
    onAddItem('Tart 🍰');
    onAddItem('Map Fragment 🗺️');
    setPhase('ending');
    setGirlImg('/girl-tart.png');
    setHatterImg('/hatter-idle.png');

    // Show return button immediately — player doesn't have to wait
    setShowReturn(true);

    // Play hatter win voice — plays fully, not cut off
    playAudio(winAudioRef, '/audio/voice_over/tp_win_hatter.mp3', 500);

    // Bubble conversation runs alongside voice
    setBubble("Wonderful! The finest tea party in ALL of Wonderland! 🎉");
    addTimer(setTimeout(() => {
      setBubble("Take this tart 🍰 and map fragment 🗺️ — you'll need that map at the Royal Court!");
      addTimer(setTimeout(() => setBubble(null), 4000));
    }, 3500));
  }

  // ── Shared panel style (matching firefly forest dark theme) ──
  const panelStyle = {
    background:      'linear-gradient(160deg, #1a0a20 0%, #2d1540 100%)',
    border:          '2px solid rgba(196,139,159,0.25)',
    borderRadius:    '24px',
    padding:         '28px 32px',
    maxWidth:        'min(700px, 92vw)',
    width:           '100%',
    boxShadow:       '0 0 60px rgba(150,50,200,0.15), 0 8px 40px rgba(0,0,0,0.6)',
    position:        'relative',
  };

  const overlayStyle = {
    position:       'absolute',
    inset:          0,
    background:     'rgba(10, 4, 18, 0.78)',
    zIndex:         40,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  };

  const sectionLabel = {
    textAlign:     'center',
    marginBottom:  16,
    fontFamily:    'Cormorant Garamond, serif',
    fontSize:      'clamp(13px, 1.6vw, 15px)',
    color:         'rgba(220,180,255,0.7)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  };

  const titleStyle = {
    fontFamily:   'Cormorant Garamond, Georgia, serif',
    fontSize:     'clamp(18px, 2.5vw, 26px)',
    fontWeight:   'bold',
    color:        '#e8c4ff',
    marginBottom: 14,
    textAlign:    'center',
  };

  const nextBtn = {
    fontFamily:   'Cormorant Garamond, serif',
    fontSize:     'clamp(13px,1.8vw,17px)',
    color:        '#fff',
    background:   'linear-gradient(135deg, #9b59b6, #6b21a8)',
    border:       'none',
    borderRadius: '50px',
    padding:      '11px 30px',
    cursor:       'pointer',
    boxShadow:    '0 4px 16px rgba(107,33,168,0.35)',
    marginTop:    20,
    display:      'block',
    marginLeft:   'auto',
    marginRight:  'auto',
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#1a0a0a' }}>

      {/* Background */}
      <img src="/background-images/TeaParty-opening.png" alt="tea party" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
      }} />

      {/* Mad Hatter — always rendered, clickable from start */}
      {showHatter && (
        <div style={{ position: 'absolute', right: '6%', bottom: '6%', zIndex: 12 }}>
          {bubble && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0, marginBottom: 12,
              background: 'rgba(255,255,255,0.97)', borderRadius: '18px',
              padding: '14px 20px', maxWidth: 280,
              fontFamily: 'Lora, Georgia, serif', fontSize: 'clamp(12px,1.6vw,15px)',
              fontStyle: 'italic', color: '#4a1a6b', lineHeight: 1.55,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              border: '2px solid rgba(196,139,159,0.35)',
              animation: 'bubblePop 0.35s ease-out forwards', zIndex: 20,
            }}>
              {bubble}
              <div style={{
                position: 'absolute', bottom: -12, right: 32,
                width: 0, height: 0,
                borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
                borderTop: '12px solid rgba(255,255,255,0.97)',
              }} />
            </div>
          )}
          <img src={hatterImg} alt="mad hatter" onClick={handleHatterClick} style={{
            height: 'clamp(180px,30vh,300px)',
            cursor: showClickHatter ? 'pointer' : 'default',
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))',
            animation: showClickHatter ? 'hatterBounce 1.5s ease-in-out infinite' : 'none',
          }} />
          {showClickHatter && (
            <div style={{
              position: 'absolute', top: -36, left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.95)', color: '#6b21a8',
              fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold',
              fontSize: 'clamp(11px,1.5vw,14px)', padding: '5px 16px',
              borderRadius: '50px', whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              animation: 'pulseBubble 1.8s ease-in-out infinite', zIndex: 20,
            }}>✨ Click the Hatter!</div>
          )}
        </div>
      )}

      {/* Girl */}
      <img src={girlImg} alt="girl" style={{
        position: 'absolute', bottom: `${girlBottom}%`, left: `${girlX}%`,
        height: `${girlSize * 14}vh`, transform: 'translateX(-50%)',
        transformOrigin: 'bottom center',
        transition: 'left 2.5s ease-out, bottom 2s ease-out, height 2s ease-out',
        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))', zIndex: 10,
      }} />

      {/* ── ACTIVITY 1: Colour teacup ── */}
      {phase === 'activity1' && (
        <div style={overlayStyle}>
          <div style={panelStyle}>
            <div style={sectionLabel}>🎩 Mad Puzzle 1 of 3 🎩</div>
            <div style={titleStyle}>🎨 Colour the Teacup!</div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(12px,1.5vw,14px)', color: 'rgba(220,180,255,0.8)', marginBottom: 16, fontStyle: 'italic', textAlign: 'center' }}>
              Pick a colour, then click each part of the teacup!
            </p>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
              <TeacupSVG fills={teacupFills} onFill={handleFillSection} />
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'rgba(220,180,255,0.7)', marginBottom: 8, fontWeight: 'bold' }}>Pick a colour:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gap: 8 }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setSelectedColor(c)} style={{
                      width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: selectedColor === c ? '3px solid #e8c4ff' : '2px solid rgba(255,255,255,0.2)',
                      boxShadow: selectedColor === c ? '0 0 0 2px #9b59b6' : 'none',
                      transform: selectedColor === c ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }} />
                  ))}
                </div>
                <div style={{ marginTop: 12, fontFamily: 'Lora, serif', fontSize: 12, color: 'rgba(220,180,255,0.6)', fontStyle: 'italic' }}>
                  {filledCount} / 5 sections filled
                </div>
                {hatterReact && (
                  <div style={{
                    marginTop: 12, background: 'rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '8px 12px',
                    fontFamily: 'Lora, serif', fontSize: 'clamp(10px,1.3vw,12px)',
                    fontStyle: 'italic', color: '#e8c4ff', lineHeight: 1.4,
                    animation: 'bubblePop 0.3s ease-out',
                  }}>{hatterReact}</div>
                )}
              </div>
            </div>
            {act1Done && (
              <button onClick={handleAct1Next} style={nextBtn}>Next Puzzle →</button>
            )}
            {/* Girl idle on side */}
            <img src="/girl-idle.png" alt="girl" style={{
              position: 'absolute', bottom: 16, left: 16,
              height: 'clamp(80px,14vh,120px)',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
            }} />
          </div>
        </div>
      )}

      {/* ── ACTIVITY 2: Random ── */}
      {phase === 'activity2' && act2Type && (
        <div style={overlayStyle}>
          <div style={panelStyle}>
            <div style={sectionLabel}>🎩 Mad Puzzle 2 of 3 🎩</div>
            <div style={titleStyle}>
              {act2Type === 'pattern' && '🔮 Complete the Pattern!'}
              {act2Type === 'bubble'  && '🫧 Pop the Magic Bubbles!'}
              {act2Type === 'feed'    && '🍽️ Feed the Hatter!'}
            </div>
            {act2Type === 'pattern' && <Activity2Pattern onDone={handleAct2Done} />}
            {act2Type === 'bubble'  && <Activity2Bubble  onDone={handleAct2Done} />}
            {act2Type === 'feed'    && <Activity2Feed    onDone={handleAct2Done} />}
            {/* Girl idle on side */}
            <img src="/girl-idle.png" alt="girl" style={{
              position: 'absolute', bottom: 16, left: 16,
              height: 'clamp(80px,14vh,120px)',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
            }} />
          </div>
        </div>
      )}

      {/* ── ACTIVITY 3: Canvas draw ── */}
      {phase === 'activity3' && (
        <div style={overlayStyle}>
          <div style={panelStyle}>
            <div style={sectionLabel}>🎩 Mad Puzzle 3 of 3 🎩</div>
            <div style={titleStyle}>✏️ Draw the Most Impossible Thing!</div>
            <p style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(12px,1.5vw,14px)', color: 'rgba(220,180,255,0.8)', marginBottom: 14, fontStyle: 'italic', textAlign: 'center' }}>
              No rules in Wonderland — draw anything! 🌈
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: 'rgba(220,180,255,0.7)', fontWeight: 'bold' }}>Colour:</span>
              {COLORS.map(c => (
                <div key={c} onClick={() => setDrawColor(c)} style={{
                  width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: drawColor === c ? '3px solid #e8c4ff' : '2px solid rgba(255,255,255,0.2)',
                  transform: drawColor === c ? 'scale(1.25)' : 'scale(1)',
                  transition: 'transform 0.15s ease',
                }} />
              ))}
              <button onClick={() => {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }} style={{
                marginLeft: 8, fontFamily: 'Cormorant Garamond, serif', fontSize: 12,
                color: 'rgba(220,180,255,0.8)', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(220,180,255,0.3)', borderRadius: 20,
                padding: '4px 12px', cursor: 'pointer',
              }}>Clear</button>
            </div>
            <canvas ref={canvasRef} width={460} height={200}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
              style={{
                border: '2px solid rgba(196,139,159,0.4)', borderRadius: 16,
                background: '#fff', cursor: 'crosshair', display: 'block',
                touchAction: 'none', maxWidth: '100%',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)', margin: '0 auto',
              }}
            />
            <button onClick={handleAct3Done} style={{ ...nextBtn, background: 'linear-gradient(135deg, #e8a4b8, #c48b9f)' }}>
              I'm done! ✨
            </button>
            <img src="/girl-idle.png" alt="girl" style={{
              position: 'absolute', bottom: 16, left: 16,
              height: 'clamp(80px,14vh,120px)',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
            }} />
          </div>
        </div>
      )}

      {/* ── ENDING ── */}
      {phase === 'ending' && showReturn && (
        <button onClick={() => {
          stopAll();
          setFadingOut(true);
          setTimeout(() => onNext(), 1200);
        }} style={{
          position: 'absolute', right: '4%', bottom: '8%',
          fontFamily: 'Cormorant Garamond, serif', fontSize: 18,
          color: '#fff', background: 'linear-gradient(135deg, #e8a4b8, #c48b9f)',
          border: 'none', borderRadius: '50px', padding: '14px 30px',
          cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          zIndex: 50, animation: 'bubblePop 0.4s ease',
        }}>Back to Mystery Room →</button>
      )}

      {/* Fade overlay */}
      <div style={{
        position: 'absolute', inset: 0, background: '#000',
        opacity: fadingOut ? 1 : 0, transition: 'opacity 1.2s ease',
        zIndex: 60, pointerEvents: 'none',
      }} />

      {/* Back button */}
      <button onClick={() => { stopAll(); onBack(); }} style={{
        position: 'absolute', top: '3%', left: '2%',
        background: 'rgba(255,255,255,0.85)', color: '#6b21a8',
        fontFamily: 'Cormorant Garamond, serif', fontWeight: 'bold',
        fontSize: 'clamp(12px,1.5vw,15px)', padding: '8px 20px',
        borderRadius: '50px', border: 'none', cursor: 'pointer',
        zIndex: 70, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>← Back</button>

      <style>{`
        @keyframes bubblePop {
          0%   { opacity: 0; transform: scale(0.75) translateY(8px); }
          70%  { transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes hatterBounce {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes pulseBubble {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%     { transform: translateX(-50%) scale(1.07); }
        }
        @keyframes shakeIt {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-8px); }
          75%     { transform: translateX(8px); }
        }
        @keyframes bubbleFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50%     { transform: translateY(-10px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
