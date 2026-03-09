import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import Toolbar from "../components/Toolbar";
import socket from "../socket";

function getUserColor(name = "") {
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899"
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function WhiteboardPage({ roomId, userName, onLeave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const startPoint = useRef(null);
  const currentStroke = useRef([]);
  const liveEmitTimeout = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [elements, setElements] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [previewElement, setPreviewElement] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [myCursor, setMyCursor] = useState({ x: 0, y: 0, visible: false });
  const [darkMode, setDarkMode] = useState(false);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    socket.emit("join-room", { roomId, user: userName });

    socket.on("load-board", (savedElements) => {
      setElements(savedElements || []);
      setRedoStack([]);
      setPreviewElement(null);
    });

    socket.on("versions-update", (savedVersions) => {
      setVersions(savedVersions || []);
    });

    socket.on("participants-update", (users) => {
      setParticipants(users || []);
    });

    socket.on("element-added", (element) => {
      setElements((prev) => [...prev, element]);
    });

    socket.on("board-updated", (updatedElements) => {
      setElements(updatedElements || []);
      setPreviewElement(null);
    });

    socket.on("clear-board", () => {
      setElements([]);
      setRedoStack([]);
      setPreviewElement(null);
    });

    socket.on("live-drawing", (segment) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      drawLine(
        ctx,
        segment.x0,
        segment.y0,
        segment.x1,
        segment.y1,
        segment.color,
        segment.brushSize
      );
    });

    socket.on("cursor-move", ({ socketId, userName, x, y }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [socketId]: { userName, x, y }
      }));
    });

    socket.on("cursor-remove", (socketId) => {
      setRemoteCursors((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    return () => {
      socket.off("load-board");
      socket.off("versions-update");
      socket.off("participants-update");
      socket.off("element-added");
      socket.off("board-updated");
      socket.off("clear-board");
      socket.off("live-drawing");
      socket.off("cursor-move");
      socket.off("cursor-remove");
    };
  }, [roomId, userName]);

  useEffect(() => {
    redrawAll(elements, previewElement);
  }, [elements, previewElement, darkMode]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bg = darkMode ? "#f3f4f6" : "#f8fafc";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSoftGrid(ctx, canvas.width, canvas.height);
  };

  const drawSoftGrid = (ctx, width, height) => {
    ctx.save();
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 40) {
      ctx.strokeStyle = "rgba(156,163,175,0.08)";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 40) {
      ctx.strokeStyle = "rgba(156,163,175,0.08)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const drawLine = (ctx, x0, y0, x1, y1, strokeColor, size, dashed = false) => {
    ctx.beginPath();
    ctx.setLineDash(dashed ? [6, 4] : []);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = dashed ? 0 : 0.5;
    ctx.shadowColor = strokeColor;
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  };

  const drawRectangle = (ctx, el, dashed = false) => {
    ctx.beginPath();
    ctx.setLineDash(dashed ? [6, 4] : []);
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.brushSize;
    ctx.strokeRect(el.x, el.y, el.width, el.height);
    ctx.closePath();
    ctx.setLineDash([]);
  };

  const drawCircle = (ctx, el, dashed = false) => {
    ctx.beginPath();
    ctx.setLineDash(dashed ? [6, 4] : []);
    ctx.arc(el.cx, el.cy, el.radius, 0, Math.PI * 2);
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.brushSize;
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);
  };

  const drawText = (ctx, el) => {
    ctx.fillStyle = el.color;
    ctx.font = "24px Arial";
    ctx.fillText(el.text, el.x, el.y);
  };

  const drawSticky = (ctx, el, dashed = false) => {
    const width = 180;
    const height = 120;

    ctx.fillStyle = "#fde68a";
    ctx.fillRect(el.x, el.y, width, height);

    ctx.beginPath();
    ctx.setLineDash(dashed ? [6, 4] : []);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.strokeRect(el.x, el.y, width, height);
    ctx.closePath();
    ctx.setLineDash([]);

    if (el.text) {
      ctx.fillStyle = "#111827";
      ctx.font = "18px Arial";
      const lines = el.text.split("\n");
      lines.forEach((line, index) => {
        ctx.fillText(line, el.x + 10, el.y + 28 + index * 22);
      });
    }
  };

  const drawStroke = (ctx, el, dashed = false) => {
    if (!el.points || el.points.length < 2) return;

    for (let i = 1; i < el.points.length; i++) {
      drawLine(
        ctx,
        el.points[i - 1].x,
        el.points[i - 1].y,
        el.points[i].x,
        el.points[i].y,
        el.color,
        el.brushSize,
        dashed
      );
    }
  };

  const drawElement = (ctx, el, dashed = false) => {
    if (el.type === "pencil" || el.type === "eraser") drawStroke(ctx, el, dashed);
    if (el.type === "line") drawLine(ctx, el.x1, el.y1, el.x2, el.y2, el.color, el.brushSize, dashed);
    if (el.type === "rectangle" || el.type === "square") drawRectangle(ctx, el, dashed);
    if (el.type === "circle") drawCircle(ctx, el, dashed);
    if (el.type === "text") drawText(ctx, el);
    if (el.type === "sticky") drawSticky(ctx, el, dashed);
  };

  const redrawAll = (allElements, preview = null) => {
    clearCanvas();
    const ctx = canvasRef.current.getContext("2d");
    allElements.forEach((el) => drawElement(ctx, el, false));
    if (preview) drawElement(ctx, preview, true);
  };

  const saveElement = (element) => {
    setElements((prev) => [...prev, element]);
    setRedoStack([]);
    setPreviewElement(null);
    socket.emit("save-element", { roomId, element });
  };

  const emitLiveSegment = (segment) => {
    if (liveEmitTimeout.current) return;

    liveEmitTimeout.current = setTimeout(() => {
      socket.emit("live-drawing", segment);
      liveEmitTimeout.current = null;
    }, 12);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    canvasRef.current.setPointerCapture?.(e.pointerId);

    const pos = getPos(e);
    startPoint.current = pos;

    if (tool === "pencil" || tool === "eraser") {
      drawing.current = true;
      currentStroke.current = [pos];
      return;
    }

    if (tool === "text") {
      const text = prompt("Enter text");
      if (!text) return;

      saveElement({
        type: "text",
        x: pos.x,
        y: pos.y,
        text,
        color
      });
      return;
    }

    if (tool === "sticky") {
      drawing.current = true;
      setPreviewElement({
        type: "sticky",
        x: pos.x,
        y: pos.y,
        text: ""
      });
      return;
    }

    drawing.current = true;
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    const pos = getPos(e);

    setMyCursor({ x: pos.x, y: pos.y, visible: true });
    socket.emit("cursor-move", { roomId, userName, x: pos.x, y: pos.y });

    if (!drawing.current) return;

    const start = startPoint.current;

    if (tool === "pencil" || tool === "eraser") {
      const ctx = canvasRef.current.getContext("2d");
      const last = currentStroke.current[currentStroke.current.length - 1];
      const strokeColor = tool === "eraser" ? "#f8fafc" : color;

      drawLine(ctx, last.x, last.y, pos.x, pos.y, strokeColor, brushSize);
      currentStroke.current.push(pos);

      emitLiveSegment({
        roomId,
        x0: last.x,
        y0: last.y,
        x1: pos.x,
        y1: pos.y,
        color: strokeColor,
        brushSize
      });

      return;
    }

    if (tool === "line") {
      setPreviewElement({
        type: "line",
        x1: start.x,
        y1: start.y,
        x2: pos.x,
        y2: pos.y,
        color,
        brushSize
      });
      return;
    }

    if (tool === "rectangle") {
      setPreviewElement({
        type: "rectangle",
        x: start.x,
        y: start.y,
        width: pos.x - start.x,
        height: pos.y - start.y,
        color,
        brushSize
      });
      return;
    }

    if (tool === "square") {
      const side = Math.max(Math.abs(pos.x - start.x), Math.abs(pos.y - start.y));
      setPreviewElement({
        type: "square",
        x: pos.x >= start.x ? start.x : start.x - side,
        y: pos.y >= start.y ? start.y : start.y - side,
        width: side,
        height: side,
        color,
        brushSize
      });
      return;
    }

    if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2)
      );
      setPreviewElement({
        type: "circle",
        cx: start.x,
        cy: start.y,
        radius,
        color,
        brushSize
      });
      return;
    }

    if (tool === "sticky") {
      setPreviewElement({
        type: "sticky",
        x: pos.x,
        y: pos.y,
        text: ""
      });
    }
  };

  const handlePointerUp = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;

    const end = getPos(e);
    const start = startPoint.current;

    if (tool === "pencil" || tool === "eraser") {
      if (currentStroke.current.length < 2) return;

      saveElement({
        type: tool,
        points: currentStroke.current,
        color: tool === "eraser" ? "#f8fafc" : color,
        brushSize
      });
      currentStroke.current = [];
      return;
    }

    if (tool === "line") {
      saveElement({
        type: "line",
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        color,
        brushSize
      });
      return;
    }

    if (tool === "rectangle") {
      saveElement({
        type: "rectangle",
        x: start.x,
        y: start.y,
        width: end.x - start.x,
        height: end.y - start.y,
        color,
        brushSize
      });
      return;
    }

    if (tool === "square") {
      const side = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
      saveElement({
        type: "square",
        x: end.x >= start.x ? start.x : start.x - side,
        y: end.y >= start.y ? start.y : start.y - side,
        width: side,
        height: side,
        color,
        brushSize
      });
      return;
    }

    if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      saveElement({
        type: "circle",
        cx: start.x,
        cy: start.y,
        radius,
        color,
        brushSize
      });
      return;
    }

    if (tool === "sticky") {
      const stickyX = previewElement?.x ?? start.x;
      const stickyY = previewElement?.y ?? start.y;
      const text = prompt("Enter sticky note");
      if (!text) {
        setPreviewElement(null);
        return;
      }

      saveElement({
        type: "sticky",
        x: stickyX,
        y: stickyY,
        text
      });
    }
  };

  const handleUndo = () => {
    if (elements.length === 0) return;
    const updated = [...elements];
    const removed = updated.pop();
    setRedoStack((prev) => [...prev, removed]);
    setElements(updated);
    setPreviewElement(null);
    socket.emit("update-board", { roomId, elements: updated });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const updatedRedo = [...redoStack];
    const restored = updatedRedo.pop();
    const updatedElements = [...elements, restored];
    setRedoStack(updatedRedo);
    setElements(updatedElements);
    setPreviewElement(null);
    socket.emit("update-board", { roomId, elements: updatedElements });
  };

  const handleClear = () => {
    setElements([]);
    setRedoStack([]);
    setPreviewElement(null);
    socket.emit("clear-board", { roomId });
  };

  const handleLeave = () => {
    localStorage.removeItem("roomId");
    onLeave();
  };

  const handleExportPNG = () => {
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${roomId}.png`;
    link.href = url;
    link.click();
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF("landscape", "mm", "a4");
    const imgData = canvasRef.current.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 10, 10, 277, 180);
    pdf.save(`${roomId}.pdf`);
  };

  const handleSaveVersion = () => {
    socket.emit("save-version", { roomId, elements });
    alert("Snapshot saved");
  };

  const handleRestoreVersion = (index) => {
    socket.emit("restore-version", { roomId, versionIndex: index });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "18px",
        fontFamily: "Arial, sans-serif",
        color: "#3f3f46",
        backgroundColor: "#f4f4f8",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='%23b8b8c7' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' opacity='0.8'%3E%3Cpath d='M20 30l30-10 20 20-20 20z'/%3E%3Cpath d='M95 20l18 40 24-30'/%3E%3Cpath d='M150 18c18 8 24 30 10 42-14 12-32 6-38-8-6-14 4-30 28-34z'/%3E%3Cpath d='M22 98c30-18 46 16 20 24-26 8-26 30-4 34'/%3E%3Cpath d='M80 88l0 48'/%3E%3Cpath d='M65 112h30'/%3E%3Cpath d='M118 90l34 34'/%3E%3Cpath d='M152 90l-34 34'/%3E%3Cpath d='M180 84c12 10 14 24 4 34-10 10-26 8-34-2-8-10-4-24 8-32 8-6 14-6 22 0z'/%3E%3Cpath d='M12 162l20 22 34-10-10-28z'/%3E%3Cpath d='M82 154l10 38 18-30 18 24'/%3E%3Cpath d='M150 154c18-6 34 4 36 20 2 16-10 28-30 28-20 0-34-12-32-26 2-14 10-18 26-22z'/%3E%3Cpath d='M180 150l0 42'/%3E%3Cpath d='M168 170h24'/%3E%3C/g%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        backgroundSize: "220px 220px"
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "12px",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "14px",
            alignItems: "start"
          }}
        >
          <div
            style={glassCard}
          >
            <h2 style={{ margin: 0, color: "#4b5563" }}>Room: {roomId}</h2>

            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "600",
                color: "#6b7280"
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: getUserColor(userName),
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700"
                }}
              >
                {userName?.charAt(0)?.toUpperCase()}
              </div>
              <span>User: {userName}</span>
            </div>
          </div>

          <div style={{ ...glassCard, minWidth: "220px" }}>
            <div style={{ fontWeight: "700", marginBottom: "8px", color: "#4b5563" }}>
              Participants
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {participants.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.45)",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: getUserColor(name)
                    }}
                  />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...glassCard, minWidth: "260px" }}>
            <div style={{ fontWeight: "700", marginBottom: "8px", color: "#4b5563" }}>
              Snapshots
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "220px",
                overflowY: "auto"
              }}
            >
              {versions.length === 0 && (
                <div style={{ color: "#6b7280" }}>No snapshots yet</div>
              )}
              {versions.map((version, index) => (
                <button
                  key={index}
                  onClick={() => handleRestoreVersion(index)}
                  style={{
                    textAlign: "left",
                    padding: "10px",
                    border: "none",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.45)",
                    color: "#374151",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Restore #{index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={glassCard}>
          <Toolbar
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onLeave={handleLeave}
            onExportPNG={handleExportPNG}
            onExportPDF={handleExportPDF}
            onSaveVersion={handleSaveVersion}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "14px" }}>
          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              width={1200}
              height={650}
              style={{
                border: "2px solid rgba(107,114,128,0.18)",
                borderRadius: "22px",
                background: "#f8fafc",
                cursor: "crosshair",
                boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
                touchAction: "none"
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => {
                drawing.current = false;
                setMyCursor((prev) => ({ ...prev, visible: false }));
              }}
            />

            {myCursor.visible && (
              <div
                style={{
                  position: "absolute",
                  left: myCursor.x - brushSize / 2,
                  top: myCursor.y - brushSize / 2,
                  width: brushSize,
                  height: brushSize,
                  borderRadius: "50%",
                  border: `2px solid ${tool === "eraser" ? "#111827" : color}`,
                  background: tool === "eraser" ? "rgba(17,24,39,0.12)" : `${color}33`,
                  pointerEvents: "none"
                }}
              />
            )}

            {Object.entries(remoteCursors).map(([id, cursor]) => (
              <div
                key={id}
                style={{
                  position: "absolute",
                  left: cursor.x,
                  top: cursor.y,
                  pointerEvents: "none",
                  transform: "translate(8px, 8px)"
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: getUserColor(cursor.userName),
                    marginBottom: "4px"
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    background: getUserColor(cursor.userName),
                    color: "white",
                    padding: "3px 7px",
                    borderRadius: "8px",
                    whiteSpace: "nowrap"
                  }}
                >
                  {cursor.userName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const glassCard = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.72), rgba(240,240,240,0.58))",
  padding: "14px",
  borderRadius: "18px",
  border: "1px solid rgba(255,255,255,0.45)",
  boxShadow: "0 20px 40px rgba(0,0,0,0.10)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)"
};