import { describe, expect, it } from "vitest";

import { buildApiUrl, normalizeApiBaseUrl } from "./api";

describe("configuração da API", () => {
  it("usa a API local quando a variável não foi definida", () => {
    expect(normalizeApiBaseUrl(undefined)).toBe("http://127.0.0.1:8001/api");
  });

  it("remove espaços e barras finais da URL de produção", () => {
    expect(normalizeApiBaseUrl(" https://api.exemplo.com/api/// ")).toBe(
      "https://api.exemplo.com/api",
    );
  });

  it("monta endpoints com uma única barra separadora", () => {
    expect(buildApiUrl("https://api.exemplo.com/api/", "game/levels")).toBe(
      "https://api.exemplo.com/api/game/levels",
    );
  });
});
