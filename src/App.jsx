import { useState, useEffect } from 'react'
import OpeningScene       from './components/OpeningScene'
import RabbitHoleRoom     from './components/RabbitHoleRoom'
import MysteryRoom        from './components/MysteryRoom'
import Bag                from './components/Bag'
import MysteryRoomChoice  from './components/MysteryRoomChoice_1'
import FireflyForest      from './components/FireflyForest_1'
import MysteryRoomReturn  from './components/MysteryRoomReturn'
import TeaParty           from './components/TeaParty'
import RoyalCourt         from './components/RoyalCourt'
import MysteryRoomOpen    from './components/MysteryRoomOpen'
import { useAudio } from './useAudio'
import { registerAudio, stopAll } from './audioRegistry'



function HangingTitle({ text }) {
  return (
    <h1 style={{
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: 'clamp(2rem, 6vw, 3.5rem)',
      color: '#a0522d', textAlign: 'center', lineHeight: 1.4,
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px'
    }}>
      {text.split('').map((letter, i) => (
        <span key={i} style={{
          display: 'inline-block',
          animation: `hang 2.5s ease-in-out infinite`,
          animationDelay: `${i * 0.1}s`,
          transformOrigin: 'top center',
          whiteSpace: letter === ' ' ? 'pre' : 'normal',
          minWidth: letter === ' ' ? '12px' : 'auto'
        }}>{letter}</span>
      ))}
    </h1>
  )
}

