const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { signal });

  if (!response.ok) {
    throw new Error(`Falha ao consultar a API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar dados para a API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function resolveMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const apiOrigin = API_URL.replace(/\/api\/?$/, "");
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}
