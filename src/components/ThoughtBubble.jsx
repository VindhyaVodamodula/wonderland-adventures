export default function ThoughtBubble({ text, girlX, girlBottom, girlSize = 1 }) {
  if (!text) return null;

  const girlHeightVh = girlSize * 14;
  const bubbleLeft   = `calc(${girlX}% + ${girlSize * 3}vw)`;
  const bubbleBottom = `calc(${girlBottom}% + ${girlHeightVh}vh - 2vh)`;

  return (
    <div style={{
      position:      'absolute',
      left:          bubbleLeft,
      bottom:        bubbleBottom,
      transform:     'translateX(-50%)',
      zIndex:        50,
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      animation:     'bubblePop 0.4s ease-out forwards',
      pointerEvents: 'none',
      transition:    'left 0.4s ease-out, bottom 0.4s ease-out',
    }}>
      <div style={{
        background:   'rgba(255,255,255,0.96)',
        borderRadius: '20px',
        padding:      '10px 18px',
        maxWidth:     '200px',
        textAlign:    'center',
        fontFamily:   'Lora, Georgia, serif',
        fontSize:     'clamp(11px, 1.5vw, 14px)',
        fontStyle:    'italic',
        color:        '#4a1a6b',
        lineHeight:   1.5,
        boxShadow:    '0 4px 16px rgba(0,0,0,0.15)',
        border:       '2px solid rgba(196,139,159,0.3)',
        whiteSpace:   'nowrap',
      }}>
        {text}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
        {[10, 7, 5].map((size, i) => (
          <div key={i} style={{
            width: `${size}px`, height: `${size}px`,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            border: '2px solid rgba(196,139,159,0.3)',
          }} />
        ))}
      </div>
      <style>{`
        @keyframes bubblePop {
          0%   { opacity: 0; transform: translateX(-50%) scale(0.7) translateY(10px); }
          70%  { transform: translateX(-50%) scale(1.05) translateY(-2px); }
          100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}