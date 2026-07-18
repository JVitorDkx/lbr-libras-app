import { describe, expect, it } from "vitest";

import { completeLevel, getLevelStatus, initialProgress, levelForXp, xpThresholdForLevel } from "./progress";
import type { GameLevel } from "../types/game";

const greetings: GameLevel = {
  id: "cumprimentos",
  order: 1,
  title: "Cumprimentos",
  description: "Sinais iniciais",
  status: "available",
  accent: "violet",
  category: "Princípios básicos",
  icon_key: "hands",
  progress_percent: 80,
  reward_xp: 250,
  question_count: 4,
  prerequisite_level_id: null,
};

const alphabet: GameLevel = {
  ...greetings,
  id: "alfabeto",
  order: 2,
  title: "Alfabeto",
  accent: "cyan",
  prerequisite_level_id: "cumprimentos",
};

describe("progresso da trilha", () => {
  it("mantém o primeiro nível disponível e o seguinte bloqueado", () => {
    expect(getLevelStatus(greetings, initialProgress)).toBe("available");
    expect(getLevelStatus(alphabet, initialProgress)).toBe("locked");
  });

  it("soma XP uma única vez e desbloqueia o nível seguinte", () => {
    const completed = completeLevel(initialProgress, greetings);
    const repeated = completeLevel(completed, greetings);

    expect(completed.xp).toBe(250);
    expect(getLevelStatus(greetings, completed)).toBe("completed");
    expect(getLevelStatus(alphabet, completed)).toBe("available");
    expect(repeated).toBe(completed);
  });

  it("usa limites cumulativos crescentes para os níveis", () => {
    expect(xpThresholdForLevel(2)).toBe(100);
    expect(xpThresholdForLevel(3)).toBe(250);
    expect(levelForXp(249)).toBe(2);
    expect(levelForXp(250)).toBe(3);
  });
});
