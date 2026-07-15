const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Falha ao consultar a API: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

