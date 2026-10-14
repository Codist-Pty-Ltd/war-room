import { useEffect, useState } from "react";
import AppAuthGate from "./components/AppAuthGate";
import Header from "./components/Header";
import BBDMockSession from "./components/BBDMockSession";
import MockConfig from "./components/MockConfig";
import MockSession from "./components/MockSession";
import PlatformSelect from "./components/PlatformSelect";
import ProblemConfig from "./components/ProblemConfig";
import ProblemHistory from "./components/ProblemHistory";
import ProblemView from "./components/ProblemView";
import ScreeningConfig from "./components/ScreeningConfig";
import ScreeningView from "./components/ScreeningView";
import PrepGuide from "./pages/PrepGuide";
import Dashboard from "./pages/Dashboard";
import Certifications from "./pages/Certifications";
import NtokozoMastery from "./pages/NtokozoMastery";
import ConsoleLab from "./pages/ConsoleLab";
import BrainTraining from "./pages/BrainTraining";
import PatternDrill from "./components/PatternDrill";
import { PLATFORMS } from "./constants/platforms";
import { useStats } from "./hooks/useStats";
import { usePracticeTimer } from "./hooks/usePracticeTimer";
import { fetchSummary } from "./services/api";
import { useSessionStore } from "./store/sessionStore";
import type { Language, Platform, Problem } from "./types/domain";

