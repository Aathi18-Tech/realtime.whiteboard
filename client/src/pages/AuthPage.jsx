import { useState } from "react";
import { apiPost } from "../utils/api";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      const data = await apiPost(
        isLogin ? "/auth/login" : "/auth/register",
        payload
      );

      localStorage.setItem("authUser", JSON.stringify(data));
      onAuthSuccess(data);
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
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #7c3aed 100%)",
        padding: "20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "22px",
          padding: "32px",
          color: "white",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <p style={{ marginTop: "10px", opacity: 0.9 }}>
          {isLogin
            ? "Login with your existing account"
            : "Register and start building your collaborative boards"}
        </p>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}
        >
          {!isLogin && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={inputStyle}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={inputStyle}
          />

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.18)",
                border: "1px solid rgba(239,68,68,0.4)",
                padding: "10px 12px",
                borderRadius: "10px",
                color: "#fecaca",
                fontWeight: "600"
              }}
            >
              {error}
            </div>
          )}

          <button onClick={handleSubmit} style={primaryButton} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>

          <button
            onClick={() => {
              setMode(isLogin ? "register" : "login");
              setError("");
            }}
            style={secondaryButton}
          >
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
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