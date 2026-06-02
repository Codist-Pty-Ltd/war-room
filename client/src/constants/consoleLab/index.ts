import { INVESTEC_CONSOLE_CHALLENGES } from "./investecConsole";
import { MORE_CONSOLE_CHALLENGES } from "./moreConsoleChallenges";
import { SYSTEM_DESIGN_CHALLENGES } from "./systemDesignChallenges";
import { enrichDesignChallenge } from "./designApproaches";

export const CONSOLE_CHALLENGES = [...INVESTEC_CONSOLE_CHALLENGES, ...MORE_CONSOLE_CHALLENGES];

export const ENRICHED_SYSTEM_DESIGN = SYSTEM_DESIGN_CHALLENGES.map(enrichDesignChallenge);

export const ALL_CHALLENGE_COUNT = {
  console: CONSOLE_CHALLENGES.length,
  systemDesign: ENRICHED_SYSTEM_DESIGN.length,
};

export { SKILL_LESSONS, SKILL_BY_ID } from "./skillTracks";
export { VISUAL_STUDIO_SETUP } from "./visualStudioSetup";
