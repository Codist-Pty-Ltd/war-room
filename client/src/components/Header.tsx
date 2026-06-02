import { Fragment, useContext, useState } from "react";
import { AuthSurfaceContext } from "../context/AuthSurfaceContext";
import GuestPassesModal from "./GuestPassesModal";

export default function Header({
  stats,
  timer,
  showTimer,
  onDashboard,
  onHistory,
  onHome,
  onPrepGuide,
  onCertifications,
  onScreening,
  onMock,
  onBBD,
  onMastery,
  onConsoleLab,
  onBrainLab,
  screen,
}) {
  const authSurface = useContext(AuthSurfaceContext);
  const [guestPassesOpen, setGuestPassesOpen] = useState(false);

  const navBtnStyle = (active, accent = "#00ff88") => ({
    background: "transparent",
    border: "none",
    color: active ? accent : "#444",
    fontSize: "10px",
    letterSpacing: "2px",
    cursor: "pointer",
    padding: "4px 8px",
    fontWeight: active ? 700 : 400,
    fontFamily: "inherit",
  });

  return (
    <Fragment>
    <header
      style={{
        borderBottom: "1px solid #1e1e2e",
        padding: "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#0d0d16",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
          rowGap: "8px",
        }}
      >
        <button
          type="button"
          onClick={onHome}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span
            style={{
              color: "#00ff88",
              fontWeight: 700,
              letterSpacing: "3px",
              fontFamily: "inherit",
            }}
          >
            ⬡ WAR ROOM
          </span>
        </button>
        <span style={{ color: "#333", fontSize: "10px" }}>│</span>
        <button
          type="button"
          onClick={onDashboard}
          style={navBtnStyle(screen === "dashboard")}
        >
          DASHBOARD
        </button>
        <button
          type="button"
          onClick={onHome}
          style={navBtnStyle(
            screen === "platform" ||
              screen === "config" ||
              screen === "problem",
          )}
        >
          PRACTICE
        </button>
        <button
          type="button"
          onClick={onHistory}
          style={navBtnStyle(screen === "history")}
        >
          HISTORY
        </button>
        <button
          type="button"
          onClick={onPrepGuide}
          style={navBtnStyle(screen === "prep")}
        >
          PREP GUIDE
        </button>
        <button
          type="button"
          onClick={onCertifications}
          style={navBtnStyle(screen === "certs", "#0078d4")}
        >
          CERTS
        </button>
        <button
          type="button"
          onClick={onScreening}
          style={navBtnStyle(
            screen === "screening" || screen === "screeningQuestion",
          )}
        >
          SCREENING
        </button>
        <button
          type="button"
          onClick={onMock}
          style={navBtnStyle(
            screen === "mockConfig" || screen === "mockSession",
          )}
        >
          MOCK
        </button>
        <button
          type="button"
          onClick={onBBD}
          style={{
            ...navBtnStyle(screen === "bbd", "#2196f3"),
            color: screen === "bbd" ? "#2196f3" : "#2196f3",
            fontWeight: 700,
            border: screen === "bbd" ? "1px solid #2196f3" : "1px solid #2196f355",
            borderRadius: "4px",
            padding: "4px 10px",
            background: screen === "bbd" ? "#2196f322" : "#2196f310",
          }}
        >
          BBD PREP
        </button>
        <button
          type="button"
          onClick={onBrainLab}
          style={{
            ...navBtnStyle(screen === "brainLab", "#ff9f43"),
            color: "#ff9f43",
            fontWeight: 700,
            border:
              screen === "brainLab" ? "1px solid #ff9f43" : "1px solid #ff9f4355",
            borderRadius: "4px",
            padding: "4px 10px",
            background: screen === "brainLab" ? "#ff9f4322" : "#ff9f4310",
          }}
        >
          BRAIN LAB
        </button>
        <button
          type="button"
          onClick={onConsoleLab}
          style={{
            ...navBtnStyle(screen === "consoleLab", "#00e5a0"),
            color: screen === "consoleLab" ? "#00e5a0" : "#00e5a0",
            fontWeight: 700,
            border:
              screen === "consoleLab" ? "1px solid #00e5a0" : "1px solid #00e5a055",
            borderRadius: "4px",
            padding: "4px 10px",
            background: screen === "consoleLab" ? "#00e5a022" : "#00e5a010",
          }}
        >
          CONSOLE LAB
        </button>
        <button
          type="button"
          onClick={onMastery}
          style={{
            ...navBtnStyle(screen === "mastery", "#bf7fff"),
            color: screen === "mastery" ? "#bf7fff" : "#bf7fff",
            fontWeight: 700,
            border:
              screen === "mastery" ? "1px solid #bf7fff" : "1px solid #bf7fff55",
            borderRadius: "4px",
            padding: "4px 10px",
            background: screen === "mastery" ? "#bf7fff22" : "#bf7fff10",
          }}
        >
          ◇ NTOKOZO
        </button>
        {authSurface?.role === "super" ? (
          <button
            type="button"
            onClick={() => setGuestPassesOpen(true)}
            style={navBtnStyle(false, "#0078d4")}
          >
            GUEST PASSES
          </button>
        ) : null}
        {authSurface?.authRequired ? (
          <button
            type="button"
            onClick={() => void authSurface.signOut()}
            style={navBtnStyle(false, "#ff5e7a")}
          >
            SIGN OUT
          </button>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          gap: "20px",
          fontSize: "12px",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#00ff88" }}>✓ {stats.solved}</span>
        <span style={{ color: "#ff9f00" }}>💡 {stats.hinted}</span>
        <span style={{ color: "#ff5e7a" }}>✕ {stats.skipped}</span>
        {stats.streak > 1 && (
          <span style={{ color: "#ffe066" }}>🔥 {stats.streak}</span>
        )}
        {showTimer && timer.active && (
          <span
            style={{ color: "#00cfff", fontVariantNumeric: "tabular-nums" }}
          >
            ⏱ {timer.format()}
          </span>
        )}
      </div>
    </header>
    {guestPassesOpen ? <GuestPassesModal onClose={() => setGuestPassesOpen(false)} /> : null}
    </Fragment>
  );
}
