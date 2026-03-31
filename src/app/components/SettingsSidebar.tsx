import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadSavedSettings() {
  try {
    return JSON.parse(localStorage.getItem("hh-settings") || "{}");
  } catch {
    return {};
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, color: "var(--hh-muted)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, margin: "0 0 10px" }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div style={{ borderTop: "0.5px solid var(--hh-border)", margin: "20px 0" }} />;
}

function Toggle({ label, sublabel, checked, onChange }: any) {
  return (
    <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, cursor: "pointer", gap: 12 }}>
      <span>
        <span style={{ fontSize: 13, color: "var(--hh-text)", display: "block" }}>{label}</span>
        {sublabel && <span style={{ fontSize: 11, color: "var(--hh-muted)" }}>{sublabel}</span>}
      </span>
      <div
        onClick={onChange}
        style={{
          width: 40, height: 22, borderRadius: 11, flexShrink: 0,
          background: checked ? "var(--hh-accent)" : "var(--hh-border)",
          position: "relative", transition: "background 0.2s", cursor: "pointer",
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
    </label>
  );
}

function SelectRow({ label, value, options, onChange }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontSize: 13, color: "var(--hh-text)" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--hh-card)", color: "var(--hh-text)",
          border: "0.5px solid var(--hh-border)", borderRadius: 6,
          padding: "4px 8px", fontSize: 12, cursor: "pointer", outline: "none",
        }}
      >
        {options.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function TimeRow({ label, value, onChange }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontSize: 13, color: "var(--hh-text)" }}>{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--hh-card)", color: "var(--hh-text)",
          border: "0.5px solid var(--hh-border)", borderRadius: 6,
          padding: "4px 8px", fontSize: 12, outline: "none",
        }}
      />
    </div>
  );
}

function DayPicker({ selected, onChange }: any) {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const fullDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      {days.map((d, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            const next = selected.includes(i) ? selected.filter((x: any) => x !== i) : [...selected, i];
            onChange(next);
          }}
          style={{
            width: 30, height: 30, borderRadius: "50%", border: "0.5px solid var(--hh-border)",
            background: selected.includes(i) ? "var(--hh-accent)" : "var(--hh-card)",
            color: selected.includes(i) ? "#000" : "var(--hh-muted)",
            fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
          }}
          title={fullDays[i]}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

function SliderRow({ label, value, min, max, unit, onChange }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--hh-text)" }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--hh-accent)", fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value} step={1}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--hh-accent)" }}
      />
    </div>
  );
}

function ExportButton({ label, sublabel, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        background: "var(--hh-card)", border: "0.5px solid var(--hh-border)",
        borderRadius: 8, padding: "10px 12px", cursor: "pointer", marginBottom: 8,
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--hh-accent)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--hh-border)"}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>
        <span style={{ fontSize: 13, color: "var(--hh-text)", display: "block", textAlign: "left" }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--hh-muted)" }}>{sublabel}</span>
      </span>
    </button>
  );
}

