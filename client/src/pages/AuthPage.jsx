import { useState } from "react";
import { apiPost } from "../utils/api";

const doodleBg = `
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='%23b8b8c7' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' opacity='0.8'%3E%3Cpath d='M20 30l30-10 20 20-20 20z'/%3E%3Cpath d='M95 20l18 40 24-30'/%3E%3Cpath d='M150 18c18 8 24 30 10 42-14 12-32 6-38-8-6-14 4-30 28-34z'/%3E%3Cpath d='M22 98c30-18 46 16 20 24-26 8-26 30-4 34'/%3E%3Cpath d='M80 88l0 48'/%3E%3Cpath d='M65 112h30'/%3E%3Cpath d='M118 90l34 34'/%3E%3Cpath d='M152 90l-34 34'/%3E%3Cpath d='M180 84c12 10 14 24 4 34-10 10-26 8-34-2-8-10-4-24 8-32 8-6 14-6 22 0z'/%3E%3Cpath d='M12 162l20 22 34-10-10-28z'/%3E%3Cpath d='M82 154l10 38 18-30 18 24'/%3E%3Cpath d='M150 154c18-6 34 4 36 20 2 16-10 28-30 28-20 0-34-12-32-26 2-14 10-18 26-22z'/%3E%3Cpath d='M180 150l0 42'/%3E%3Cpath d='M168 170h24'/%3E%3C/g%3E%3C/svg%3E")
`;

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

export default function AuthPage({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      const data = await apiPost(path, payload);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.name || name);
      localStorage.setItem("userEmail", data.email || email);

      onAuthSuccess?.(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "20px",
              fontWeight: 800,
              color: "#4b5563"
            }}
          >
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>

          <p
            style={{
              margin: "0 0 18px",
              fontSize: "13px",
              color: "#6b7280",
              lineHeight: 1.4
            }}
          >
            {isLogin
              ? "Login with your existing account"
              : "Create your account and start using the whiteboard"}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />

            {error && (
              <div
                style={{
                  marginBottom: "12px",
                  fontSize: "13px",
                  color: "#b91c1c",
                  background: "rgba(254,226,226,0.75)",
                  border: "1px solid rgba(248,113,113,0.35)",
                  borderRadius: "10px",
                  padding: "10px 12px"
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "14px",
                fontWeight: 700,
                color: "white",
                background: "#4b5563",
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: "10px",
                boxShadow: "0 8px 18px rgba(55,65,81,0.22)"
              }}
            >
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              width: "100%",
              border: "1px solid rgba(107,114,128,0.14)",
              borderRadius: "10px",
              padding: "11px 14px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#4b5563",
              background: "rgba(255,255,255,0.45)",
              cursor: "pointer"
            }}
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}