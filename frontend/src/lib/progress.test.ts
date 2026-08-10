import { describe, expect, it } from "vitest";

import { getLevelStatus } from "./progress";
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
  it("usa o estado autoritativo devolvido pela API", () => {
    expect(getLevelStatus(greetings)).toBe("available");
    expect(getLevelStatus({ ...alphabet, status: "locked" })).toBe("locked");
  });

  it("preserva o estado completed sem recalculá-lo no cliente", () => {
    expect(getLevelStatus({ ...greetings, status: "completed" })).toBe("completed");
  });
});
