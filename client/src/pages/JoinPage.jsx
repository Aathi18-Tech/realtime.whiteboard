import { useState } from "react";

export default function JoinPage({ authUser, onJoin, onLogout }) {
  const [roomId, setRoomId] = useState(localStorage.getItem("roomId") || "");

  const generateRoom = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const copyRoom = async () => {
    if (!roomId) {
      alert("Generate room first");
      return;
    }
    await navigator.clipboard.writeText(roomId);
    alert("Room ID copied");
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Enter room ID");
      return;
    }

    localStorage.setItem("roomId", roomId);

    onJoin({
      roomId,
      userName: authUser.name
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 45%, #ec4899 100%)",
        padding: "20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "22px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
          color: "white"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "30px", fontWeight: "700" }}>
              Hello, {authUser.name}
            </h1>
            <p style={{ marginTop: "8px", opacity: 0.92 }}>
              Join or create a collaborative whiteboard room.
            </p>
          </div>

          <button onClick={onLogout} style={logoutButton}>
            Logout
          </button>
        </div>

        <div
          style={{
            marginTop: "22px",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          <input
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={generateRoom} style={secondaryButton}>
              Generate Room
            </button>
            <button onClick={copyRoom} style={secondaryButton}>
              Copy Room ID
            </button>
          </div>

          <button onClick={joinRoom} style={primaryButton}>
            Enter Whiteboard
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.25)",
  outline: "none",
  background: "rgba(255,255,255,0.16)",
  color: "white",
  fontSize: "15px"
};

const primaryButton = {
  padding: "14px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#111827",
  color: "white",
  fontWeight: "700",
  cursor: "pointer"
};

const secondaryButton = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "none",
  background: "rgba(255,255,255,0.18)",
  color: "white",
  fontWeight: "600",
  cursor: "pointer"
};

const logoutButton = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#dc2626",
  color: "white",
  fontWeight: "700",
  cursor: "pointer"
};