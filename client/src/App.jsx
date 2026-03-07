import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import JoinPage from "./pages/JoinPage";
import WhiteboardPage from "./pages/WhiteboardPage";

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
      const storedRoomId = localStorage.getItem("roomId");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setAuthUser(parsedUser);

        if (storedRoomId) {
          setRoomData({
            roomId: storedRoomId,
            userName: parsedUser.name
          });
        }
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      localStorage.removeItem("authUser");
      localStorage.removeItem("roomId");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    localStorage.setItem("authUser", JSON.stringify(user));
    setAuthUser(user);
  };

  const handleJoin = (room) => {
    localStorage.setItem("roomId", room.roomId);
    setRoomData(room);
  };

  const handleLeave = () => {
    localStorage.removeItem("roomId");
    setRoomData(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("roomId");
    setAuthUser(null);
    setRoomData(null);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
          background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 45%, #ec4899 100%)",
          color: "white",
          fontSize: "22px",
          fontWeight: "700"
        }}
      >
        Loading...
      </div>
    );
  }

  if (!authUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (!roomData) {
    return (
      <JoinPage
        authUser={authUser}
        onJoin={handleJoin}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <WhiteboardPage
      roomId={roomData.roomId}
      userName={roomData.userName}
      onLeave={handleLeave}
    />
  );
}