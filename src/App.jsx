import React, { useState, useRef, Fragment, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./index.css";

const PALETTE = ["#E8663D","#3B82F6","#10B981","#F59E0B","#8B5CF6","#EF4444","#06B6D4","#84CC16","#EC4899","#14B8A6"];

function getColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function Avatar({ name, size = 36 }) {
  const safeName = name || "?";
  const bg = getColor(safeName);

  const initials = safeName
    .split(" ")
    .map(w => w[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: "'Mitr', sans-serif",
        letterSpacing: 1,
      }}
    >
      {initials}
    </div>
  );
}

function WinDots({ wins }) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
      {[0, 1].map(i => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: "50%",
          background: i < wins ? "#E8663D" : "rgba(255,255,255,0.18)",
          border: `1.5px solid ${i < wins ? "#E8663D" : "rgba(255,255,255,0.3)"}`,
        }} />
      ))}
    </div>
  );
}

function InlineEdit({ value, onSave, onCancel }) {
  const [val, setVal] = useState(value);
  return (
    <div style={{ display: "flex", gap: 5, flex: 1, minWidth: 0 }}>
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) onSave(val.trim()); if (e.key === "Escape") onCancel(); }}
        style={{
          flex: 1, minWidth: 0, boxSizing: "border-box", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(232,102,61,0.7)",
          borderRadius: 6, padding: "4px 8px", color: "#fff", fontSize: 13,
          outline: "none", fontFamily: "inherit",
        }}
      />
      <button onClick={() => val.trim() && onSave(val.trim())} style={{ background: "#E8663D", border: "none", borderRadius: 6, color: "#fff", padding: "4px 8px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✓</button>
      <button onClick={onCancel} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "rgba(255,255,255,0.45)", padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
    </div>
  );
}

function IconBtn({ onClick, children, danger }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", cursor: "pointer", padding: "3px 5px",
      color: danger ? "rgba(255,90,90,0.6)" : "rgba(255,255,255,0.35)",
      fontSize: 13, lineHeight: 1, borderRadius: 4,
    }}>{children}</button>
  );
}

