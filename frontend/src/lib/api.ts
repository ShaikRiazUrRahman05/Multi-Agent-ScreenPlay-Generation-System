import { getToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!resp.ok) {
    let detail = "Request failed";
    try {
      const data = await resp.json();
      detail = data.detail || JSON.stringify(data);
    } catch {}
    throw new Error(detail);
  }
  return (await resp.json()) as T;
}

// Auth
export function apiSignup(payload: { firstName: string; lastName: string; email: string; password: string }) {
  return request<{ access_token: string; token_type: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiLogin(payload: { email: string; password: string }) {
  return request<{ access_token: string; token_type: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Profile
export function apiGetProfile() {
  return request<any>("/api/profile/me");
}

export function apiUpdateProfile(payload: Partial<{ firstName: string; lastName: string; phone: string; location: string; bio: string; profession: string; company: string }>) {
  return request<any>("/api/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function apiUpdateApiSettings(payload: { useOwnKey: boolean; openaiKey?: string; keyActive: boolean }) {
  return request<any>("/api/profile/me/api-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Script
export function apiRun(payload: { user_input: string; user_action?: string; target_scene?: number }) {
  return request<{ outline: string; characters: string; dialogues: string[]; final_script: string }>("/api/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


