import React, { useState, useRef, Fragment, useEffect, useLayoutEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./index.css";
import shareIconLight from "./assets/share-light.svg";
import shareIconDark from "./assets/share-dark.svg";
import undoIconLight from "./assets/undo-light.svg";
import undoIconDark from "./assets/undo-dark.svg";
import historyIconLight from "./assets/history-light.svg";
import historyIconDark from "./assets/history-dark.svg";
import resetIconLight from "./assets/reset-light.svg";
import resetIconDark from "./assets/reset-dark.svg";

const TOOLBAR_ICONS = {
  share: { light: shareIconLight, dark: shareIconDark },
  undo: { light: undoIconLight, dark: undoIconDark },
  history: { light: historyIconLight, dark: historyIconDark },
  reset: { light: resetIconLight, dark: resetIconDark },
};

const TEAM_COLOR_TOKENS = Array.from(
  { length: 10 },
  (_, index) => `var(--color-team-${index + 1})`,
);

function getColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return TEAM_COLOR_TOKENS[Math.abs(h) % TEAM_COLOR_TOKENS.length];
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
      className="avatar"
      style={{ "--avatar-size": `${size}px`, "--avatar-color": bg }}
      role="img"
      aria-label={`ทีม ${safeName}`}
    >
      {initials}
    </div>
  );
}

function GripIcon() {
  return (
    <svg className="grip-icon" viewBox="0 0 16 20" aria-hidden="true">
      <circle cx="5" cy="4" r="1.25" />
      <circle cx="11" cy="4" r="1.25" />
      <circle cx="5" cy="10" r="1.25" />
      <circle cx="11" cy="10" r="1.25" />
      <circle cx="5" cy="16" r="1.25" />
      <circle cx="11" cy="16" r="1.25" />
    </svg>
  );
}

function ThemeIcon({ mode }) {
  if (mode === "light") {
    return (
      <svg className="theme-icon theme-icon--light" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
      </svg>
    );
  }

  return (
    <svg className="theme-icon theme-icon--dark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2Z" />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  const nextLabel = nextTheme === "dark" ? "กลางคืน" : "กลางวัน";

  return (
    <button
      type="button"
      className="button theme-toggle"
      onClick={onToggle}
      data-theme={theme}
      aria-pressed={theme === "dark"}
      aria-label={`เปลี่ยนเป็นโหมด${nextLabel}`}
      title={`เปลี่ยนเป็นโหมด${nextLabel}`}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          <ThemeIcon mode="light" />
          <ThemeIcon mode="dark" />
        </span>
      </span>
    </button>
  );
}

function ToolbarAction({ icon, theme, children, ...props }) {
  return (
    <button type="button" className="button button--toolbar" {...props}>
      <img className="toolbar-icon" src={TOOLBAR_ICONS[icon][theme]} alt="" />
      <span>{children}</span>
    </button>
  );
}

function WinDots({ wins }) {
  return (
    <div className="win-dots" aria-label={`ชนะต่อเนื่อง ${wins} ตา`}>
      {[0, 1].map(i => (
        <span key={i} className="win-dot" data-won={i < wins} aria-hidden="true" />
      ))}
    </div>
  );
}

function InlineEdit({ value, onSave, onCancel }) {
  const [val, setVal] = useState(value);
  return (
    <div className="inline-edit">
      <input
        autoFocus
        aria-label={`แก้ชื่อ ${value}`}
        className="text-input text-input--compact"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) onSave(val.trim()); if (e.key === "Escape") onCancel(); }}
      />
      <button className="button button--primary button--compact" onClick={() => val.trim() && onSave(val.trim())}>บันทึก</button>
      <button className="button button--quiet button--compact" onClick={onCancel}>ยกเลิก</button>
    </div>
  );
}

function TextButton({ onClick, children, danger = false, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`text-button${danger ? " text-button--danger" : ""}`}
    >
      {children}
    </button>
  );
}

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true" />;
}

function SectionTitle({ children, note }) {
  return (
    <header className="section-title">
      <h2>{children}</h2>
      {note ? <p>{note}</p> : null}
    </header>
  );
}