function SetupScreen({ onStart }) {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [winsA, setWinsA] = useState(0);
  const [winsB, setWinsB] = useState(0);
  const [restTeam, setRestTeam] = useState("");
  const [queueList, setQueueList] = useState([]);
  const [newQ, setNewQ] = useState("");

  const addQueue = () => { if (newQ.trim()) { setQueueList(p => [...p, newQ.trim()]); setNewQ(""); } };
  const canStart = teamA.trim() && teamB.trim();

  const inp = {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 15,
    width: "100%", outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", minWidth: 0,
  };
  const lbl = { fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 6, display: "block", letterSpacing: 1, textTransform: "uppercase" };

  return (
    <div style={{ minHeight: "100vh", background: "#000000", padding: "24px 16px", fontFamily: "'Kanit', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Lexend:wght@100..900&family=Mitr:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏀</div>
          <h1 style={{ color: "#E8663D", fontFamily: "'Mitr', sans-serif", fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: 2 }}>BASKETBALL QUEUE</h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>ตั้งค่าสถานะเริ่มต้น</p>
        </div>

        <div style={{ background: "rgba(232,102,61,0.1)", border: "1px solid rgba(232,102,61,0.3)", borderRadius: 14, padding: 16, marginBottom: 10 }}>
          <p style={{ ...lbl, color: "#E8663D", marginBottom: 14, fontSize: 12 }}>⚡ ทีมที่กำลังแข่งอยู่</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><span style={lbl}>ทีม A</span><input style={inp} value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="ชื่อทีม..." /></div>
            <div><span style={lbl}>ทีม B</span><input style={inp} value={teamB} onChange={e => setTeamB(e.target.value)} placeholder="ชื่อทีม..." /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            {[["ทีม A ชนะมาแล้ว", winsA, setWinsA], ["ทีม B ชนะมาแล้ว", winsB, setWinsB]].map(([label, val, set]) => (
              <div key={label}>
                <span style={lbl}>{label}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[0, 1].map(v => (
                    <button key={v} onClick={() => set(v)} style={{
                      flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid",
                      borderColor: val === v ? "#E8663D" : "rgba(255,255,255,0.15)",
                      background: val === v ? "#E8663D" : "transparent",
                      color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                    }}>{v} ตา</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, marginBottom: 10 }}>
          <span style={lbl}>😮‍💨 ทีมที่พักอยู่แล้ว (ถ้ามี)</span>
          <input style={inp} value={restTeam} onChange={e => setRestTeam(e.target.value)} placeholder="ชื่อทีมที่กำลังพักอยู่..." />
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <span style={lbl}>📋 คิวรอเล่น</span>
          {queueList.map((q, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, width: 16 }}>{i + 1}.</span>
              <Avatar name={q} size={24} />
              <span style={{ flex: 1, color: "#fff", fontSize: 14 }}>{q}</span>
              <button onClick={() => setQueueList(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "rgba(255,100,100,0.7)", cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <input style={{ ...inp, flex: 1 }} value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === "Enter" && addQueue()} placeholder="เพิ่มทีม..." />
            <button onClick={addQueue} style={{ background: "#E8663D", border: "none", borderRadius: 10, color: "#fff", padding: "0 16px", cursor: "pointer", fontSize: 22 }}>+</button>
          </div>
        </div>

        <button
          onClick={() => canStart && onStart({ teamA: { name: teamA.trim(), wins: winsA }, teamB: { name: teamB.trim(), wins: winsB }, restTeam: restTeam.trim() || null, queue: queueList })}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: canStart ? "#E8663D" : "rgba(255,255,255,0.1)",
            color: canStart ? "#fff" : "rgba(255,255,255,0.3)",
            fontSize: 16, fontWeight: 700, cursor: canStart ? "pointer" : "not-allowed",
            fontFamily: "'Mitr', sans-serif", letterSpacing: 2, textTransform: "uppercase",
          }}>เริ่มรันคิว →</button>
      </div>
    </div>
  );
}

function QueueScreen({ initial, onReset }) {
  const [teamA, setTeamA] = useState(initial.teamA);
  const [teamB, setTeamB] = useState(initial.teamB);
  const [rest, setRest] = useState(initial.rest);
  const [queue, setQueue] = useState(initial.queue);
  const [newTeam, setNewTeam] = useState("");
  const [editing, setEditing] = useState(null);
  const [log, setLog] = useState(initial.log || []);
  const [showLog, setShowLog] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // ✅ ระบบ Undo
  const [history, setHistory] = useState(initial.history || []);

  const dragItemIndex = useRef(null);
  const dragOverItemIndex = useRef(null);
  const [touchDragIdx, setTouchDragIdx] = useState(null);
  const queueListRef = useRef(null);

  const handleDragEnd = () => {
    if (dragItemIndex.current !== null && dragOverItemIndex.current !== null && dragItemIndex.current !== dragOverItemIndex.current) {
      saveSnapshot();
      const newQueue = [...queue];
      const draggedItem = newQueue[dragItemIndex.current];
      newQueue.splice(dragItemIndex.current, 1);
      newQueue.splice(dragOverItemIndex.current, 0, draggedItem);
      setQueue(newQueue);
      pushLog(`🔄 เปลี่ยนลำดับคิว: ${draggedItem.name}`);
    }
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  // ✅ Touch drag handlers for mobile
  const handleTouchStart = (i, e) => {
    dragItemIndex.current = i;
    setTouchDragIdx(i);
  };

  const handleTouchMove = (e) => {
    if (dragItemIndex.current === null) return;
    const touch = e.touches[0];
    const listEl = queueListRef.current;
    if (!listEl) return;
    const items = listEl.querySelectorAll('[data-queue-item]');
    for (let j = 0; j < items.length; j++) {
      const rect = items[j].getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        dragOverItemIndex.current = j;
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
    setTouchDragIdx(null);
  };

  const saveSnapshot = () => {
    setHistory(prev => [
      ...prev.slice(-19),
      { teamA, teamB, rest, queue, log }
    ]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTeamA(prev.teamA);
    setTeamB(prev.teamB);
    setRest(prev.rest);
    setQueue(prev.queue);
    setLog(prev.log);
    // ✅ sync ref กลับด้วย
    winsRef.current = { A: prev.teamA.wins, B: prev.teamB.wins };
    setHistory(h => h.slice(0, -1));
  };

  const pushLog = (msg) => setLog(prev => [
    { msg, time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) },
    ...prev.slice(0, 29)
  ]);

  // ✅ saveEdit เดียว (ลบตัวซ้ำออก) + saveSnapshot
  const saveEdit = (newName) => {
    if (!newName) return;
    saveSnapshot();
    if (editing === "A") { pushLog(`✏️ ${teamA.name} → ${newName}`); setTeamA(p => ({ ...p, name: newName })); }
    else if (editing === "B") { pushLog(`✏️ ${teamB.name} → ${newName}`); setTeamB(p => ({ ...p, name: newName })); }
    else if (editing === "rest" && rest) { pushLog(`✏️ ${rest.name} → ${newName}`); setRest(p => ({ ...p, name: newName })); }
    else if (typeof editing === "number") {
      pushLog(`✏️ ${queue[editing].name} → ${newName}`);
      setQueue(prev => prev.map((t, i) => i === editing ? { ...t, name: newName } : t));
    }
    setEditing(null);
  };

  const winsRef = useRef({ A: initial.teamA.wins || 0, B: initial.teamB.wins || 0 });

  // ✅ Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      phase: "queue",
      queueData: { teamA, teamB, rest, queue, log, history }
    };
    localStorage.setItem("basketball_queue_v1", JSON.stringify(stateToSave));
  }, [teamA, teamB, rest, queue, log, history]);

  const handleWin = (winner) => {
    saveSnapshot();

    // ✅ อ่านจาก ref แทน state — ได้ค่าล่าสุดเสมอ
    const newWins = winsRef.current[winner] + 1;
    winsRef.current[winner] = newWins;

    const currentWinTeam = winner === "A" ? teamA : teamB;
    const currentLoseTeam = winner === "A" ? teamB : teamA;
    const updatedWinner = { ...currentWinTeam, wins: newWins };

    pushLog(`🏆 ${updatedWinner.name} ชนะ ${currentLoseTeam.name}`);
    const q = [...queue, { name: currentLoseTeam.name, wins: 0 }];

    if (newWins >= 2) {
      // reset wins ของทีมใหม่ที่จะลงมาแข่ง
      winsRef.current = { A: 0, B: 0 };
      pushLog(`😮‍💨 ${updatedWinner.name} ชนะ 2 ตาติด → ออกพัก 1 ตา`);

      let courtA, courtB;
      if (rest) {
        pushLog(`✅ ${rest.name} พักครบแล้ว → กลับมาเล่น`);
        courtA = { name: rest.name, wins: 0 };
        courtB = q.shift() ?? { name: "รอทีม...", wins: 0 };
      } else {
        courtA = q.shift() ?? { name: "รอทีม...", wins: 0 };
        courtB = q.shift() ?? { name: "รอทีม...", wins: 0 };
      }

      setTeamA(courtA);
      setTeamB(courtB);
      setRest({ name: updatedWinner.name, wins: 0 });
      setQueue(q);

    } else {
      pushLog(`✊ ${updatedWinner.name} ชนะ ${newWins} ตา → เล่นต่อ`);

      // ✅ reset wins ของฝั่งที่แพ้
      winsRef.current[winner === "A" ? "B" : "A"] = 0;

      let next;
      if (rest) {
        pushLog(`🔄 ${rest.name} กลับมาแข่ง`);
        next = { ...rest, wins: 0 };
        setRest(null);
      } else {
        next = q.shift() ?? { name: "รอทีม...", wins: 0 };
      }

      if (winner === "A") {
        setTeamA({ ...updatedWinner });
        setTeamB(next);
      } else {
        setTeamB({ ...updatedWinner });
        setTeamA(next);
      }

      setQueue(q);
    }

    setEditing(null);
  };

  const addToQueue = () => {
    if (!newTeam.trim()) return;
    saveSnapshot(); // ✅
    const n = newTeam.trim();
    setQueue(prev => [...prev, { name: n, wins: 0 }]);
    pushLog(`➕ เพิ่ม ${n} เข้าคิว`);
    setNewTeam("");
  };

  const removeRest = () => {
    saveSnapshot(); // ✅
    pushLog(`🚪 ${rest.name} เลิกเล่น → ออกจาก Rest`);
    setRest(null);
    setEditing(null);
  };

  const card = { background: "rgba(255,255,255,0.05)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.09)", padding: 14 };
  const secLabel = (txt, clr = "rgba(255,255,255,0.4)") => (
    <p style={{ fontSize: 11, fontWeight: 600, color: clr, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>{txt}</p>
  );

  return (
    <div style={{ height: "100vh", background: "#000000", padding: "16px", fontFamily: "'Kanit', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Lexend:wght@100..900&family=Mitr:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 400, margin: "0 auto" }}>

        {/* ✅ Header พร้อมปุ่ม Undo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h1 style={{ color: "#E8663D", fontFamily: "'Mitr', sans-serif", fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 1.5 }}>BASKETBALL QUEUE</h1>
          <div style={{ display: "flex", gap: 6 }}>
            {/* ✅ ปุ่ม Share */}
            <button onClick={() => {
              const exportData = { teamA, teamB, rest, queue };
              const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(exportData))));
              const url = `${window.location.origin}${window.location.pathname}?shareData=${b64}`;
              setShareUrl(url);
              setShowShare(true);
            }} style={{ background: "rgba(232,102,61,0.2)", border: "1px solid rgba(232,102,61,0.5)", borderRadius: 8, color: "#E8663D", padding: "5px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600 }}>
              📤 โอนคิว
            </button>
            {/* ✅ ปุ่ม Undo */}
            <button
              onClick={undo}
              disabled={history.length === 0}
              style={{
                background: history.length === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,200,0,0.12)",
                border: `1px solid ${history.length === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,200,0,0.35)"}`,
                borderRadius: 8,
                color: history.length === 0 ? "rgba(255,255,255,0.2)" : "#ffd700",
                padding: "5px 10px",
                cursor: history.length === 0 ? "not-allowed" : "pointer",
                fontSize: 12,
                fontFamily: "inherit",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              ↩ undo
            </button>
            <button onClick={() => setShowLog(s => !s)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.55)", padding: "5px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
              📋 {showLog ? "ซ่อน" : "log"}
            </button>
            <button onClick={onReset} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.55)", padding: "5px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>↩ reset</button>
          </div>
        </div>

        {showLog && (
          <div style={{ ...card, marginBottom: 10, maxHeight: 150, overflowY: "auto" }}>
            {log.length === 0
              ? <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, margin: 0 }}>ยังไม่มีประวัติ</p>
              : log.map((l, i) => (
                <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", marginRight: 6, fontSize: 11 }}>{l.time}</span>{l.msg}
                </div>
              ))}
          </div>
        )}

        <div style={{ background: "rgba(232,102,61,0.11)", borderRadius: 14, border: "1px solid rgba(232,102,61,0.3)", padding: 14, marginBottom: 10 }}>
          {secLabel("⚡ กำลังแข่ง", "#E8663D")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
            {['A', 'B'].map((side, idx) => {
              const team = side === 'A' ? teamA : teamB;
              const isEditing = editing === side;
              return (
                <Fragment key={side}>
                  {idx === 1 && <span key="vs" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700, fontSize: 14, textAlign: "center", fontFamily: "'Mitr', sans-serif" }}>VS</span>}
                  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                    <Avatar name={team.name} size={38} />
                    {isEditing ? (
                      <div style={{ marginTop: 8 }}>
                        <InlineEdit value={team.name} onSave={saveEdit} onCancel={() => setEditing(null)} />
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, margin: "8px 0 6px" }}>
                        <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0, fontFamily: "'Mitr', sans-serif", lineHeight: 1.2 }}>{team.name}</p>
                        <IconBtn onClick={() => setEditing(side)}>✎</IconBtn>
                      </div>
                    )}
                    <WinDots wins={team.wins} />
                    <button onClick={() => handleWin(side)} style={{
                      marginTop: 10, width: "100%", padding: "7px 0", borderRadius: 8,
                      background: "#E8663D", border: "none", color: "#fff",
                      fontWeight: 700, cursor: "pointer", fontSize: 12,
                      fontFamily: "'Mitr', sans-serif", letterSpacing: 1,
                    }}>ชนะ 🏆</button>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ ...card, marginBottom: 10 }}>
          {secLabel("😮‍💨 พักอยู่")}
          {rest ? (
            editing === "rest" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={rest.name} size={34} />
                <InlineEdit value={rest.name} onSave={saveEdit} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={rest.name} size={34} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0, fontFamily: "'Mitr', sans-serif" }}>{rest.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "2px 0 0" }}>รอ 1 ตา แล้วกลับมาเล่น</p>
                </div>
                <IconBtn onClick={() => setEditing("rest")}>✎</IconBtn>
                <button
                  onClick={removeRest}
                  title="เลิกเล่น / นำออก"
                  style={{
                    background: "rgba(255,60,60,0.12)", border: "1px solid rgba(255,60,60,0.3)",
                    borderRadius: 7, color: "rgba(255,100,100,0.8)", padding: "4px 9px",
                    cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                  }}>เลิกเล่น</button>
              </div>
            )
          ) : (
            <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 13, textAlign: "center", margin: 0, padding: "4px 0" }}>— ไม่มีทีมพัก —</p>
          )}
        </div>

        <div style={card}>
          {secLabel("📋 คิวรอ")}
          {queue.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.22)", fontSize: 13, textAlign: "center", margin: "0 0 10px", padding: "4px 0" }}>— คิวว่าง —</p>
          )}
          <div ref={queueListRef} onTouchMove={handleTouchMove}>
          {queue.map((t, i) => (
            <div key={i}
              data-queue-item
              draggable
              onDragStart={(e) => { dragItemIndex.current = i; }}
              onDragEnter={(e) => { dragOverItemIndex.current = i; }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 10, marginBottom: 6,
              background: touchDragIdx === i ? "rgba(232,102,61,0.25)" : i === 0 ? "rgba(232,102,61,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${touchDragIdx === i ? "#E8663D" : i === 0 ? "rgba(232,102,61,0.25)" : "rgba(255,255,255,0.07)"}`,
              transition: "background 0.15s, border-color 0.15s",
            }}>
              {/* ≡ Drag handle for touch */}
              <span
                onTouchStart={(e) => handleTouchStart(i, e)}
                onTouchEnd={handleTouchEnd}
                style={{ color: "rgba(255,255,255,0.3)", fontSize: 18, cursor: "grab", padding: "0 2px", touchAction: "none", userSelect: "none", lineHeight: 1 }}
              >≡</span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, width: 16, textAlign: "center" }}>{i + 1}</span>
              <Avatar name={t.name} size={28} />
              {editing === i ? (
                <InlineEdit value={t.name} onSave={saveEdit} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <span style={{ flex: 1, color: "#fff", fontSize: 14, fontFamily: "'Mitr', sans-serif", fontWeight: 600 }}>{t.name}</span>
                  {i === 0 && <span style={{ color: "#E8663D", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>NEXT</span>}
                  <IconBtn onClick={() => setEditing(i)}>✎</IconBtn>
                  <IconBtn danger onClick={() => { saveSnapshot(); setQueue(prev => prev.filter((_, j) => j !== i)); pushLog(`🗑️ ลบ ${t.name} ออกจากคิว`); }}>×</IconBtn>
                </>
              )}
            </div>
          ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input value={newTeam} onChange={e => setNewTeam(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addToQueue()}
              placeholder="เพิ่มทีมในคิว..."
              style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            <button onClick={addToQueue} style={{ background: "#E8663D", border: "none", borderRadius: 8, color: "#fff", padding: "0 16px", cursor: "pointer", fontSize: 22 }}>+</button>
          </div>
        </div>

        {/* Share Modal */}
        {showShare && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
            <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 16, padding: 24, textAlign: "center", maxWidth: 320, width: "100%" }}>
              <h2 style={{ color: "#E8663D", fontSize: 18, margin: "0 0 16px", fontFamily: "'Mitr', sans-serif" }}>📤 สแกนเพื่อรับคิว</h2>
              <div style={{ background: "#fff", padding: 16, borderRadius: 12, display: "inline-block", marginBottom: 16 }}>
                <QRCodeSVG value={shareUrl} size={200} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 16 }}>
                ให้เพื่อนสแกน QR Code นี้เพื่อเปิดเว็บและโหลดข้อมูลคิวไปทำต่อในเครื่องตัวเอง
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert("คัดลอกลิงก์เรียบร้อยแล้ว!");
                }} style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, color: "#fff", padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  📋 ก๊อปปี้ลิงก์
                </button>
                <button onClick={() => setShowShare(false)} style={{ flex: 1, background: "#E8663D", border: "none", borderRadius: 8, color: "#fff", padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const LS_KEY = "basketball_queue_v1";

export default function App() {
  const [phase, setPhase] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('shareData')) {
      return "queue";
    }
    try { const saved = localStorage.getItem(LS_KEY); if (saved) return JSON.parse(saved).phase; } catch(e) {}
    return "setup";
  });

  const [config, setConfig] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('shareData');
    if (shareData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(shareData))));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Ensure log and history exist
        decoded.log = [];
        decoded.history = [];
        return decoded;
      } catch(e) {
        console.error("Invalid share data", e);
      }
    }
    try { const saved = localStorage.getItem(LS_KEY); if (saved) return JSON.parse(saved).queueData; } catch(e) {}
    return null;
  });

  if (phase === "setup") {
    return <SetupScreen onStart={cfg => { 
      const initialData = {
        teamA: cfg.teamA,
        teamB: cfg.teamB,
        rest: cfg.restTeam ? { name: cfg.restTeam } : null,
        queue: cfg.queue.map(n => ({ name: n, wins: 0 })),
        log: [],
        history: []
      };
      localStorage.setItem(LS_KEY, JSON.stringify({ phase: "queue", queueData: initialData }));
      setConfig(initialData); 
      setPhase("queue"); 
    }} />;
  }

  return <QueueScreen initial={config} onReset={() => { 
    localStorage.removeItem(LS_KEY);
    setConfig(null); 
    setPhase("setup"); 
  }} />;
}