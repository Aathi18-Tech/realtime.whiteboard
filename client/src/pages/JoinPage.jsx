import { useState } from "react";

const doodleBg = `
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='%23b8b8c7' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' opacity='0.8'%3E%3Cpath d='M20 30l30-10 20 20-20 20z'/%3E%3Cpath d='M95 20l18 40 24-30'/%3E%3Cpath d='M150 18c18 8 24 30 10 42-14 12-32 6-38-8-6-14 4-30 28-34z'/%3E%3Cpath d='M22 98c30-18 46 16 20 24-26 8-26 30-4 34'/%3E%3Cpath d='M80 88l0 48'/%3E%3Cpath d='M65 112h30'/%3E%3Cpath d='M118 90l34 34'/%3E%3Cpath d='M152 90l-34 34'/%3E%3Cpath d='M180 84c12 10 14 24 4 34-10 10-26 8-34-2-8-10-4-24 8-32 8-6 14-6 22 0z'/%3E%3Cpath d='M12 162l20 22 34-10-10-28z'/%3E%3Cpath d='M82 154l10 38 18-30 18 24'/%3E%3Cpath d='M150 154c18-6 34 4 36 20 2 16-10 28-30 28-20 0-34-12-32-26 2-14 10-18 26-22z'/%3E%3Cpath d='M180 150l0 42'/%3E%3Cpath d='M168 170h24'/%3E%3C/g%3E%3C/svg%3E")
`;

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const inputStyle = {
  width: "100%",
  marginBottom: "12px",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(156,163,175,0.25)",
  outline: "none",
  fontSize: "14px",
  background: "rgba(255,255,255,0.42)",
  color: "#374151",
  boxSizing: "border-box",
  backdropFilter: "blur(6px)"
};

const smallBtn = {
  flex: 1,
  border: "1px solid rgba(107,114,128,0.14)",
  borderRadius: "10px",
  padding: "11px 14px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#4b5563",
  background: "rgba(255,255,255,0.45)",
  cursor: "pointer"
};

export default function JoinPage({ userName, onJoin, onLogout }) {
  const [roomId, setRoomId] = useState("");

  const handleGenerate = () => {
    setRoomId(generateRoomId());
  };

  const handleCopy = async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(roomId);
    alert("Room ID copied");
  };

  const handleEnter = () => {
    if (!roomId.trim()) {
      alert("Please enter or generate a room ID");
      return;
    }
    localStorage.setItem("roomId", roomId.trim());
    onJoin(roomId.trim());
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f4f4f8",
        backgroundImage: doodleBg,
        backgroundRepeat: "repeat",
        backgroundSize: "220px 220px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          borderRadius: "24px",
          padding: "26px 26px 22px",
          color: "#3f3f46",
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.14)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(240,240,240,0.58))",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.2,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9), transparent 28%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.65), transparent 24%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.45), transparent 22%), repeating-linear-gradient(135deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 2px, transparent 2px, transparent 10px)"
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 800,
                color: "#4b5563"
              }}
            >
              Hello, {userName}
            </h1>

            <button
              onClick={onLogout}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "12px",
                fontWeight: 700,
                color: "white",
                background: "#ef4444",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>

          <p
            style={{
              margin: "0 0 18px",
              fontSize: "13px",
              color: "#6b7280",
              lineHeight: 1.4
            }}
          >
            Join or create a collaborative whiteboard room.
          </p>

          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            style={inputStyle}
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "12px"
            }}
          >
            <button onClick={handleGenerate} style={smallBtn}>
              Generate Room
            </button>

            <button onClick={handleCopy} style={smallBtn}>
              Copy Room ID
            </button>
          </div>

          <button
            onClick={handleEnter}
            style={{
              width: "100%",
              border: "none",
              borderRadius: "10px",
              padding: "12px 14px",
              fontSize: "14px",
              fontWeight: 700,
              color: "white",
              background: "#4b5563",
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(55,65,81,0.22)"
            }}
          >
            Enter Whiteboard
          </button>
        </div>
      </div>
    </div>
  );
}