// ─── Section accordion ────────────────────────────────────────────────────────
function Section({ icon, title, children, defaultOpen = false }: any) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: open ? "var(--hh-accent-dim)" : "transparent",
          border: "0.5px solid " + (open ? "var(--hh-accent)" : "var(--hh-border)"),
          borderRadius: 8, padding: "10px 12px", cursor: "pointer",
          color: open ? "var(--hh-accent)" : "var(--hh-text)", transition: "all 0.15s",
          marginBottom: open ? 0 : 4,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500 }}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>} {title}
        </span>
        <span style={{ fontSize: 12, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>
      {open && (
        <div style={{
          background: "var(--hh-card)", border: "0.5px solid var(--hh-border)",
          borderTop: "none", borderRadius: "0 0 8px 8px", padding: "14px 14px 6px",
          marginBottom: 4,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SettingsSidebar({ triggerStyle = {} }: { triggerStyle?: React.CSSProperties }) {
  const saved = loadSavedSettings();
  const [open, setOpen] = useState(false);
  const [saved2, setSaved2] = useState(false);

  // Theme integration with our Context
  const { theme, setTheme, themes: THEMES } = useTheme();

  // Notifications
  const [remindersOn, setRemindersOn] = useState(saved.remindersOn ?? true);
  const [reminderTime, setReminderTime] = useState(saved.reminderTime ?? "08:00");
  const [reminderDays, setReminderDays] = useState(saved.reminderDays ?? [1, 2, 3, 4, 5]);
  const [weeklyEmail, setWeeklyEmail] = useState(saved.weeklyEmail ?? false);
  const [streakAlert, setStreakAlert] = useState(saved.streakAlert ?? true);

  // Display
  const [defaultView, setDefaultView] = useState(saved.defaultView ?? "daily");
  const [weekStart, setWeekStart] = useState(saved.weekStart ?? "sunday");
  const [showStreaks, setShowStreaks] = useState(saved.showStreaks ?? true);
  const [cardSize, setCardSize] = useState(saved.cardSize ?? "comfortable");
  const [showGoalNumbers, setShowGoalNumbers] = useState(saved.showGoalNumbers ?? true);

  // Goals & Tracking
  const [showMissed, setShowMissed] = useState(saved.showMissed ?? true);
  const [gracePeriod, setGracePeriod] = useState(saved.gracePeriod ?? 2);
  const [monthlyTarget, setMonthlyTarget] = useState(saved.monthlyTarget ?? 80);

  // App Behavior
  const [confetti, setConfetti] = useState(saved.confetti ?? true);
  const [sounds, setSounds] = useState(saved.sounds ?? false);
  const [autoAdvance, setAutoAdvance] = useState(saved.autoAdvance ?? false);

  // Accessibility
  const [fontSize, setFontSize] = useState(saved.fontSize ?? "medium");
  const [reduceMotion, setReduceMotion] = useState(saved.reduceMotion ?? false);
  const [highContrast, setHighContrast] = useState(saved.highContrast ?? false);

  function saveAll() {
    const s = {
      remindersOn, reminderTime, reminderDays, weeklyEmail, streakAlert,
      defaultView, weekStart, showStreaks, cardSize, showGoalNumbers,
      showMissed, gracePeriod, monthlyTarget,
      confetti, sounds, autoAdvance,
      fontSize, reduceMotion, highContrast,
    };
    localStorage.setItem("hh-settings", JSON.stringify(s));
    setSaved2(true);
    setTimeout(() => setSaved2(false), 2000);
  }

  function exportCSV() {
    const data = localStorage.getItem("hh-habit-logs") || "date,habit,completed\n";
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "habit-hero-export.csv"; a.click();
  }

  function exportJSON() {
    const data = { habits: [], logs: [], settings: loadSavedSettings() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "habit-hero-export.json"; a.click();
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen(true)}
        title="Settings"
        style={{
          background: "none", border: "0.5px solid var(--hh-border)",
          borderRadius: 8, padding: "6px 10px", cursor: "pointer",
          color: "var(--hh-muted)", fontSize: 16, lineHeight: 1,
          transition: "all 0.15s", ...triggerStyle,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--hh-accent)"; e.currentTarget.style.borderColor = "var(--hh-accent)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--hh-muted)"; e.currentTarget.style.borderColor = "var(--hh-border)"; }}
      >
        ⚙
      </button>

      {/* ── Overlay ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 199, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* ── Sidebar Panel ── */}
      <div style={{
        position: "fixed", top: 0, right: 0,
        height: "100vh", width: 320,
        background: "var(--hh-sidebar)",
        borderLeft: "0.5px solid var(--hh-border)",
        zIndex: 200,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        textAlign: "left"
      }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 18px 14px", borderBottom: "0.5px solid var(--hh-border)", flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--hh-text)", margin: 0 }}>Settings</h2>
            <p style={{ fontSize: 11, color: "var(--hh-muted)", margin: "2px 0 0" }}>Habit Hero preferences</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--hh-muted)", fontSize: 18, lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>

          {/* ── Theme ── */}
          <Section title="Appearance" defaultOpen={true}>
            <SectionLabel>Theme</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {THEMES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{
                    border: `1.5px solid ${theme === t.id ? "var(--hh-accent)" : "var(--hh-border)"}`,
                    borderRadius: 8, padding: "8px 10px", cursor: "pointer",
                    background: theme === t.id ? "var(--hh-accent-dim)" : "var(--hh-card)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
                    {t.swatches.map((c) => (
                      <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: theme === t.id ? "var(--hh-accent)" : "var(--hh-text)" }}>{t.name}</div>
                </div>
              ))}
            </div>
            <SelectRow label="Font size" value={fontSize} onChange={setFontSize}
              options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} />
            <Toggle label="Reduce motion" sublabel="Disables transitions & animations" checked={reduceMotion} onChange={() => setReduceMotion(!reduceMotion)} />
            <Toggle label="High contrast" sublabel="Increases text/border contrast" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
          </Section>

          {/* ── Notifications ── */}
          <Section title="Notifications & Reminders">
            <Toggle label="Daily reminders" sublabel="Get notified to log your habits" checked={remindersOn} onChange={() => setRemindersOn(!remindersOn)} />
            {remindersOn && (
              <>
                <TimeRow label="Reminder time" value={reminderTime} onChange={setReminderTime} />
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: "var(--hh-text)", display: "block", marginBottom: 8 }}>Reminder days</span>
                  <DayPicker selected={reminderDays} onChange={setReminderDays} />
                </div>
              </>
            )}
            <Toggle label="Streak warning" sublabel="Alert if you haven't logged by evening" checked={streakAlert} onChange={() => setStreakAlert(!streakAlert)} />
            <Toggle label="Weekly summary email" sublabel="Progress report every Sunday" checked={weeklyEmail} onChange={() => setWeeklyEmail(!weeklyEmail)} />
          </Section>

          {/* ── Display ── */}
          <Section title="Display & Dashboard">
            <SelectRow label="Default view" value={defaultView} onChange={setDefaultView}
              options={[{ value: "daily", label: "Daily" }, { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }, { value: "analytics", label: "Analytics" }]} />
            <SelectRow label="Week starts on" value={weekStart} onChange={setWeekStart}
              options={[{ value: "sunday", label: "Sunday" }, { value: "monday", label: "Monday" }]} />
            <SelectRow label="Card size" value={cardSize} onChange={setCardSize}
              options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }]} />
            <Toggle label="Show streaks" sublabel="Display streak count on habit cards" checked={showStreaks} onChange={() => setShowStreaks(!showStreaks)} />
            <Toggle label="Show goal numbers" sublabel="Show target on daily view" checked={showGoalNumbers} onChange={() => setShowGoalNumbers(!showGoalNumbers)} />
          </Section>

          {/* ── Goals & Tracking ── */}
          <Section title="Goals & Tracking">
            <Toggle label="Highlight missed days" sublabel="Show red dots on calendar" checked={showMissed} onChange={() => setShowMissed(!showMissed)} />
            <SliderRow label="Grace period for late logging" value={gracePeriod} min={0} max={6} unit="h" onChange={setGracePeriod} />
            <SliderRow label="Monthly success target" value={monthlyTarget} min={10} max={100} unit="%" onChange={setMonthlyTarget} />
          </Section>

          {/* ── App Behavior ── */}
          <Section title="App Behavior">
            <Toggle label="Confetti on completion" sublabel="Celebrate when all habits done" checked={confetti} onChange={() => setConfetti(!confetti)} />
            <Toggle label="Sound effects" sublabel="Subtle sounds on interactions" checked={sounds} onChange={() => setSounds(!sounds)} />
            <Toggle label="Auto-advance habits" sublabel="Jump to next habit after checking off" checked={autoAdvance} onChange={() => setAutoAdvance(!autoAdvance)} />
          </Section>

          {/* ── Data & Account ── */}
          <Section title="Data & Account">
            <SectionLabel>Export your data</SectionLabel>
            <ExportButton icon="📄" label="Export as CSV" sublabel="Spreadsheet-friendly format" onClick={exportCSV} />
            <ExportButton icon="📦" label="Export as JSON" sublabel="Full data backup" onClick={exportJSON} />
            <Divider />
            <SectionLabel>Danger zone</SectionLabel>
            <button
              style={{
                width: "100%", background: "transparent",
                border: "0.5px solid #c0392b", borderRadius: 8,
                color: "#e74c3c", fontSize: 13, padding: "9px 12px",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(231,76,60,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              onClick={() => { if (window.confirm("Delete all habit data? This cannot be undone.")) { localStorage.clear(); window.location.reload(); } }}
            >
              🗑 Delete all data
            </button>
          </Section>

        </div>

        {/* Footer: Save button */}
        <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--hh-border)", flexShrink: 0 }}>
          <button
            onClick={saveAll}
            style={{
              width: "100%", background: saved2 ? "transparent" : "var(--hh-accent)",
              border: saved2 ? "0.5px solid var(--hh-accent)" : "none",
              borderRadius: 8, color: saved2 ? "var(--hh-accent)" : "#000",
              fontSize: 13, fontWeight: 600, padding: "10px",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {saved2 ? "✓ Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </>
  );
}