function SetupScreen({ onStart, theme, onToggleTheme }) {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [winsA, setWinsA] = useState(0);
  const [winsB, setWinsB] = useState(0);
  const [restTeam, setRestTeam] = useState("");
  const [queueList, setQueueList] = useState([]);
  const [newQ, setNewQ] = useState("");

  const addQueue = () => { if (newQ.trim()) { setQueueList(p => [...p, newQ.trim()]); setNewQ(""); } };
  const canStart = teamA.trim() && teamB.trim();

  return (
    <div className="app-shell app-shell--setup">
      <main className="setup-layout">
        <header className="setup-header">
          <div className="brand-block">
            <BrandMark />
            <div>
              <p className="brand-kicker">COURTSIDE TOOL</p>
              <h1>BASKETBALL QUEUE</h1>
              <p>ตั้งค่าสองทีมแรก แล้วเริ่มจัดลำดับการเล่น</p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </header>

        <section className="panel panel--court-setup" aria-labelledby="setup-court-title">
          <SectionTitle note="ระบุทีมบนคอร์ทและจำนวนชัยชนะต่อเนื่อง">
            <span id="setup-court-title">ทีมที่กำลังแข่ง</span>
          </SectionTitle>

          <div className="field-grid">
            <label className="field-label" htmlFor="team-a">
              ทีม A
              <input id="team-a" className="text-input" value={teamA} onChange={e => setTeamA(e.target.value)} placeholder="เช่น Red Fox" />
            </label>
            <label className="field-label" htmlFor="team-b">
              ทีม B
              <input id="team-b" className="text-input" value={teamB} onChange={e => setTeamB(e.target.value)} placeholder="เช่น Blue Jay" />
            </label>
          </div>

          <div className="score-grid">
            {[["ทีม A ชนะมาแล้ว", winsA, setWinsA], ["ทีม B ชนะมาแล้ว", winsB, setWinsB]].map(([label, val, set]) => (
              <fieldset className="score-fieldset" key={label}>
                <legend>{label}</legend>
                <div className="score-selector">
                  {[0, 1].map(v => (
                    <button
                      type="button"
                      key={v}
                      aria-pressed={val === v}
                      onClick={() => set(v)}
                      className="button button--score"
                    >
                      {v} ตา
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section className="setup-secondary" aria-labelledby="setup-rest-title">
          <SectionTitle note="เว้นว่างได้ หากยังไม่มีทีมพัก">
            <span id="setup-rest-title">ทีมที่พักอยู่แล้ว</span>
          </SectionTitle>
          <label className="field-label field-label--sr" htmlFor="rest-team">ชื่อทีมที่พัก</label>
          <input id="rest-team" className="text-input" value={restTeam} onChange={e => setRestTeam(e.target.value)} placeholder="ชื่อทีมที่กำลังพัก" />
        </section>

        <section className="panel panel--queue-setup" aria-labelledby="setup-queue-title">
          <SectionTitle note="ทีมแรกในรายการจะได้ลงสนามก่อน">
            <span id="setup-queue-title">คิวรอเล่น</span>
          </SectionTitle>

          {queueList.length > 0 ? (
            <ol className="setup-queue-list">
              {queueList.map((q, i) => (
                <li key={`${q}-${i}`}>
                  <Avatar name={q} size={28} />
                  <span>{q}</span>
                  <TextButton danger label={`นำ ${q} ออกจากคิว`} onClick={() => setQueueList(p => p.filter((_, j) => j !== i))}>นำออก</TextButton>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-copy">ยังไม่มีทีมรอ — เพิ่มทีมได้ด้านล่าง</p>
          )}

          <div className="inline-form">
            <label className="field-label field-label--sr" htmlFor="new-setup-team">เพิ่มทีมในคิว</label>
            <input id="new-setup-team" className="text-input" value={newQ} onChange={e => setNewQ(e.target.value)} onKeyDown={e => e.key === "Enter" && addQueue()} placeholder="ชื่อทีมใหม่" />
            <button type="button" className="button button--secondary" onClick={addQueue} disabled={!newQ.trim()}>เพิ่มทีม</button>
          </div>
        </section>

        <button
          type="button"
          disabled={!canStart}
          onClick={() => canStart && onStart({ teamA: { name: teamA.trim(), wins: winsA }, teamB: { name: teamB.trim(), wins: winsB }, restTeam: restTeam.trim() || null, queue: queueList })}
          className="button button--primary button--start"
        >
          เริ่มจัดคิว
        </button>
      </main>
    </div>
  );
}

function QueueScreen({ initial, onReset, theme, onToggleTheme }) {
  const [teamA, setTeamA] = useState(initial.teamA);
  const [teamB, setTeamB] = useState(initial.teamB);
  const [rest, setRest] = useState(initial.rest);
  const [queue, setQueue] = useState(initial.queue);
  const [newTeam, setNewTeam] = useState("");
  const [editing, setEditing] = useState(null);
  const [log, setLog] = useState(initial.log || []);
  const [showLog, setShowLog] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copyState, setCopyState] = useState("default");
  const [moveAnnouncement, setMoveAnnouncement] = useState("");

  // ระบบย้อนกลับ
  const [history, setHistory] = useState(initial.history || []);

  const dragItemIndex = useRef(null);
  const dragOriginIndexRef = useRef(null);
  const dragHistorySavedRef = useRef(false);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const queueListRef = useRef(null);
  const queueItemKeysRef = useRef(new WeakMap());
  const nextQueueItemKeyRef = useRef(0);
  const queueItemNodesRef = useRef(new Map());
  const pendingMoveRef = useRef(null);
  const moveAnimationsRef = useRef(new Map());
  const touchDragNodeRef = useRef(null);
  const desktopDragNodeRef = useRef(null);
  const touchPointerOffsetYRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const touchLayoutOriginYRef = useRef(0);
  const touchTranslateYRef = useRef(0);
  const touchItemHeightRef = useRef(0);
  const touchStartPointRef = useRef(null);
  const touchHoldTimerRef = useRef(null);
  const touchDragActiveRef = useRef(false);
  const reorderQueueRef = useRef(null);
  const desktopPointerOffsetYRef = useRef(0);
  const desktopLayoutOriginYRef = useRef(0);
  const prefersReducedMotionRef = useRef(false);
  const shareDialogRef = useRef(null);
  const resetDialogRef = useRef(null);

  const getQueueItemKey = (team) => {
    let key = queueItemKeysRef.current.get(team);
    if (!key) {
      nextQueueItemKeyRef.current += 1;
      key = `queue-team-${nextQueueItemKeyRef.current}`;
      queueItemKeysRef.current.set(team, key);
    }
    return key;
  };

  useEffect(() => {
    const dialog = shareDialogRef.current;
    if (!dialog) return;
    if (showShare && !dialog.open) {
      setCopyState("default");
      dialog.showModal();
    } else if (!showShare && dialog.open) {
      dialog.close();
    }
  }, [showShare]);

  useEffect(() => {
    const dialog = resetDialogRef.current;
    if (!dialog) return;
    if (showResetConfirm && !dialog.open) dialog.showModal();
    else if (!showResetConfirm && dialog.open) dialog.close();
  }, [showResetConfirm]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => { prefersReducedMotionRef.current = motionQuery.matches; };
    syncMotionPreference();
    motionQuery.addEventListener?.("change", syncMotionPreference);
    return () => motionQuery.removeEventListener?.("change", syncMotionPreference);
  }, []);

  const resetTouchDragStyle = () => {
    const node = touchDragNodeRef.current;
    if (node) {
      node.style.transform = "";
      node.style.position = "";
      node.style.zIndex = "";
      node.style.filter = "";
      node.style.boxShadow = "";
      node.style.transition = "";
      node.style.willChange = "";
    }
    touchDragNodeRef.current = null;
    touchTranslateYRef.current = 0;
    touchItemHeightRef.current = 0;
    touchLayoutOriginYRef.current = 0;
  };

  const handleDragEnd = () => {
    const finalIndex = dragItemIndex.current;
    const originIndex = dragOriginIndexRef.current;
    const activeTeam = finalIndex === null ? null : queue[finalIndex];
    if (dragHistorySavedRef.current && originIndex !== finalIndex && activeTeam) {
      setMoveAnnouncement(`${activeTeam.name} ย้ายไปลำดับ ${finalIndex + 1}`);
      pushLog(`เปลี่ยนลำดับคิว: ${activeTeam.name}`);
    }

    const touchNode = touchDragNodeRef.current;
    const desktopNode = desktopDragNodeRef.current;
    const reduceMotion = prefersReducedMotionRef.current;
    const settleNode = (node, clearNode) => {
      if (!node || reduceMotion || typeof node.animate !== "function") {
        clearNode();
        return;
      }
      const computed = window.getComputedStyle(node);
      const animation = node.animate([
        { transform: node.style.transform || computed.transform, filter: computed.filter, boxShadow: computed.boxShadow },
        { transform: "translate3d(0, 0, 0) scale(1)", filter: "none", boxShadow: "0 0 0 transparent" },
      ], { duration: 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      animation.finished.catch(() => {}).finally(clearNode);
    };

    if (touchNode) settleNode(touchNode, resetTouchDragStyle);
    else resetTouchDragStyle();
    if (desktopDragNodeRef.current) {
      const node = desktopDragNodeRef.current;
      settleNode(node, () => {
        node.style.transform = "";
        node.style.filter = "";
        node.style.boxShadow = "";
        node.style.transition = "";
      });
      desktopDragNodeRef.current = null;
    }
    dragItemIndex.current = null;
    dragOriginIndexRef.current = null;
    dragHistorySavedRef.current = false;
    setDraggingIdx(null);
  };

  // เริ่มลากด้วยการกดค้าง; การขยับก่อนครบเวลาจะปล่อยให้เลื่อนหน้าได้ตามปกติ
  const handleTouchStart = (event, i) => {
    const touch = event.touches[0];
    if (!touch) return;

    window.clearTimeout(touchHoldTimerRef.current);
    touchStartPointRef.current = { x: touch.clientX, y: touch.clientY };
    touchDragActiveRef.current = false;
    touchDragNodeRef.current = event.currentTarget.closest("[data-queue-item]");
    touchHoldTimerRef.current = window.setTimeout(() => {
      const startPoint = touchStartPointRef.current;
      if (!startPoint || !touchDragNodeRef.current) return;
      dragItemIndex.current = i;
      dragOriginIndexRef.current = i;
      dragHistorySavedRef.current = false;
      const dragRect = touchDragNodeRef.current.getBoundingClientRect();
      touchPointerOffsetYRef.current = startPoint.y - dragRect.top;
      lastTouchYRef.current = startPoint.y;
      touchTranslateYRef.current = 0;
      touchItemHeightRef.current = dragRect.height;
      touchLayoutOriginYRef.current = dragRect.top - touchDragNodeRef.current.offsetTop;
      touchDragActiveRef.current = true;
      const reduceMotion = prefersReducedMotionRef.current;
      const dragNode = touchDragNodeRef.current;
      if (dragNode) {
        dragNode.style.position = "relative";
        dragNode.style.zIndex = "3";
        dragNode.style.willChange = "transform, box-shadow";
        dragNode.style.transition = "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease-out";
        dragNode.style.transform = `scale(${reduceMotion ? 1 : 1.1})`;
        dragNode.style.boxShadow = reduceMotion
          ? "none"
          : "0 16px 32px color-mix(in oklch, var(--color-ink) 20%, transparent)";
      }
      setDraggingIdx(i);
    }, 350);
  };

  const handleTouchEnd = () => {
    window.clearTimeout(touchHoldTimerRef.current);
    touchHoldTimerRef.current = null;
    touchStartPointRef.current = null;
    if (touchDragActiveRef.current) handleDragEnd();
    else {
      touchDragNodeRef.current = null;
      dragItemIndex.current = null;
      dragOriginIndexRef.current = null;
      dragHistorySavedRef.current = false;
      setDraggingIdx(null);
    }
    touchDragActiveRef.current = false;
  };

  const handleTouchCancel = () => {
    window.clearTimeout(touchHoldTimerRef.current);
    touchHoldTimerRef.current = null;
    touchStartPointRef.current = null;
    touchDragActiveRef.current = false;
    resetTouchDragStyle();
    dragItemIndex.current = null;
    dragOriginIndexRef.current = null;
    dragHistorySavedRef.current = false;
    setDraggingIdx(null);
  };

  useEffect(() => {
    const el = queueListRef.current;
    if (!el) return;
    const onTouchMove = (e) => {
      const touch = e.touches[0];
      const startPoint = touchStartPointRef.current;
      if (!touch || !startPoint) return;

      if (!touchDragActiveRef.current) {
        const movedX = Math.abs(touch.clientX - startPoint.x);
        const movedY = Math.abs(touch.clientY - startPoint.y);
        if (movedX > 8 || movedY > 8) {
          window.clearTimeout(touchHoldTimerRef.current);
          touchHoldTimerRef.current = null;
          touchStartPointRef.current = null;
          touchDragNodeRef.current = null;
        }
        return;
      }
      if (dragItemIndex.current === null) return;
      e.preventDefault(); // ทำงานได้เพราะ passive:false
      const draggedNode = touchDragNodeRef.current;
      if (draggedNode) {
        const draggedRect = draggedNode.getBoundingClientRect();
        const naturalTop = draggedRect.top - touchTranslateYRef.current + touchItemHeightRef.current * 0.05;
        const draggedTop = touch.clientY - touchPointerOffsetYRef.current;
        const deltaY = draggedTop - naturalTop;
        touchTranslateYRef.current = deltaY;
        const scale = prefersReducedMotionRef.current ? 1 : 1.1;
        // Let the card follow the finger directly after its initial lift.
        draggedNode.style.transition = "box-shadow 140ms ease-out";
        draggedNode.style.transform = `translate3d(0, ${deltaY}px, 0) scale(${scale})`;

        const currentIndex = dragItemIndex.current;
        const items = Array.from(el.querySelectorAll('[data-queue-item]'));
        const pointerTopInList = draggedTop - touchLayoutOriginYRef.current;
        let targetIndex = 0;
        for (let index = 1; index < items.length; index += 1) {
          const midpoint = (items[index - 1].offsetTop + items[index].offsetTop) / 2;
          if (pointerTopInList > midpoint) targetIndex = index;
          else break;
        }
        lastTouchYRef.current = touch.clientY;
        if (targetIndex !== currentIndex) reorderQueueRef.current?.(currentIndex, targetIndex, { duringDrag: true });
      }
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  useLayoutEffect(() => {
    if (touchDragActiveRef.current && touchDragNodeRef.current && queueListRef.current) {
      const draggedNode = touchDragNodeRef.current;
      const draggedRect = draggedNode.getBoundingClientRect();
      const naturalTop = draggedRect.top - touchTranslateYRef.current + touchItemHeightRef.current * 0.05;
      const draggedTop = lastTouchYRef.current - touchPointerOffsetYRef.current;
      const deltaY = draggedTop - naturalTop;
      touchTranslateYRef.current = deltaY;
      const scale = prefersReducedMotionRef.current ? 1 : 1.1;
      draggedNode.style.transform = `translate3d(0, ${deltaY}px, 0) scale(${scale})`;
    }

    const pendingMove = pendingMoveRef.current;
    if (!pendingMove) return;
    pendingMoveRef.current = null;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    pendingMove.firstRects.forEach((firstRect, key) => {
      const node = queueItemNodesRef.current.get(key);
      if (!node || typeof node.animate !== "function") return;
      if (key === pendingMove.excludedKey) return;

      const lastRect = node.getBoundingClientRect();
      const deltaX = firstRect.left - lastRect.left;
      const deltaY = firstRect.top - lastRect.top;
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

      moveAnimationsRef.current.get(key)?.cancel();
      const isMovedTeam = key === pendingMove.movedKey;
      node.style.willChange = "transform, filter, box-shadow";
      if (isMovedTeam) {
        node.style.position = "relative";
        node.style.zIndex = "2";
      }

      const keyframes = isMovedTeam
        ? [
            {
              transform: `translate(${deltaX}px, ${deltaY}px) scale(1.015)`,
              filter: "brightness(1.04)",
              boxShadow: "0 0.75rem 1.5rem color-mix(in oklch, var(--color-ink) 16%, transparent)",
            },
            {
              offset: 0.72,
              filter: "brightness(1.015)",
              boxShadow: "0 0.25rem 0.75rem color-mix(in oklch, var(--color-ink) 8%, transparent)",
            },
            { transform: "translate(0, 0) scale(1)", filter: "brightness(1)", boxShadow: "0 0 0 transparent" },
          ]
        : [
            { transform: `translate(${deltaX}px, ${deltaY}px)` },
            { transform: "translate(0, 0)" },
          ];

      const animation = node.animate(keyframes, {
        duration: 300,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
      moveAnimationsRef.current.set(key, animation);
      animation.finished.catch(() => {}).finally(() => {
        if (moveAnimationsRef.current.get(key) !== animation) return;
        moveAnimationsRef.current.delete(key);
        node.style.willChange = "";
        node.style.position = "";
        node.style.zIndex = "";
      });
    });
  }, [queue]);

  const saveSnapshot = () => {
    setHistory(prev => [
      ...prev.slice(-19),
      { teamA, teamB, rest, queue, log }
    ]);
  };

  const reorderQueue = (fromIndex, toIndex, { duringDrag = false } = {}) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= queue.length) return;
    if (duringDrag) {
      if (!dragHistorySavedRef.current) {
        saveSnapshot();
        dragHistorySavedRef.current = true;
      }
    } else {
      saveSnapshot();
    }
    const nextQueue = [...queue];
    const [movedTeam] = nextQueue.splice(fromIndex, 1);
    nextQueue.splice(toIndex, 0, movedTeam);
    const firstRects = new Map();
    queueItemNodesRef.current.forEach((node, key) => {
      firstRects.set(key, node.getBoundingClientRect());
    });
    if (!duringDrag) resetTouchDragStyle();
    pendingMoveRef.current = {
      firstRects,
      movedKey: duringDrag ? null : getQueueItemKey(movedTeam),
      excludedKey: duringDrag ? getQueueItemKey(movedTeam) : null,
    };
    setQueue(nextQueue);
    if (duringDrag) {
      dragItemIndex.current = toIndex;
      setDraggingIdx(toIndex);
    } else {
      setMoveAnnouncement(`${movedTeam.name} ย้ายไปลำดับ ${toIndex + 1}`);
      pushLog(`เปลี่ยนลำดับคิว: ${movedTeam.name}`);
    }
  };
  reorderQueueRef.current = reorderQueue;

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setTeamA(prev.teamA);
    setTeamB(prev.teamB);
    setRest(prev.rest);
    setQueue(prev.queue);
    setLog(prev.log);
    // sync ref กลับด้วย
    winsRef.current = { A: prev.teamA.wins, B: prev.teamB.wins };
    setHistory(h => h.slice(0, -1));
  };

  const pushLog = (msg) => setLog(prev => [
    { msg, time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) },
    ...prev.slice(0, 29)
  ]);

  // saveEdit เดียว พร้อมบันทึก snapshot
  const saveEdit = (newName) => {
    if (!newName) return;
    saveSnapshot();
    if (editing === "A") { pushLog(`เปลี่ยนชื่อ ${teamA.name} เป็น ${newName}`); setTeamA(p => ({ ...p, name: newName })); }
    else if (editing === "B") { pushLog(`เปลี่ยนชื่อ ${teamB.name} เป็น ${newName}`); setTeamB(p => ({ ...p, name: newName })); }
    else if (editing === "rest" && rest) { pushLog(`เปลี่ยนชื่อ ${rest.name} เป็น ${newName}`); setRest(p => ({ ...p, name: newName })); }
    else if (typeof editing === "number") {
      pushLog(`เปลี่ยนชื่อ ${queue[editing].name} เป็น ${newName}`);
      setQueue(prev => prev.map((t, i) => i === editing ? { ...t, name: newName } : t));
    }
    setEditing(null);
  };

  const winsRef = useRef({ A: initial.teamA.wins || 0, B: initial.teamB.wins || 0 });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      phase: "queue",
      queueData: { teamA, teamB, rest, queue, log, history }
    };
    localStorage.setItem("basketball_queue_v1", JSON.stringify(stateToSave));
  }, [teamA, teamB, rest, queue, log, history]);

  const handleWin = (winner) => {
    saveSnapshot();

    // อ่านจาก ref แทน stateเพื่อให้ได้ค่าล่าสุดเสมอ
    const newWins = winsRef.current[winner] + 1;
    winsRef.current[winner] = newWins;

    const currentWinTeam = winner === "A" ? teamA : teamB;
    const currentLoseTeam = winner === "A" ? teamB : teamA;
    const updatedWinner = { ...currentWinTeam, wins: newWins };

    pushLog(`${updatedWinner.name} ชนะ ${currentLoseTeam.name}`);
    const q = [...queue, { name: currentLoseTeam.name, wins: 0 }];

    if (newWins >= 2) {
      // reset wins ของทีมใหม่ที่จะลงมาแข่ง
      winsRef.current = { A: 0, B: 0 };
      pushLog(`${updatedWinner.name} ชนะ 2 ตาติด → ออกพัก 1 ตา`);

      let courtA, courtB;
      if (rest) {
        pushLog(`${rest.name} พักครบแล้ว → กลับมาเล่น`);
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
      pushLog(`${updatedWinner.name} ชนะ ${newWins} ตา → เล่นต่อ`);

      // reset wins ของฝั่งที่แพ้
      winsRef.current[winner === "A" ? "B" : "A"] = 0;

      let next;
      if (rest) {
        pushLog(`${rest.name} กลับมาแข่ง`);
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
    saveSnapshot();
    const n = newTeam.trim();
    setQueue(prev => [...prev, { name: n, wins: 0 }]);
    pushLog(`เพิ่ม ${n} เข้าคิว`);
    setNewTeam("");
  };

  const removeRest = () => {
    if (!rest) return;
    saveSnapshot();
    pushLog(`${rest.name} เลิกเล่น → ออกจากทีมพัก`);
    setRest(null);
    setEditing(null);
  };

  // ทีมบนคอร์ทอยากเลิกเล่นกลางคัน
  const handleLeave = (leavingSide) => {
    saveSnapshot();
    const leavingTeam = leavingSide === "A" ? teamA : teamB;
    const stayingTeam = leavingSide === "A" ? teamB : teamA;
    const stayingSide = leavingSide === "A" ? "B" : "A";

    pushLog(`${leavingTeam.name} เลิกเล่น → ออกจากคอร์ท`);

    // ทีมที่เหลือ reset wins เพราะเป็นเกมใหม่
    const stayingUpdated = { ...stayingTeam, wins: 0 };
    winsRef.current = { A: 0, B: 0 };

    let next;
    const q = [...queue];
    if (rest) {
      pushLog(`${rest.name} พักครบแล้ว → กลับมาเล่น`);
      next = { ...rest, wins: 0 };
      setRest(null);
    } else {
      next = q.shift() ?? { name: "รอทีม...", wins: 0 };
    }

    if (stayingSide === "A") {
      setTeamA(stayingUpdated);
      setTeamB(next);
    } else {
      setTeamA(next);
      setTeamB(stayingUpdated);
    }
    setQueue(q);
    setEditing(null);
  };

  const openShare = () => {
    const exportData = { teamA, teamB, rest, queue };
    const bytes = new TextEncoder().encode(JSON.stringify(exportData));
    const b64 = btoa(String.fromCharCode(...bytes));
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const origin = window.location.hostname === "localhost"
      ? `https://bikk280-cpu.github.io${base}`
      : `${window.location.origin}${base}`;
    setShareUrl(`${origin}/?shareData=${b64}`);
    setShowShare(true);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("success");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="app-shell">
      <main className="queue-layout">
        <header className="app-header">
          <div className="app-brand-row">
            <div className="brand-block brand-block--compact">
              <BrandMark />
              <div>
                <p className="brand-kicker">COURTSIDE TOOL</p>
                <h1>BASKETBALL QUEUE</h1>
              </div>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
          <div className="app-actions" role="toolbar" aria-label="เครื่องมือจัดคิว">
            <ToolbarAction icon="share" theme={theme} onClick={openShare}>ส่งต่อคิว</ToolbarAction>
            <ToolbarAction icon="undo" theme={theme} onClick={undo} disabled={history.length === 0}>ย้อนกลับ</ToolbarAction>
            <ToolbarAction icon="history" theme={theme} aria-pressed={showLog} onClick={() => setShowLog(value => !value)}>{showLog ? "ซ่อนประวัติ" : "ประวัติ"}</ToolbarAction>
            <ToolbarAction icon="reset" theme={theme} onClick={() => setShowResetConfirm(true)}>เริ่มใหม่</ToolbarAction>
          </div>
        </header>

        {showLog ? (
          <section className="activity-panel" aria-label="ประวัติการจัดคิว">
            {log.length === 0 ? (
              <p className="empty-copy">ยังไม่มีประวัติ</p>
            ) : (
              <ol className="activity-list">
                {log.map((item, index) => (
                  <li key={`${item.time}-${index}`}>
                    <time>{item.time}</time>
                    <span>{item.msg}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ) : null}

        <section className="court-zone" aria-labelledby="court-title">
          <SectionTitle note="ผู้ชนะสองตาติดจะพักหนึ่งตา">
            <span id="court-title">กำลังแข่ง</span>
          </SectionTitle>
          <div className="matchup">
            <div className="match-score">
              {["A", "B"].map(side => {
                const team = side === "A" ? teamA : teamB;
                const isEditing = editing === side;
                return (
                  <article className="score-team" key={side}>
                    {isEditing ? (
                      <InlineEdit value={team.name} onSave={saveEdit} onCancel={() => setEditing(null)} />
                    ) : (
                      <>
                        <div className="score-team__name">
                          <h3>{team.name}</h3>
                          <TextButton label={`แก้ชื่อ ${team.name}`} onClick={() => setEditing(side)}>แก้</TextButton>
                        </div>
                        <div className="team-score">
                          <span>{team.wins}</span>
                          <span>ชนะ</span>
                        </div>
                        <WinDots wins={team.wins} />
                        <div className="score-team__actions">
                          <button type="button" className="button button--primary" aria-label={`บันทึกชัยชนะ ${team.name}`} onClick={() => handleWin(side)}>ชนะ</button>
                          <button type="button" className="button button--secondary match-actions__secondary" aria-label={`เลิกเล่น ${team.name}`} onClick={() => handleLeave(side)}>เลิกเล่น</button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
              <div className="versus" aria-hidden="true"><span />VS<span /></div>
            </div>
          </div>
        </section>

        <section className="rest-strip" aria-labelledby="rest-title">
          <SectionTitle note="พักหนึ่งตา แล้วกลับเข้าสนามอัตโนมัติ">
            <span id="rest-title">ทีมที่พัก</span>
          </SectionTitle>
          {rest ? (
            editing === "rest" ? (
              <div className="rest-team">
                <Avatar name={rest.name} size={36} />
                <InlineEdit value={rest.name} onSave={saveEdit} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <div className="rest-team">
                <Avatar name={rest.name} size={36} />
                <div className="rest-team__copy">
                  <h3>{rest.name}</h3>
                  <p>รออีกหนึ่งตา</p>
                </div>
                <TextButton label={`แก้ชื่อ ${rest.name}`} onClick={() => setEditing("rest")}>แก้</TextButton>
                <TextButton danger label={`นำ ${rest.name} ออกจากทีมพัก`} onClick={removeRest}>เลิกเล่น</TextButton>
              </div>
            )
          ) : (
            <p className="empty-copy">ยังไม่มีทีมพัก</p>
          )}
        </section>

        <section className="queue-zone" aria-labelledby="queue-title">
          <SectionTitle note="กดค้างที่จุดจับแล้วลากเพื่อจัดคิว">
            <span id="queue-title">คิวรอเล่น</span>
          </SectionTitle>
          <div className="panel queue-panel">
            {queue.length === 0 ? <p className="empty-copy">คิวว่าง — เพิ่มทีมได้ด้านล่าง</p> : null}
            <ol ref={queueListRef} className="queue-list">
          {queue.map((team, index) => {
            const queueKey = getQueueItemKey(team);
            return (
            <li
              key={queueKey}
              ref={node => {
                if (node) queueItemNodesRef.current.set(queueKey, node);
                else queueItemNodesRef.current.delete(queueKey);
              }}
              data-queue-item
              draggable
              onDragStart={event => {
                const node = event.currentTarget;
                const rect = node.getBoundingClientRect();
                event.dataTransfer.effectAllowed = "move";
                desktopDragNodeRef.current = node;
                if (!prefersReducedMotionRef.current) {
                  node.style.transform = "scale(1.1)";
                  node.style.boxShadow = "0 16px 32px color-mix(in oklch, var(--color-ink) 20%, transparent)";
                  node.style.transition = "transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease-out";
                }
                event.dataTransfer.setDragImage(node, event.clientX - rect.left, event.clientY - rect.top);
                dragItemIndex.current = index;
                dragOriginIndexRef.current = index;
                dragHistorySavedRef.current = false;
                desktopPointerOffsetYRef.current = event.clientY - rect.top;
                desktopLayoutOriginYRef.current = rect.top - node.offsetTop;
                setDraggingIdx(index);
              }}
              onDragOver={event => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                const activeIndex = dragItemIndex.current;
                if (activeIndex === null) return;
                const items = Array.from(queueListRef.current?.querySelectorAll('[data-queue-item]') || []);
                const draggedTop = event.clientY - desktopPointerOffsetYRef.current;
                const pointerTopInList = draggedTop - desktopLayoutOriginYRef.current;
                let targetIndex = 0;
                for (let itemIndex = 1; itemIndex < items.length; itemIndex += 1) {
                  const midpoint = (items[itemIndex - 1].offsetTop + items[itemIndex].offsetTop) / 2;
                  if (pointerTopInList > midpoint) targetIndex = itemIndex;
                  else break;
                }
                if (targetIndex !== activeIndex) {
                  reorderQueueRef.current?.(activeIndex, targetIndex, { duringDrag: true });
                }
              }}
              onDragEnd={handleDragEnd}
              className={[
                "queue-item",
                index === 0 ? "queue-item--next" : "",
                draggingIdx === index ? "dragging" : "",
              ].join(" ")}
            >
              <button
                type="button"
                className="drag-handle"
                aria-label={`ย้าย ${team.name}; กดค้างแล้วลาก หรือกด Alt พร้อมลูกศรขึ้นหรือลง`}
                title="กดค้างแล้วลากเพื่อย้าย หรือกด Alt พร้อมลูกศรขึ้นลง"
                onTouchStart={event => handleTouchStart(event, index)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                onKeyDown={event => {
                  if (!event.altKey) return;
                  if (event.key === "ArrowUp" && index > 0) {
                    event.preventDefault();
                    reorderQueue(index, index - 1);
                  }
                  if (event.key === "ArrowDown" && index < queue.length - 1) {
                    event.preventDefault();
                    reorderQueue(index, index + 1);
                  }
                }}
              ><GripIcon /></button>
              <span className="queue-position" aria-label={`ลำดับ ${index + 1}`}>{index + 1}</span>
              <Avatar name={team.name} size={43} />
              {editing === index ? (
                <InlineEdit value={team.name} onSave={saveEdit} onCancel={() => setEditing(null)} />
              ) : (
                <>
                  <div className="queue-details">
                    <span className="queue-name">{team.name}</span>
                    {index === 0 ? <span className="next-label">ทีมถัดไป</span> : null}
                  </div>
                  <div className="queue-controls">
                    <TextButton label={`แก้ชื่อ ${team.name}`} onClick={() => setEditing(index)}>แก้</TextButton>
                    <TextButton danger label={`ลบ ${team.name} ออกจากคิว`} onClick={() => {
                      saveSnapshot();
                      setQueue(previous => previous.filter((_, itemIndex) => itemIndex !== index));
                      pushLog(`ลบ ${team.name} ออกจากคิว`);
                    }}>ลบ</TextButton>
                  </div>
                </>
              )}
            </li>
            );
          })}
            </ol>
            <p className="field-label--sr" aria-live="polite" aria-atomic="true">{moveAnnouncement}</p>
            <div className="inline-form inline-form--queue">
              <label className="field-label field-label--sr" htmlFor="new-queue-team">เพิ่มทีมในคิว</label>
              <input id="new-queue-team" className="text-input" value={newTeam} onChange={event => setNewTeam(event.target.value)} onKeyDown={event => event.key === "Enter" && addToQueue()} placeholder="ชื่อทีมใหม่" />
              <button type="button" className="button button--primary" onClick={addToQueue} disabled={!newTeam.trim()}>เพิ่มทีม</button>
            </div>
          </div>
        </section>

      </main>
      <dialog
        ref={shareDialogRef}
        className="share-dialog"
        aria-labelledby="share-title"
        onClose={() => setShowShare(false)}
        onClick={event => { if (event.target === event.currentTarget) setShowShare(false); }}
      >
        <div className="share-dialog__content" onClick={event => event.stopPropagation()}>
          <header>
            <p className="brand-kicker">QUEUE HANDOFF</p>
            <h2 id="share-title">ส่งต่อคิว</h2>
          </header>
          <div className="qr-frame" role="img" aria-label="QR Code สำหรับส่งต่อข้อมูลคิว"><QRCodeSVG value={shareUrl} size={200} /></div>
          <p>ให้เพื่อนสแกน QR Code เพื่อเปิดข้อมูลคิวปัจจุบันบนเครื่องของตัวเอง</p>
          <div className="dialog-actions">
            <button type="button" className="button button--secondary" data-state={copyState} aria-live="polite" onClick={copyShareLink}>
              {copyState === "success" ? "คัดลอกแล้ว" : copyState === "error" ? "คัดลอกไม่สำเร็จ" : "คัดลอกลิงก์"}
            </button>
            <button type="button" className="button button--primary" onClick={() => setShowShare(false)}>ปิด</button>
          </div>
        </div>
      </dialog>
      <dialog
        ref={resetDialogRef}
        className="share-dialog reset-dialog"
        aria-labelledby="reset-title"
        onClose={() => setShowResetConfirm(false)}
        onClick={event => { if (event.target === event.currentTarget) setShowResetConfirm(false); }}
      >
        <div className="share-dialog__content" onClick={event => event.stopPropagation()}>
          <header>
            <p className="brand-kicker">RESET QUEUE</p>
            <h2 id="reset-title">เริ่มใหม่อีกครั้ง?</h2>
          </header>
          <p>ข้อมูลทีมและคิวปัจจุบันจะถูกลบจากอุปกรณ์นี้</p>
          <div className="dialog-actions">
            <button type="button" className="button button--secondary" autoFocus onClick={() => setShowResetConfirm(false)}>ยกเลิก</button>
            <button type="button" className="button button--danger" onClick={onReset}>ยืนยันเริ่มใหม่</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

const LS_KEY = "basketball_queue_v1";
const THEME_KEY = "basketball_theme_v1";

function decodeShareData(rawShareData) {
  if (!rawShareData) return null;
  try {
    const bytes = Uint8Array.from(atob(rawShareData), character => character.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    return { ...decoded, log: [], history: [] };
  } catch (error) {
    console.error("Invalid share data", error);
    return null;
  }
}

export default function App() {
  const rawShareData = new URLSearchParams(window.location.search).get("shareData");
  const sharedConfig = decodeShareData(rawShareData);

  const [config, setConfig] = useState(() => {
    if (sharedConfig) return sharedConfig;
    try { const saved = localStorage.getItem(LS_KEY); if (saved) return JSON.parse(saved).queueData; } catch(e) {}
    return null;
  });

  const [phase, setPhase] = useState(() => {
    if (sharedConfig) return "queue";
    try { const saved = localStorage.getItem(LS_KEY); if (saved) return JSON.parse(saved).phase; } catch(e) {}
    return "setup";
  });

  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    if (rawShareData) window.history.replaceState({}, document.title, window.location.pathname);
  }, [rawShareData]);

  // ถ้า phase=queue แต่ config=null (ลิงก์แชร์เสีย) ให้ fallback ไป setup
  if (phase === "setup" || !config) {
    return <SetupScreen theme={theme} onToggleTheme={() => setTheme(value => value === "dark" ? "light" : "dark")} onStart={cfg => {
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

  return <QueueScreen initial={config} theme={theme} onToggleTheme={() => setTheme(value => value === "dark" ? "light" : "dark")} onReset={() => {
    localStorage.removeItem(LS_KEY);
    setConfig(null); 
    setPhase("setup"); 
  }} />;
}