function TitleScreen({ onBegin }) {
  
  return (
    <div className="w-full max-w-2xl rounded-3xl p-8 flex flex-col items-center gap-6"
      style={{
        background:    'rgba(255,255,255,0.12)',
        backdropFilter:'blur(4px)',
        border:        '1px solid rgba(255,255,255,0.25)',
        maxWidth: '500px',
        width: '90vw',
        boxShadow:     '0 8px 40px rgba(0,0,0,0.2)'
      }}>
      <p style={{ fontFamily: 'Lora, serif', color: 'purple', fontSize: '13px', letterSpacing: '3px', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
        ✦ ONCE UPON A TIME IN ✦
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <HangingTitle text="Wonderland" />
        <HangingTitle text="Adventures" />
      </div>
      <p style={{ fontFamily: 'Lora, serif', color: 'purple', fontSize: '15px', textAlign: 'center', fontStyle: 'italic', maxWidth: '360px', lineHeight: 1.7, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
        A magical storybook adventure for brave little hearts
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '80%', maxWidth: '200px' }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6))' }} />
        <span style={{ color: 'purple', fontSize: '18px' }}>🌸</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.6), transparent)' }} />
      </div>
      <button onClick={onBegin} style={{
        fontFamily:  'Cormorant Garamond, serif', fontSize: '18px', color: 'white',
        background:  'purple', border: 'none',
        borderRadius:'50px', padding: '12px 40px', cursor: 'pointer',
        letterSpacing:'2px', boxShadow: '0 4px 20px rgba(196,139,159,0.4)', transition: 'transform 0.2s'
      }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
      >
        Begin the Adventure ✨
      </button>
      <p style={{ fontFamily: 'Lora, serif', color: 'purple', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
        follow the rabbit, explore what's inside its hole 🐇
      </p>
    </div>
  )
}
function WinEffects() {
  const symbols = ['✨','🌸','⭐','💫','🌟','🎉','💖','🌹']
  
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none', overflow: 'hidden' }}>
      {symbols.map((sym, si) =>
        [0,1,2,3,4,5,6].map((j) => (
          <div key={`${si}-${j}`} style={{
            position:        'absolute',
            left:            `${(si * 13 + j * 7) % 100}%`,
            top:             '-40px',
            fontSize:        `${14 + (j % 3) * 6}px`,
            animationName:   'sparkFall',
            animationDuration: `${2.5 + (j * 0.4)}s`,
            animationDelay:  `${(si * 0.3 + j * 0.5) % 3}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}>
            {sym}
          </div>
        ))
      )}
      <style>{`
        @keyframes sparkFall {
          0%   { transform: translateY(0px)    rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh)  rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function WinVoice() {
  useEffect(() => {
    const a = registerAudio(new Audio('/audio/voice_over/win_celebration.mp3'));
    a.volume = 1.0;
    const t = setTimeout(() => {
      a.play().catch(() => {
        const unlock = () => { a.play().catch(() => {}); document.removeEventListener('click', unlock); };
        document.addEventListener('click', unlock);
      });
    }, 800);
    return () => { clearTimeout(t); a.onended = null; a.pause(); a.src = ''; };
  }, []);
  return null;
}
function StarRating() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ marginBottom: 20, textAlign: 'center' }}>
      <div style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(12px,1.6vw,15px)', fontStyle: 'italic', color: '#fff', marginBottom: 10, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
        How did you like Wonderland? ⭐
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {[1,2,3,4,5].map(star => (
          <span key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              fontSize: 'clamp(28px,4vw,42px)',
              cursor: 'pointer',
              filter: (hovered || rating) >= star ? 'none' : 'grayscale(1) brightness(0.5)',
              transition: 'transform 0.15s ease, filter 0.15s ease',
              transform: (hovered || rating) >= star ? 'scale(1.25)' : 'scale(1)',
            }}>⭐</span>
        ))}
      </div>
      {rating > 0 && (
        <div style={{ marginTop: 10, fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(13px,1.8vw,17px)', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.6)', animation: 'bubblePop 0.4s ease' }}>
          {rating === 5 ? '🎉 Amazing! Thank you!' : rating >= 3 ? '😊 Thank you!' : '💛 Thanks for playing!'}
        </div>
      )}
    </div>
  );
}




function NameScreen({ onStart }) {
  const [name, setName] = useState('')
  const handleStart = () => {
    if (name.trim() === '') return
    const formatted = name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
    onStart(formatted)
  }
  return (
    <div className="w-full max-w-lg rounded-3xl p-10 flex flex-col items-center gap-6"
      
      style={{
        background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(1px)',
        border: '1px solid rgba(255,182,193,0.4)', boxShadow: '0 8px 40px rgba(255,182,193,0.3)',
        maxWidth: '500px',
        width: '90vw',
        animation: 'fadeUp 0.6s ease'
      }}>
      <div style={{ fontSize: '48px', animation: 'bounce 1s ease-in-out infinite' }}>🐇</div>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: 'purple', textAlign: 'center', lineHeight: 1.4 }}>
        Before we begin...
      </h2>
      <p style={{ fontFamily: 'Lora, serif', color: 'purple', fontSize: '15px', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.8, maxWidth: '340px' }}>
        The White Rabbit stops and turns around.<br />
        <em>"Oh my! I almost forgot to ask —</em><br />
        <strong>what is your name, brave traveller?"</strong>
      </p>
      <input
        type="text" placeholder="Type your name here..."
        value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleStart() }}
        maxLength={20}
        style={{
          fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#a0522d',
          background: 'rgba(255,255,255,0.8)', border: '2px solid #e8a4b8',
          borderRadius: '50px', padding: '12px 24px', textAlign: 'center',
          outline: 'none', width: '100%', maxWidth: '300px', transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#c48b9f'}
        onBlur={e => e.target.style.borderColor = '#e8a4b8'}
      />
      <p style={{ fontFamily: 'Lora, serif', color: 'purple', fontSize: '12px', fontStyle: 'italic' }}>
        press Enter or click the button below
      </p>
      <button onClick={handleStart} style={{
        fontFamily:  'Cormorant Garamond, serif', fontSize: '18px', color: 'white',
        background:  'purple', border: 'none',
        borderRadius:'50px', padding: '12px 40px', cursor: 'pointer',
        letterSpacing:'2px', boxShadow: '0 4px 20px rgba(196,139,159,0.4)', transition: 'transform 0.2s'
      }}>
        Into the Rabbit Hole! 🕳️
      </button>
    </div>
  )
}

function GameContainer({ children }) {
  return <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>{children}</div>
}

/* ── Main App ── */
function App() {
  const [screen,     setScreen]     = useState('title')
  const [playerName, setPlayerName] = useState('')
  const [room,       setRoom]       = useState('rabbit-hole')
  const [bagItems,   setBagItems]   = useState([])
  const [lastChoice, setLastChoice] = useState('')

  // Tracks whether the girl has won the rose yet
  // false  → mystery-open shows royal court door glowing
  // true   → mystery-open shows mushroom door glowing
  const [wonRose, setWonRose] = useState(false)

  const addItem = (item) => setBagItems(prev =>
    prev.find(i => i === item) ? prev : [...prev, item]
  )

  const handleBegin     = () => { stopAll(); setScreen('name') }
  const handleStart     = (name) => { stopAll(); setPlayerName(name); setScreen('opening') }
  const handleEnterGame = () => { stopAll(); setRoom('rabbit-hole'); setScreen('game') }
  const audioKey = screen === 'game' ? room : screen
useAudio(audioKey)
useEffect(() => {
  const unlock = () => {
    document.removeEventListener('click', unlock)
    document.removeEventListener('keydown', unlock)
  }
  document.addEventListener('click', unlock)
  document.addEventListener('keydown', unlock)
}, [])
useEffect(() => {
  const voMap = {
    title: '/audio/voice_over/title_vo.mp3',
    name:  '/audio/voice_over/name_vo.mp3',
  }
  const src = voMap[screen]
  if (!src) return
  const audio = registerAudio(new Audio(src))
  audio.volume = 1.0
  let t = null

  function tryPlay() {
    audio.play().catch(() => {});
  }

  // Try immediately after short delay
  t = setTimeout(() => {
    audio.play().catch(() => {
      // Autoplay blocked — play on next interaction
      const unlock = () => {
        tryPlay();
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
        document.removeEventListener('touchstart', unlock);
      };
      document.addEventListener('click', unlock);
      document.addEventListener('keydown', unlock);
      document.addEventListener('touchstart', unlock);
    });
  }, 800)

  return () => {
    clearTimeout(t);
    audio.onended = null;
    audio.pause();
    audio.src = '';
  }
}, [screen])

  return (
    <>
      {/* ── Title / Name ── */}
      {(screen === 'title' || screen === 'name') && (
        <div className="min-h-screen flex items-center justify-center p-4"
style={{
  backgroundImage:    'url(/background-images/titile-bg.png)',
  backgroundSize:     'cover',
  backgroundPosition: 'center',
  minHeight:          '100vh',
  height:             '100%',
}}>
          {screen === 'title' && <TitleScreen onBegin={handleBegin} />}
          {screen === 'name'  && <NameScreen  onStart={handleStart} />}
          <style>{`
            @keyframes hang {
              0%, 100% { transform: rotate(-4deg); }
              50%       { transform: rotate(4deg); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0px); }
              50%       { transform: translateY(-10px); }
            }
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0px); }
            }
          `}</style>
        </div>
      )}

      {/* ── Opening video ── */}
      {screen === 'opening' && (
        <GameContainer>
          <OpeningScene playerName={playerName} onStart={handleEnterGame} />
        </GameContainer>
      )}

      {/* ── Game ── */}
      {screen === 'game' && (
        <GameContainer>

          {/* 1 — Rabbit Hole */}
          {room === 'rabbit-hole' && (
            <RabbitHoleRoom
              playerName={playerName}
              onNext={() => { stopAll(); setRoom('mystery') }}
              onBack={() => { stopAll(); setScreen('title'); setRoom('rabbit-hole') }}
              onAddItem={addItem}
            />
          )}

          {/* 2 — Mystery Room (first visit, cake/bottle choice) */}
          {room === 'mystery' && (
            <MysteryRoom
              playerName={playerName}
              onChoice={(choice) => {
                stopAll()
                setLastChoice(choice)
                setRoom('mystery-choice')
              }}
              onBack={() => { stopAll(); setScreen('title') }}
              onAddItem={addItem}
            />
          )}

          {/* 3 — Mystery Room Choice (grow/shrink animation) */}
          {room === 'mystery-choice' && (
            <MysteryRoomChoice
              choice={lastChoice}
              onNext={() => { stopAll(); setRoom(lastChoice === 'cake' ? 'royal-court' : 'firefly-forest') }}
              onBack={() => { stopAll(); setRoom('mystery') }}
            />
          )}

          {/* 4 — Firefly Forest */}
          {room === 'firefly-forest' && (
            <FireflyForest
              playerName={playerName}
              onNext={() => {
                stopAll()
                addItem('Brass Key 🗝️')
                setRoom('mystery-return')
              }}
              onBack={() => { stopAll(); setRoom('mystery-choice') }}
            />
          )}

          {/* 5 — Royal Court
               - If came via cake (no map) → Path B, Cheshire Cat, back to mystery
               - If came via mystery-open (has map) → Path A, solves puzzles, wins rose */}
          {room === 'royal-court' && (
            <RoyalCourt
              playerName={playerName}
              bagItems={bagItems}
              onNext={() => {
                stopAll()
                addItem('Crown 👑')
                addItem('Rose 🌹')
                setWonRose(true)
                setRoom('mystery-open')
              }}
              onBack={() => {
                stopAll()
                setRoom('mystery-rc-return')
              }}
              onAddItem={addItem}
            />
          )}

          {/* 5b — Mystery Room RC Return
               Girl comes back from Royal Court without map.
               RC door shown open, only bottle glows. */}
          {room === 'mystery-rc-return' && (
            <MysteryRoom
              playerName={playerName}
              returning={true}
              onChoice={(choice) => {
                stopAll()
                setLastChoice(choice)
                setRoom('mystery-choice')
              }}
              onBack={() => { stopAll(); setScreen('title') }}
              onAddItem={addItem}
            />
          )}

          {/* 6 — Mystery Room Return
               (comes back from firefly forest, keyhole door glows → tea party) */}
          {room === 'mystery-return' && (
            <MysteryRoomReturn
              playerName={playerName}
              lastChoice={lastChoice}
              onNext={() => { stopAll(); setRoom('tea-party') }}
              onBack={() => { stopAll(); setRoom('mystery-choice') }}
            />
          )}

          {/* 7 — Tea Party */}
          {room === 'tea-party' && (
            <TeaParty
              playerName={playerName}
              onNext={() => {
                stopAll()
                addItem('Tart 🍰')
                addItem('Map Fragment 🗺️')
                setRoom('mystery-open')
              }}
              onBack={() => { stopAll(); setRoom('mystery-return') }}
              onAddItem={addItem}
            />
          )}

          {/* 8 — Mystery Room Open (MR-open.png, all doors open)
               Visit 1 (wonRose=false): royal court door glows → go to royal court
               Visit 2 (wonRose=true):  mushroom door glows   → go to win */}
          {room === 'mystery-open' && (
            <MysteryRoomOpen
              playerName={playerName}
              wonRose={wonRose}
              onRoyal={() => { stopAll(); setRoom('royal-court') }}
              onMushroom={() => { stopAll(); setRoom('win') }}
              onBack={() => { stopAll(); setRoom('tea-party') }}
            />
          )}

          {/* 9 — Win screen */}
          {room === 'win' && (
            <div style={{ position: 'absolute', inset: 0, background: '#0a1a0a' }}>
              <img src="/background-images/Win-QueensGarden.png" alt="queens garden"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <WinEffects/>
              <WinVoice/>
              <img src="/girl-final-win.png" alt="girl celebrating"
                style={{
                  position:  'absolute',
                  bottom:    '8%',
                  left:      '50%',
                  transform: 'translateX(-50%)',
                  height:    'clamp(180px, 32vh, 320px)',
                  filter:    'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
                  zIndex:    10,
                  animation: 'celebrateFloat 2s ease-in-out infinite',
                }}
              />
              <div style={{
                position:   'absolute',
                top:        '4%',
                left:       '2%',
                transform:  'none',
                background:   'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',

                borderRadius:'32px',
                padding:    '28px 48px',
                textAlign:  'center',
                boxShadow:  '0 12px 60px rgba(0,0,0,0.3)',
                border:     '2px solid rgba(255,255,255,0.2)',
                animation:  'winPop 0.7s ease-out',
                zIndex:     20,
                maxWidth:   '88vw',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉🌹👑🗺️🗝️🎉</div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize:   'clamp(22px, 3.5vw, 38px)',
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  marginBottom:'10px',
                }}>
                  You did it, {playerName}!
                </div>
                <p style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontSize:   'clamp(12px, 1.8vw, 16px)',
                  fontStyle:  'italic',
                  color:      '#5b3a10',
                  lineHeight: 1.8,
                  marginBottom:'22px',
                }}>
                  You explored the rabbit hole, found the Brass Key,<br />
                  helped the Mad Hatter, solved the Queen's puzzle,<br />
                  and discovered the Queen's Garden! 🌸
                </p>
                <StarRating />
                <button
                  onClick={() => {
                    setScreen('title')
                    setRoom('rabbit-hole')
                    setBagItems([])
                    setLastChoice('')
                    setWonRose(false)
                  }}

                  style={{
                    fontFamily:   'Cormorant Garamond, serif',
                    fontSize:     'clamp(14px, 2vw, 18px)',
                    color:        '#fff',
                    background:   'linear-gradient(135deg, #e8a4b8, #c48b9f)',
                    border:       'none',
                    borderRadius: '50px',
                    padding:      '13px 36px',
                    cursor:       'pointer',
                    boxShadow:    '0 4px 20px rgba(196,139,159,0.4)',
                  }}
                >
                  Play Again ✨
                </button>
              </div>
              <style>{`
                @keyframes celebrateFloat {
                  0%,100% { transform: translateX(-50%) translateY(0); }
                  50%     { transform: translateX(-50%) translateY(-14px); }
                }
                @keyframes winPop {
                0%   { opacity: 0; transform: scale(0.8); }
                70%  { transform: scale(1.03); }
                100% { opacity: 1; transform: scale(1); }
              }
              `}</style>
            </div>
          )}

          {/* Bag — always visible during game */}
          <Bag items={bagItems} />

        </GameContainer>
      )}
    </>
  )
}

export default App
