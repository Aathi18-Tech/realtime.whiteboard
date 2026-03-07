export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  brushSize,
  setBrushSize,
  onUndo,
  onRedo,
  onClear,
  onLeave,
  onExportPNG,
  onExportPDF,
  onSaveVersion,
  darkMode,
  setDarkMode
}) {
  const toolButton = (id, label, icon) => (
    <button
      onClick={() => setTool(id)}
      style={{
        padding: "10px 12px",
        border: "none",
        borderRadius: "10px",
        background: tool === id ? "#2563eb" : "#e5e7eb",
        color: tool === id ? "#ffffff" : "#111827",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontWeight: "600"
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div
      style={{
        background: darkMode ? "#111827" : "white",
        color: darkMode ? "white" : "#111827",
        borderRadius: "16px",
        padding: "14px",
        marginBottom: "14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}
    >
      <div style={sectionStyle}>
        <span style={{ ...titleStyle, color: darkMode ? "white" : "#374151" }}>Tools</span>
        <div style={rowStyle}>
          {toolButton("pencil", "Pencil", "✏️")}
          {toolButton("eraser", "Eraser", "🩹")}
          {toolButton("text", "Text", "🔤")}
          {toolButton("sticky", "Sticky", "🗒️")}
          {toolButton("line", "Line", "📏")}
          {toolButton("rectangle", "Rectangle", "▭")}
          {toolButton("square", "Square", "⬜")}
          {toolButton("circle", "Circle", "◯")}
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={{ ...titleStyle, color: darkMode ? "white" : "#374151" }}>Style</span>
        <div style={rowStyle}>
          <label style={{ ...labelStyle, color: darkMode ? "white" : "#111827" }}>
            Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={tool === "sticky"}
            />
          </label>

          <label style={{ ...labelStyle, color: darkMode ? "white" : "#111827" }}>
            Size
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              disabled={tool === "text" || tool === "sticky"}
            />
            <span>{brushSize}</span>
          </label>

          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              ...actionButton,
              background: darkMode ? "#facc15" : "#111827",
              color: darkMode ? "#111827" : "white"
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={{ ...titleStyle, color: darkMode ? "white" : "#374151" }}>Export / Save</span>
        <div style={rowStyle}>
          <button onClick={onExportPNG} style={{ ...actionButton, background: "#7c3aed", color: "white" }}>
            Export PNG
          </button>
          <button onClick={onExportPDF} style={{ ...actionButton, background: "#db2777", color: "white" }}>
            Export PDF
          </button>
          <button onClick={onSaveVersion} style={{ ...actionButton, background: "#0891b2", color: "white" }}>
            Save Snapshot
          </button>
        </div>
      </div>

      <div style={sectionStyle}>
        <span style={{ ...titleStyle, color: darkMode ? "white" : "#374151" }}>Actions</span>
        <div style={rowStyle}>
          <button onClick={onUndo} style={{ ...actionButton, background: "#f59e0b", color: "white" }}>
            Undo
          </button>
          <button onClick={onRedo} style={{ ...actionButton, background: "#10b981", color: "white" }}>
            Redo
          </button>
          <button onClick={onClear} style={{ ...actionButton, background: "#111827", color: "white" }}>
            Clear
          </button>
          <button onClick={onLeave} style={{ ...actionButton, background: "#dc2626", color: "white" }}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}

const sectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const rowStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center"
};

const titleStyle = {
  fontWeight: "700"
};

const labelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "600"
};

const actionButton = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700"
};