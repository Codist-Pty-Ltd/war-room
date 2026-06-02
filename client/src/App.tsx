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
import { PLATFORMS } from "./constants/platforms";
import { useStats } from "./hooks/useStats";
import { useTimer } from "./hooks/useTimer";
import { fetchSummary } from "./services/api";
import type { Language, Platform, Problem } from "./types/domain";

function WarRoomApp() {
  const [screen, setScreen] = useState("platform");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [language, setLanguage] = useState<Language | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [screeningQuestion, setScreeningQuestion] = useState(null);
  const [screeningCategory, setScreeningCategory] = useState(null);
  const [screeningType, setScreeningType] = useState(null);
  const [mockConfig, setMockConfig] = useState(null);
  const [configInitialCategory, setConfigInitialCategory] = useState<string | null>(null);
  const [attemptCategory, setAttemptCategory] = useState("");
  const [attemptDifficulty, setAttemptDifficulty] = useState("");
  const [attemptProblemId, setAttemptProblemId] = useState<number | undefined>(undefined);
  const { stats, setStats, markSolved, markHinted, markSkipped } = useStats();
  const timer = useTimer();

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
    if (nextScreen === "config") {
      setProblem(null);
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
    setScreen("dashboard");
  };

  const handlePlatformSelect = (nextPlatform: Platform) => {
    setPlatform(nextPlatform);
    setConfigInitialCategory(null);
    setScreen("config");
  };

  const handleBackToPlatforms = () => {
    setPlatform(null);
    setProblem(null);
    setLanguage(null);
    setConfigInitialCategory(null);
    setAttemptCategory("");
    setAttemptDifficulty("");
    setAttemptProblemId(undefined);
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
    setProblem(nextProblem);
    setLanguage(nextLanguage);
    setAttemptCategory(category);
    setAttemptDifficulty(difficulty);
    setAttemptProblemId(problemId);
    setScreen("problem");
    timer.start();
  };

  const handleNextProblem = () => {
    setProblem(null);
    setAttemptCategory("");
    setAttemptDifficulty("");
    setAttemptProblemId(undefined);
    setScreen("config");
    timer.stop();
  };

  const handleViewHistory = () => {
    setProblem(null);
    timer.stop();
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
    setProblem(savedProblem);
    setPlatform(savedPlatform);
    setLanguage(savedLanguage);
    setAttemptCategory(category);
    setAttemptDifficulty(difficulty);
    setAttemptProblemId(problemId);
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
      {screen === "problem" && problem && platform && language && (
        <ProblemView
          problem={problem}
          platform={platform}
          language={language}
          category={attemptCategory}
          difficulty={attemptDifficulty}
          problemId={attemptProblemId}
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
