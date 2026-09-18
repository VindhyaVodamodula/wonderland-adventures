import { useState } from "react";

// Items with their emojis
const ITEM_EMOJIS = {
  "Brass Key":     "🗝️",
  "Tart":          "🍰",
  "Map Fragment":  "🗺️",
  "Crown":         "👑",
  "Rose":          "🌹",
};

export default function Bag({ items = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bag icon button */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position:     "absolute",
          bottom:       "4%",
          right:        "2%",
          width:        "clamp(50px, 7vw, 80px)",
          height:       "clamp(50px, 7vw, 80px)",
          cursor:       "pointer",
          zIndex:       50,
          filter:       "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
          transition:   "transform 0.2s ease",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <img
          src="/bag.png"
          alt="bag"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        {/* Item count badge */}
        {items.length > 0 && (
          <div style={{
            position:     "absolute",
            top:          "-6px",
            right:        "-6px",
            background:   "linear-gradient(135deg, #e8a4b8, #c48b9f)",
            color:        "#fff",
            fontFamily:   "Cormorant Garamond, serif",
            fontWeight:   "bold",
            fontSize:     "clamp(10px, 1.5vw, 14px)",
            width:        "22px",
            height:       "22px",
            borderRadius: "50%",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            boxShadow:    "0 2px 8px rgba(0,0,0,0.3)",
          }}>
            {items.length}
          </div>
        )}
      </div>

      {/* Bag popup */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            inset:      0,
            zIndex:     49,
            background: "transparent",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position:     "absolute",
              bottom:       "14%",
              right:        "2%",
              background:   "rgba(255,250,240,0.97)",
              borderRadius: "20px",
              padding:      "20px 24px",
              minWidth:     "200px",
              maxWidth:     "280px",
              boxShadow:    "0 8px 32px rgba(0,0,0,0.25)",
              border:       "2px solid rgba(196,139,159,0.3)",
              zIndex:       51,
            }}
          >
            <p style={{
              fontFamily:   "Cormorant Garamond, serif",
              fontSize:     "clamp(14px, 2vw, 18px)",
              fontWeight:   "bold",
              color:        "#6b21a8",
              marginBottom: "12px",
              textAlign:    "center",
            }}>
              🎒 My Bag
            </p>

            {items.length === 0 ? (
              <p style={{
                fontFamily: "Lora, serif",
                fontSize:   "clamp(12px, 1.5vw, 15px)",
                color:      "#b07a8a",
                fontStyle:  "italic",
                textAlign:  "center",
              }}>
                Empty for now...<br />go explore! 🌸
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item, i) => (
                  <div key={i} style={{
                    fontFamily:   "Lora, serif",
                    fontSize:     "clamp(13px, 1.8vw, 16px)",
                    color:        "#4a1a6b",
                    padding:      "6px 12px",
                    background:   "rgba(196,139,159,0.1)",
                    borderRadius: "12px",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "8px",
                  }}>
                    <span style={{ fontSize: "20px" }}>
                      {ITEM_EMOJIS[item] || "✨"}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