function WarRoomApp() {
  const [screen, setScreen] = useState("platform");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [, setLanguage] = useState<Language | null>(null);
  const problemDetail = useSessionStore((s) => s.problemDetail);
  const practiceMeta = useSessionStore((s) => s.practiceMeta);
  const setPracticeProblem = useSessionStore((s) => s.setPracticeProblem);
  const clearPracticeProblem = useSessionStore((s) => s.clearPracticeProblem);
  const startSession = useSessionStore((s) => s.startSession);
  const resetSession = useSessionStore((s) => s.resetSession);
  const endSession = useSessionStore((s) => s.endSession);
  const [screeningQuestion, setScreeningQuestion] = useState(null);
  const [screeningCategory, setScreeningCategory] = useState(null);
  const [screeningType, setScreeningType] = useState(null);
  const [mockConfig, setMockConfig] = useState(null);
  const [configInitialCategory, setConfigInitialCategory] = useState<string | null>(null);
  const { stats, setStats, markSolved, markHinted, markSkipped } = useStats();
  const timer = usePracticeTimer();

  useEffect(() => {
    fetchSummary()
      .then((data) => {
        setStats({
          solved: data.solved ?? 0,
          skipped: data.skipped ?? 0,
          hinted: data.hinted ?? 0,
          streak: data.streak ?? 0,
        });
      })
      .catch(() => {
        /* non-fatal */
      });
  }, [setStats]);

  const handleNavigate = (
    nextScreen: string,
    config?: { platform?: string; category?: string },
  ) => {
    timer.stop();
    endSession();
    if (nextScreen === "config") {
      clearPracticeProblem();
      setLanguage(null);
    }
    if (config?.platform) {
      const slug = config.platform.toLowerCase();
      const found = PLATFORMS.find(
        (x) =>
          x.id === slug ||
          x.id === config.platform ||
          x.name.toLowerCase() === slug ||
          x.name.replace(/\s/g, "").toLowerCase() === slug.replace(/\s/g, ""),
      );
      if (found) setPlatform(found);
    }
    if (config?.category) setConfigInitialCategory(config.category);
    setScreen(nextScreen);
  };

  const handleDashboard = () => {
    timer.stop();
    endSession();
    setScreen("dashboard");
  };

  const handlePlatformSelect = (nextPlatform: Platform) => {
    setPlatform(nextPlatform);
    setConfigInitialCategory(null);
    setScreen("config");
  };

  const handleBackToPlatforms = () => {
    setPlatform(null);
    clearPracticeProblem();
    resetSession();
    setLanguage(null);
    setConfigInitialCategory(null);
    setScreen("platform");
    timer.stop();
  };

  const handleGenerated = ({
    problem: nextProblem,
    language: nextLanguage,
    category,
    difficulty,
    problemId,
  }: {
    problem: Problem;
    language: Language;
    category: string;
    difficulty: string;
    problemId: number;
  }) => {
    setLanguage(nextLanguage);
    setPracticeProblem(nextProblem, platform!, nextLanguage, category, difficulty, problemId);
    startSession(`practice-${problemId}`);
    setScreen("problem");
    timer.start();
  };

  const handleNextProblem = () => {
    clearPracticeProblem();
    endSession();
    setScreen("config");
    timer.stop();
  };

  const handleViewHistory = () => {
    clearPracticeProblem();
    timer.stop();
    endSession();
    setScreen("history");
  };

  const handlePrepGuide = () => {
    timer.stop();
    setScreen("prep");
  };

  const handleCertifications = () => {
    timer.stop();
    setScreen("certs");
  };

  const handleViewSavedProblem = ({
    problem: savedProblem,
    platform: savedPlatform,
    language: savedLanguage,
    category,
    difficulty,
    problemId,
  }: {
    problem: Problem;
    platform: Platform;
    language: Language;
    category: string;
    difficulty: string;
    problemId: number;
  }) => {
    setPlatform(savedPlatform);
    setLanguage(savedLanguage);
    setPracticeProblem(savedProblem, savedPlatform, savedLanguage, category, difficulty, problemId);
    startSession(`practice-${problemId}`);
    setScreen("problem");
    timer.start();
  };

  const handleScreening = () => {
    setScreeningQuestion(null);
    timer.stop();
    setScreen("screening");
  };

  const handleScreeningGenerated = ({ question, category, type }) => {
    setScreeningQuestion(question);
    setScreeningCategory(category);
    setScreeningType(type);
    setScreen("screeningQuestion");
    timer.start();
  };

  const handleNextScreening = () => {
    setScreeningQuestion(null);
    setScreen("screening");
    timer.stop();
  };

  const handleViewSavedScreening = ({ question, category, type }) => {
    setScreeningQuestion(question);
    setScreeningCategory(category);
    setScreeningType(type);
    setScreen("screeningQuestion");
    timer.start();
  };

  const handleMock = () => {
    setMockConfig(null);
    timer.stop();
    setScreen("mockConfig");
  };

  const handleMockStart = (config) => {
    setMockConfig(config);
    setScreen("mockSession");
  };

  const handleMockFinish = () => {
    setMockConfig(null);
    resetSession();
    setScreen("platform");
  };

  const handleBBD = () => {
    timer.stop();
    setScreen("bbd");
  };

  const handleBBDFinish = () => {
    setScreen("platform");
  };

  const handleMastery = () => {
    timer.stop();
    setScreen("mastery");
  };

  const handleConsoleLab = () => {
    timer.stop();
    setScreen("consoleLab");
  };

  const handleBrainLab = () => {
    timer.stop();
    setScreen("brainLab");
  };

  const handlePatternDrill = () => {
    timer.stop();
    setScreen("patterns");
  };

  return (
    <div
      style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}
    >
      <Header
        stats={stats}
        timer={timer}
        showTimer={screen === "problem" || screen === "screeningQuestion"}
        onDashboard={handleDashboard}
        onHistory={handleViewHistory}
        onHome={handleBackToPlatforms}
        onPrepGuide={handlePrepGuide}
        onCertifications={handleCertifications}
        onScreening={handleScreening}
        onMock={handleMock}
        onBBD={handleBBD}
        onMastery={handleMastery}
        onConsoleLab={handleConsoleLab}
        onBrainLab={handleBrainLab}
        onPatternDrill={handlePatternDrill}
        screen={screen}
      />
      {screen === "certs" && <Certifications onBack={handleBackToPlatforms} />}
      {screen === "prep" && <PrepGuide onNavigate={setScreen} />}
      {screen === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
      {screen === "platform" && (
        <PlatformSelect onSelect={handlePlatformSelect} />
      )}
      {screen === "config" && platform && (
        <ProblemConfig
          platform={platform}
          initialCategory={configInitialCategory}
          onGenerated={handleGenerated}
          onBack={handleBackToPlatforms}
        />
      )}
      {screen === "history" && (
        <ProblemHistory
          onViewProblem={handleViewSavedProblem}
          onViewScreening={handleViewSavedScreening}
          onBack={handleBackToPlatforms}
        />
      )}
      {screen === "problem" && problemDetail && practiceMeta && (
        <ProblemView
          problem={problemDetail}
          platform={practiceMeta.platform}
          language={practiceMeta.language}
          category={practiceMeta.category}
          difficulty={practiceMeta.difficulty}
          problemId={practiceMeta.problemId}
          timer={timer}
          markSolved={markSolved}
          markHinted={markHinted}
          markSkipped={markSkipped}
          onNext={handleNextProblem}
        />
      )}
      {screen === "screening" && (
        <ScreeningConfig
          onGenerated={handleScreeningGenerated}
          onBack={handleBackToPlatforms}
        />
      )}
      {screen === "screeningQuestion" && screeningQuestion && (
        <ScreeningView
          question={screeningQuestion}
          category={screeningCategory}
          type={screeningType}
          timer={timer}
          onNext={handleNextScreening}
        />
      )}
      {screen === "mockConfig" && (
        <MockConfig onStart={handleMockStart} onBack={handleBackToPlatforms} />
      )}
      {screen === "mockSession" && mockConfig && (
        <MockSession config={mockConfig} onFinish={handleMockFinish} />
      )}
      {screen === "bbd" && <BBDMockSession onFinish={handleBBDFinish} />}
      {screen === "mastery" && <NtokozoMastery onBack={handleBackToPlatforms} />}
      {screen === "consoleLab" && <ConsoleLab onBack={handleBackToPlatforms} />}
      {screen === "brainLab" && <BrainTraining onBack={handleBackToPlatforms} />}
      {screen === "patterns" && <PatternDrill onBack={handleBackToPlatforms} />}
    </div>
  );
}

export default function App() {
  return (
    <AppAuthGate>
      <WarRoomApp />
    </AppAuthGate>
  );
}
